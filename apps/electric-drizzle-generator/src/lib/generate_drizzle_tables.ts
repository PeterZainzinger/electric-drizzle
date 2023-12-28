import { AllTableInfos, ColumnType, TableInfo } from './fetch-table-infos';
import { postgres2sqlite } from './type_mappings';

export function generateDrizzleTables(info: AllTableInfos) {
  const imports = (types: string[]) => {
    const uniqueTypes = [...new Set(types)];
    const typesJoined = uniqueTypes.join(', ');
    return `
import { sqliteTable, ${typesJoined} } from 'drizzle-orm/sqlite-core';
import migrations from './migrations';
import { buildValidationSchemaForTable } from './utils';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  DbSchema,
  ElectricClient,
  Relation,
  type TableSchema,
} from 'electric-sql/client/model';
import {
  PgBasicType,
  PgDateType,
} from 'electric-sql/dist/client/conversions/types';

  `;
  };
  const infos = info.table.map(generateTable);
  return `
  ${imports(infos.flatMap((e) => e.types))}

  ${infos.map((e) => e.text).join('\n\n')}

  export const allTables = {${info.table.map((e) => tableName(e)).join(', ')}};

  export const schema = new DbSchema({
   ${info.table.map(buildSchemaForTable).join('\n')}
  }, migrations);

  `;
}

function buildSchemaForTable(table: TableInfo) {
  return `
   ${table.name.name}: {
    fields: new Map([
  ${table.columns.map((e) => {
    return `["${e.name}", ${mapDataType(e.type.name)}]`;
  })}
    ]),
    ...buildValidationSchemaForTable(${tableName(table)}),
    relations: []
   },
  `;
}

function generateTable(table: TableInfo) {
  const columns = table.columns.map(generateColumn);
  return {
    text: `
export const ${tableName(table)} = sqliteTable('${table.name.name}', {
  ${columns.map((e) => e.text).join(',\n  ')}
})
`,
    types: columns.map((e) => e.type),
  };
}

function generateColumn(col: ColumnType) {
  const mappedType = postgres2sqlite[col.type.name];
  if (!mappedType) {
    throw new Error(`Unknown type ${col.type.name} `);
  }

  return {
    text: `${col.name}: ${mappedType}('${col.name}')`,
    type: mappedType,
  };
}

const prefix = 'table';

function tableName(table: TableInfo) {
  return prefix + capitalizeFirstLetter(table.name.name);
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapDataType(type: string) {
  function isDateDataType(type: string) {
    const keys = ['TIMESTAMP', 'TIMESTAMPTZ', 'DATE', 'TIME', 'TIMETZ'];
    return keys.includes(type);
  }

  const dateType = isDateDataType(type.toUpperCase());

  const prefix = dateType ? 'PgDateType' : 'PgBasicType';
  return `${prefix}.PG_${type.toUpperCase()}`;
}
