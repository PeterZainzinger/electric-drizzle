import { setupDB } from '../client/electric-client';
import React, { useEffect, useState } from 'react';
import { uncurry2NoArg } from '@electric-drizzle/electric-drizzle-react';
import { authToken } from '../client/auth';
import InitElectric from './InitElectric';

export default function DbWrapper(props: { children: React.ReactNode }) {
  const [setup, setSetup] = useState<DBSetup>();

  useEffect(() => {
    setupDB({ token: authToken() }).then(setSetup);
  }, []);

  if (!setup) {
    return <InitElectric />;
  }

  const { ElectricProvider, ...rest } = setup;

  return (
    <ElectricProvider>
      <DBReactContext.Provider value={rest}>
        {props.children}
      </DBReactContext.Provider>
    </ElectricProvider>
  );
}

type DBSetup = Awaited<ReturnType<typeof setupDB>>;

type DBContext = Omit<DBSetup, 'ElectricProvider'>;

const DBReactContext = React.createContext<DBContext | null>(null);

export const useElectric = () => {
  const context = React.useContext(DBReactContext);
  if (!context)
    throw new Error('useElectric must be used within a DBReactContext');
  return context.useElectric();
};

export const useDrizzleDB = () => {
  const context = React.useContext(DBReactContext);
  if (!context)
    throw new Error('useElectric must be used within a DBReactContext');
  return context.useDrizzleDB();
};

export const useDrizzleLiveQuery = uncurry2NoArg(() => {
  const context = React.useContext(DBReactContext);
  if (!context)
    throw new Error('useElectric must be used within a DBReactContext');
  return context.useDrizzleLiveQuery;
});

export const useDrizzleRelationalLiveQuery = uncurry2NoArg(() => {
  const context = React.useContext(DBReactContext);
  if (!context)
    throw new Error('useElectric must be used within a DBReactContext');
  return context.useDrizzleRelationalLiveQuery;
});
