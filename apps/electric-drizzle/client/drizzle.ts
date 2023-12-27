import { drizzle } from 'drizzle-orm/sqlite-proxy';

import { ElectricClient } from 'electric-sql/client/model';
import { Satellite } from 'electric-sql/dist/satellite';
import { allTables, tableComments } from './tables';

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
        rows: rows,
      };
    },
    {
      schema: allTables,
      logger: true,
    }
  );
};
