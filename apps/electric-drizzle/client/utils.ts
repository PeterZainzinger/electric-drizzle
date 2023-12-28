import { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export function buildValidationSchemaForTable<T extends SQLiteTable>(table: T) {
  return {
    modelSchema: createSelectSchema(table).partial(),
    createSchema: z
      .object({
        select: createSelectSchema(table).optional(),
        data: createInsertSchema(table),
      })
      .strict(),
    createManySchema: z
      .object({
        data: z.union([
          createInsertSchema(table),
          createInsertSchema(table).array(),
        ]),
        skipDuplicates: z.boolean().optional(),
      })
      .strict() as any,
    updateSchema: z
      .object({
        select: createSelectSchema(table).optional(),
        data: createInsertSchema(table).partial(),
        where: z.any(),
      })
      .strict() as any,
    findSchema: z
      .object({
        select: z.any().optional(),
        where: z.any().optional(),
        orderBy: z.union([z.any().array(), z.any()]).optional(),
        cursor: z.any().optional(),
        take: z.number().optional(),
        skip: z.number().optional(),
        distinct: z.union([z.any(), z.any().array()]).optional(),
        include: z.any().optional(),
      })
      .strict(),
    upsertSchema: z.any(),
    findUniqueSchema: z.any(),
    updateManySchema: z.any(),
    deleteSchema: z.any(),
    deleteManySchema: z.any(),
  } as const;
}
