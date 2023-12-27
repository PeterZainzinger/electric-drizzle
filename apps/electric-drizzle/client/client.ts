import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  DbSchema,
  ElectricClient,
  type TableSchema,
} from 'electric-sql/client/model';
import migrations from './migrations';
import { allTables, allTablesWithInfo } from './tables';

function buildTableSchemas() {
  const res: Record<string, any> = {};
  for (const [tableName] of Object.entries(allTablesWithInfo)) {
    const table = allTables[tableName as keyof typeof allTables];
    const tableInfo =
      allTablesWithInfo[tableName as keyof typeof allTablesWithInfo];
    res[tableInfo.name.name] = {
      fields: new Map(
        tableInfo.columns.map((e) => [e.name, e.type.name])
      ) as any,
      relations: [],
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
        })
        .strict(),
      upsertSchema: z.any(),
      findUniqueSchema: z.any(),
      updateManySchema: z.any(),
      deleteSchema: z.any(),
      deleteManySchema: z.any(),
    };
  }
  return res;
}

export const tableSchemas = buildTableSchemas();

export const schema = new DbSchema(tableSchemas as any, migrations);
export type Electric = ElectricClient<typeof schema>;