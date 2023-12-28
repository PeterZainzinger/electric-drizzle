/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useMemo, useState } from 'react';

import { makeElectricContext, useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';

import { authToken } from './auth';
import { Electric } from '../client/client';
import { drizzleBuilder, unwrapJsonValue } from '../client/drizzle';
import { schema, tableComments, tableReactions } from '../client/tables';
import { SQLiteSelect } from 'drizzle-orm/sqlite-core';
import { Statement } from 'electric-sql/dist/util';
import { LiveResultContext } from 'electric-sql/dist/client/model/model';
import { SelectResult } from 'drizzle-orm/query-builders/select.types';
import { eq, sql } from 'drizzle-orm';
import { SQLiteRelationalQuery } from 'drizzle-orm/sqlite-core/query-builders/query';

const { ElectricProvider, useElectric } = makeElectricContext<Electric>();

export const Example = () => {
  const [electric, setElectric] = useState<Electric>();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const config = {
        auth: {
          token: authToken(),
        },
        url: 'ws://localhost:5133',
      };

      const scopedDbName = `basic-v-10.db`;

      const conn = await ElectricDatabase.init(scopedDbName, '');
      const electric = await electrify(conn, schema, config);
      console.info('electric', electric);
      if (!isMounted) {
        return;
      }

      setElectric(electric);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  if (electric === undefined) {
    return null;
  }

  return (
    <ElectricProvider db={electric}>
      <ExampleComponent />
    </ElectricProvider>
  );
};

type RunResult<T extends SQLiteSelect<any, any, any, any, any>> =
  T extends SQLiteSelect<
    any,
    any,
    any,
    infer TSelection,
    infer TSelectMode,
    infer TNullabilityMap
  >
    ? SelectResult<TSelection, TSelectMode, TNullabilityMap>
    : never;

function useDrizzleLive<
  const T extends SQLiteSelect<string, any, any, any, any>
>(
  db: {
    liveRaw(sql: Statement): LiveResultContext<any>;
  },
  rawQuery: T
): RunResult<T>[] | undefined {
  const selectQuery = useMemo(() => rawQuery.toSQL(), [rawQuery]);
  const { results } = useLiveQuery(
    db.liveRaw({
      sql: selectQuery.sql,
      args: selectQuery.params as any,
    })
  );
  return results as any;
}

type RunLiveResult<T extends SQLiteRelationalQuery<any, any>> =
  T extends SQLiteRelationalQuery<any, infer R> ? R : never;

function useDrizzleRelationalLive<
  const T extends SQLiteRelationalQuery<any, any>
>(
  db: {
    liveRaw(sql: Statement): LiveResultContext<any>;
  },
  rawQuery: T
): RunLiveResult<T> | undefined {
  const selectQuery = useMemo(() => rawQuery.toSQL(), [rawQuery]);
  const { results } = useLiveQuery(
    db.liveRaw({
      sql: selectQuery.sql,
      args: selectQuery.params as any,
    })
  );

  const unwrapped = Array.isArray(results)
    ? results.map(unwrapJsonValue)
    : results;
  return unwrapped as any;
}

const ExampleComponent = () => {
  const { db, satellite } = useElectric()!;
  const drizzleDb = useMemo(() => drizzleBuilder(db, satellite), [db]);
  const rawQuery = useMemo(() => {
    const countReactions = drizzleDb
      .select({
        commentId: tableReactions.comment_id,
        count: sql<number>`count(
                ${tableReactions.id}
                )`
          .mapWith(Number)
          .as('count'),
      })
      .from(tableReactions)
      .groupBy(tableReactions.comment_id)
      .as('reactionCounts');

    return drizzleDb
      .select({
        id: tableComments.id,
        text: tableComments.text,
        count: countReactions.count,
      })
      .from(tableComments)
      .leftJoin(countReactions, eq(countReactions.commentId, tableComments.id));
  }, [drizzleDb]);

  const queryRelational = useMemo(
    () =>
      drizzleDb.query.tableComments.findMany({
        with: {
          reactions: {
            columns: {
              text: true,
            },
          },
        },
      }),
    [drizzleDb]
  );

  const results = useDrizzleLive(db, rawQuery);

  const relationalResult = useDrizzleRelationalLive(db, queryRelational);
  console.log('relationalResult', relationalResult);

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.comments.sync({
        include: {
          image: true,
          imageAlt: true,
          reactions: true,
        },
      });

      // Resolves when the data has been synced into the local database.
      await shape.synced;
    };

    syncItems();
  }, []);

  const addItem = async () => {
    await drizzleDb.insert(tableComments).values({
      id: genUUID(),
      text: 'drizzle comment',
    });
  };

  const clearItems = async () => {
    //await db.comments.deleteMany();
    await drizzleDb.delete(tableComments).execute();
  };

  const items = results ?? [];

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      {items.map((item, index: number) => (
        <p key={index} className="item">
          <code>
            {item.text} - {item.count || 'none'}
          </code>

          <button
            onClick={async () => {
              await drizzleDb.insert(tableReactions).values({
                id: genUUID(),
                comment_id: item.id!,
                text: 'like',
              });
            }}
          >
            Click me
          </button>
        </p>
      ))}
      <br />
      <br />
      <br />
      <br />
      Relational Result
      {relationalResult?.map((comment) => (
        <div key={comment.id}>
          <p>{comment.text}</p>
          <p>{JSON.stringify(comment.reactions, null, 2)}</p>
        </div>
      ))}
    </div>
  );
};
