'use client';
import { ElectricProvider, useElectric } from '../client/electric-client';
import { useEffect } from 'react';
import { CommentsList } from './CommentList';

export default function MainScreen() {
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
  return (
    <ElectricProvider>
      <CommentsList />
    </ElectricProvider>
  );
}
