'use client';
import { ElectricProvider } from '../client/electric-client';
import { CommentsList } from './CommentList';

export default function MainScreen() {
  return (
    <ElectricProvider>
      <CommentsList />
    </ElectricProvider>
  );
}
