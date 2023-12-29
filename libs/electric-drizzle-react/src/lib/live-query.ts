/* eslint-disable @typescript-eslint/no-explicit-any */
import { SQLiteSelect } from 'drizzle-orm/sqlite-core/index';
import { SelectResult } from 'drizzle-orm/query-builders/select.types';
import { Statement } from 'electric-sql/dist/util';
import type { LiveResultContext } from 'electric-sql/dist/client/model/model';
import { useMemo } from 'react';
import { useLiveQuery } from 'electric-sql/react';

import { SQLiteRelationalQuery } from 'drizzle-orm/sqlite-core/query-builders/query';
import { unwrapJsonValue } from './utils';
import { mapRelationalRow } from 'drizzle-orm';

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

export function curryUseDrizzleLive(db: {
  liveRaw(sql: Statement): LiveResultContext<any>;
}) {
  return function <T extends SQLiteSelect<string, any, any, any, any>>(
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
  };
}

type RunLiveResult<T extends SQLiteRelationalQuery<any, any>> =
  T extends SQLiteRelationalQuery<any, infer R> ? R : never;

export function curryUseDrizzleRelationalLive(db: {
  liveRaw(sql: Statement): LiveResultContext<any>;
}) {
  return function <T extends SQLiteRelationalQuery<any, any>>(
    rawQuery: T
  ): RunLiveResult<T> | undefined {
    const [selectQuery, rawQueryUnsafe] = useMemo(() => {
      return [
        rawQuery.toSQL(),
        // @ts-expect-error(accessing private property)
        rawQuery._toSQL(),
      ];
    }, [rawQuery]);
    const { results } = useLiveQuery(
      db.liveRaw({
        sql: selectQuery.sql,
        args: selectQuery.params as any,
      })
    );
    const resultsSafe = results || [];
    const unwrapped = Array.isArray(resultsSafe)
      ? resultsSafe.map(unwrapJsonValue)
      : resultsSafe;
    const queryAny = rawQuery as any;
    return unwrapped.map((row: any) => {
      const keys = Object.keys(row);
      const rowRaw = keys.map((key) => row[key]);
      return mapRelationalRow(
        queryAny.schema,
        queryAny.tableConfig,
        rowRaw,
        rawQueryUnsafe.query.selection,
        (e) => e
      );
    });
  };
}
