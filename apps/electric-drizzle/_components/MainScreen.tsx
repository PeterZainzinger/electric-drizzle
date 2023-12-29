'use client';
import { CommentsList } from './CommentList';
import React from 'react';
import DbWrapper from './DbWrapper';

export default function MainScreen() {
  return (
    <DbWrapper>
      <CommentsList />
    </DbWrapper>
  );
}
