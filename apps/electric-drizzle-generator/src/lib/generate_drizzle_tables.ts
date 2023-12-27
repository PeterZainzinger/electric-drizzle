import { AllTableInfos, ColumnType, TableInfo } from './fetch-table-infos';
import { postgres2sqlite } from './type_mappings';

export function generateDrizzleTables(info: AllTableInfos) {
  const imports = (types: string[]) => {
    const uniqueTypes = [...new Set(types)];
    const typesJoined = uniqueTypes.join(', ');
    return `
  import { sqliteTable, ${typesJoined} } from 'drizzle-orm/sqlite-core';
  `;
  };
  const infos = info.table.map(generateTable);
  return `
  ${imports(infos.flatMap((e) => e.types))}

  ${infos.map((e) => e.text).join('\n\n')}

  export const allTables = {${info.table.map((e) => tableName(e)).join(', ')}};
  export const allTablesWithInfo = {${info.table
    .map((e) => {
      const table = tableName(e);
      return table + ': ' + JSON.stringify(e, null, 2);
    })
    .join(', ')}
  }`;
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
