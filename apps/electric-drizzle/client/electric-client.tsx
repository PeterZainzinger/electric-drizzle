import { ElectricClient } from 'electric-sql/client/model';
import { allTables, schema } from './tables';
import { setupElectricWithDrizzle } from '@electric-drizzle/electric-drizzle-react';
import InitElectric from '../_components/InitElectric';
import { authToken } from './auth';

export type Electric = ElectricClient<typeof schema>;

const setup = setupElectricWithDrizzle({
  schema,
  dbName: `basic-v-10.db`,
  config: {
    auth: {
      token: authToken(),
    },
    url: 'ws://localhost:5133',
  },
  loadingComponent: <InitElectric />,
  schemaTypes: allTables,
});

export const ElectricProvider = setup.ElectricProvider;
export const useElectric = setup.useElectric;
export const useDrizzleDB = setup.useDrizzleDB;
export const useDrizzleLiveQuery = setup.useDrizzleLiveQuery;
export const useDrizzleRelationalLiveQuery = setup.useDrizzleRelationalLiveQuery;
