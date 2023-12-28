/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { FC, useEffect, useMemo } from 'react';
import { genUUID } from 'electric-sql/util';
import {
  useDrizzleDB,
  useDrizzleLiveQuery,
  useDrizzleRelationalLiveQuery,
  useElectric,
} from '../client/electric-client';
import { tableComments, tableReactions } from '../client/tables';
import { eq, sql } from 'drizzle-orm';

export const CommentsList: FC = () => {
  const { db } = useElectric()!;
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

  const drizzleDb = useDrizzleDB();
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

  const results = useDrizzleLiveQuery()(rawQuery);

  const relationalResult = useDrizzleRelationalLiveQuery()(queryRelational);

  const addItem = async () => {
    await drizzleDb.insert(tableComments).values({
      id: genUUID(),
      text: 'drizzle comment',
    });
  };

  const clearItems = async () => {
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
                comment_id: item.id,
                text: 'like',
              });
            }}
          >
            Add Like
          </button>

          <button
            onClick={async () => {
              await drizzleDb
                .delete(tableComments)
                .where(eq(tableComments.id, item.id));
            }}
          >
            Remove
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
