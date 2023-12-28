'use client';
import React, { useEffect, useMemo, useState } from 'react';

import { makeElectricContext, useLiveQuery } from 'electric-sql/react';
import { genUUID } from 'electric-sql/util';
import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';

import { authToken } from './auth';
import { Electric, schema } from '../client/client';
import { drizzleBuilder } from '../client/drizzle';
import { tableComments } from '../client/tables';

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

const ExampleComponent = () => {
  const { db, satellite } = useElectric()!;
  const drizzleDb = useMemo(() => drizzleBuilder(db, satellite), [db]);
  const selectQuery = useMemo(
    () => drizzleDb.select().from(tableComments).toSQL(),
    [db]
  );
  const { results } = useLiveQuery(
    db.liveRaw({
      sql: selectQuery.sql,
      args: selectQuery.params as any,
    })
  );

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const shape = await db.comments.sync({});

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
      {items.map((item: any, index: number) => (
        <p key={index} className="item">
          <code>{item.text}</code>
        </p>
      ))}
    </div>
  );
};
