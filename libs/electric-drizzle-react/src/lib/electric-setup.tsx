/* eslint-disable @typescript-eslint/no-explicit-any */
import { DbSchema, ElectricClient } from 'electric-sql/dist/client/model';
import { ElectricConfig } from 'electric-sql/dist/config';
import { ElectrifyOptions } from 'electric-sql/dist/electric';
import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { makeElectricContext } from 'electric-sql/react';

import { ElectricDatabase, electrify } from 'electric-sql/wa-sqlite';

import { SqliteRemoteDatabase } from 'drizzle-orm/sqlite-proxy';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { unwrapJsonValue } from './utils';
import {
  curryUseDrizzleLive,
  curryUseDrizzleRelationalLive,
} from './live-query';

type SetupArgs<
  T_DB extends DbSchema<any>,
  T_SCHEMA extends Record<string, unknown>
> = {
  schema: T_DB;
  dbName: string;
  config: ElectricConfig;
  opts?: ElectrifyOptions;
  loadingComponent: ReactNode;
  schemaTypes: T_SCHEMA;
};

type ElectricDrizzle<TSchema extends Record<string, unknown>> =
  | {
      loaded: true;
      db: SqliteRemoteDatabase<TSchema>;
    }
  | {
      loaded: false;
    };

export function setupElectricWithDrizzle<
  T extends DbSchema<any>,
  TSchema extends Record<string, unknown>
>(args: SetupArgs<T, TSchema>) {
  const { ElectricProvider, useElectric } =
    makeElectricContext<ElectricClient<T>>();

  const ElectricDrizzleContext = createContext<ElectricDrizzle<TSchema>>({
    loaded: false,
  });

  const ElectricProviderWrapper: FC<
    React.ComponentProps<typeof ElectricProvider>
  > = ({ children }) => {
    const [electric, setElectric] = useState<ElectricClient<T>>();

    useEffect(() => {
      let isMounted = true;

      const init = async () => {
        const conn = await ElectricDatabase.init(args.dbName, '');
        const electric = await electrify(
          conn,
          args.schema,
          args.config,
          args.opts
        );
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

    const drizzleDb = useMemo(() => {
      if (!electric) return null;
      return drizzle(
        async (sql, params, method) => {
          const rows = await electric.db.raw({
            sql: sql,
            args: params,
          });
          if (method === 'run') {
            electric.satellite.notifier.potentiallyChanged();
          }
          return {
            rows: rows.map(unwrapJsonValue),
          };
        },
        {
          schema: args.schemaTypes,
          logger: true,
        }
      );
    }, [electric]);

    if (!electric || !drizzleDb) {
      return args.loadingComponent;
    }

    return (
      <ElectricProvider db={electric}>
        <ElectricDrizzleContext.Provider
          value={{ loaded: true, db: drizzleDb }}
        >
          {children}
        </ElectricDrizzleContext.Provider>
      </ElectricProvider>
    );
  };

  const useDrizzleDB = () => {
    const rawContext = useContext(ElectricDrizzleContext);
    if (!rawContext.loaded) {
      throw new Error('Drizzle DB not wrapped');
    }
    return rawContext.db;
  };

  const useElectricWrapped = () => {
    const electric = useElectric();
    if (!electric) {
      throw new Error('Electric not wrapped');
    }
    return electric;
  };

  return {
    useElectric: useElectricWrapped,
    useDrizzleDB,
    ElectricProvider: ElectricProviderWrapper,
    useDrizzleLiveQuery: (() => {
      const electric = useElectric();
      return curryUseDrizzleLive(electric!.db);
    })(),
    useDrizzleRelationalLiveQuery: (() => {
      const electric = useElectric();
      return curryUseDrizzleRelationalLive(electric!.db);
    })(),
  };
}
