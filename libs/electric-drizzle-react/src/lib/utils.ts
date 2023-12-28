/* eslint-disable @typescript-eslint/no-explicit-any */
import { Row } from 'electric-sql/dist/util';

export function unwrapJsonValue<T extends Row>(row: T): Row {
  if (!row) return row;

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
