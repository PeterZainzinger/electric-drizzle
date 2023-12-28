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
import {
  DbSchema,
  ElectricClient,
  Relation,
  type TableSchema,
} from 'electric-sql/client/model';

  `;
  };
  const relationMap = buildRelationMap(info.table);
  const infos = info.table.map(generateTable);
  return `
  ${imports(infos.flatMap((e) => e.types))}

  ${infos.map((e) => e.text).join('\n\n')}

  export const allTables = {${info.table.map((e) => tableName(e)).join(', ')}};

  export const schema = new DbSchema({
   ${info.table.map((e) => buildSchemaForTable(e, relationMap)).join('\n')}
  }, migrations);

  `;
}

function buildSchemaForTable(table: TableInfo, relationMap: RelationMap) {
  return `
   ${table.name.name}: {
    fields: new Map([
  ${table.columns.map((e) => {
    return `["${e.name}", ${mapDataType(e.type.name)}]`;
  })}
    ]),
    ...buildValidationSchemaForTable(${tableName(table)}),
    relations: [
    ${
      relationMap[table.name.name]
        ?.map((e) => `new Relation(${e.map((e) => `"${e}"`).join(',')})`)
        .join(',\n') || ''
    }
    ]
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

function mapDataType(type: string) {
  return `"${type.toUpperCase()}" as any`;
}

type Relation = [string, string, string, string, string, 'one' | 'many'];

type RelationMap = Record<string, Relation[]>;

function buildRelationMap(infos: TableInfo[]) {
  const table2Relations: RelationMap = {};

  function addRelation(table: string, relation: Relation) {
    if (!table2Relations[table]) {
      table2Relations[table] = [];
    }
    table2Relations[table].push(relation);
  }

  for (const tableInfo of infos) {
    const targetTable = tableInfo.name.name;
    const foreignKeys = tableInfo.constraints
      .map((e) => e.foreign)
      .filter((e) => e)
      .map((e) => e!);
    for (const key of foreignKeys) {
      const sourceTable = key.pkTable.name;

      const relationName = relationNameBuilder(key.name);

      const fieldName = fieldBuilder(key.fkCols[0]);

      addRelation(targetTable, [
        fieldName,
        key.fkCols[0],
        key.pkCols[0],
        sourceTable,
        relationName,
        'one',
      ]);

      const isUnique =
        foreignKeys.filter((e) => e.pkTable.name === sourceTable).length <= 1;
      const reverseRelationName = isUnique
        ? targetTable
        : `${targetTable}${key.fkCols
            .flatMap((e) =>
              e
                .split('_')
                .filter((e) => e !== 'id')
                .map(capitalizeFirstLetter)
            )
            .join('')}`;
      addRelation(sourceTable, [
        reverseRelationName,
        '',
        '',
        targetTable,
        relationName,
        'many',
      ]);
    }
  }

  return table2Relations;
}

function relationNameBuilder(constraintName: string) {
  return constraintName
    .split('_')
    .filter((p) => p !== 'fkey')
    .filter((p) => p !== 'id')
    .map((p) => capitalizeFirstLetter(p))
    .join('');
}

function fieldBuilder(name: string) {
  return unCapitalizeFirstLetter(
    name
      .split('_')
      .filter((p) => p !== 'id')
      .map((p) => capitalizeFirstLetter(p))
      .join('')
  );
}

const prefix = 'table';

function tableName(table: TableInfo) {
  return prefix + capitalizeFirstLetter(table.name.name);
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function unCapitalizeFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
