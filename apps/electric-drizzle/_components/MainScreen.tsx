'use client';
import { ElectricProvider, useElectric } from '../client/electric-client';
import { useEffect } from 'react';
import { CommentsList } from './CommentList';

export default function MainScreen() {

  return (
    <ElectricProvider>
      <CommentsList />
    </ElectricProvider>
  );
}
