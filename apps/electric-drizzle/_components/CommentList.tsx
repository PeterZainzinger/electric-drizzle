/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { FC, useMemo } from 'react';
import { genUUID } from 'electric-sql/util';
import {
  useDrizzleDB,
  useDrizzleLiveQuery,
  useDrizzleRelationalLiveQuery,
} from '../client/electric-client';
import { tableComments, tableReactions } from '../client/tables';
import { eq, sql } from 'drizzle-orm';

export const CommentsList: FC = () => {
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

  const results = useDrizzleLiveQuery(rawQuery);

  const relationalResult = useDrizzleRelationalLiveQuery(queryRelational);

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
