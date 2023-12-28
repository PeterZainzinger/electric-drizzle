/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/sqlite-proxy';

import { ElectricClient } from 'electric-sql/client/model';
import { Satellite } from 'electric-sql/dist/satellite';
import { allTables } from './tables';
import { Row } from 'electric-sql/dist/util';

export const drizzleBuilder = (
  electric: ElectricClient<any>['db'],
  satellite: Satellite
) => {
  return drizzle(
    async (sql, params, method) => {
      const rows = await electric.raw({
        sql: sql,
        args: params,
      });
      if (method === 'run') {
        satellite.notifier.potentiallyChanged();
      }
      return {
        rows: rows.map(unwrapJsonValue),
      };
    },
    {
      schema: allTables,
      logger: true,
    }
  );
};

function unwrapJsonValue<T extends Row>(row: T): Row {
  const newRow: Partial<T> = {};
  for (const [keyInput, value] of Object.entries(row)) {
    const key = keyInput as keyof T;
    if (
      typeof value === 'string' &&
      (value.startsWith('{') || value.startsWith('['))
    ) {
      try {
        newRow[key] = JSON.parse(value);
      } catch (e) {
        newRow[key] = value as any;
      }
    } else {
      newRow[key] = value as any;
    }
  }
  return newRow as T;
}
