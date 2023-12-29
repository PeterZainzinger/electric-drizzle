import { AllTableInfos, ColumnType, TableInfo } from './fetch-table-infos';
import { postgres2sqlite } from './type_mappings';

export function generateDrizzleTables(info: AllTableInfos) {
  const imports = (types: string[]) => {
    const uniqueTypes = [...new Set(types)];
    const typesJoined = uniqueTypes.join(', ');
    return `
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sqliteTable, ${typesJoined} } from 'drizzle-orm/sqlite-core';
import migrations from './migrations';
import { buildValidationSchemaForTable } from './utils';
import {
  DbSchema,
  Relation,
} from 'electric-sql/client/model';
import { relations } from 'drizzle-orm';

  `;
  };
  const relationMap = buildRelationMap(info.table);
  const types = info.table.map(generateTable).flatMap((e) => e.types);
  return `
  ${imports(types)}

  ${info.table
    .map((table) => {
      const { relation } = buildRelations(table, relationMap);
      const { text } = generateTable(table);
      return text + '\n' + relation;
    })
    .join('\n\n')}

  export const allTables = {${info.table
    .flatMap((e) => [tableName(e), relationName(e)])
    .join(', ')}};

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
  const notNullConstraints =
    col.constraints
      ?.map((e) => e.notNull)
      ?.filter((e) => e)
      ?.map((e) => e!) || [];

  const modifiers = [];
  if (notNullConstraints.length > 0) {
    modifiers.push('.notNull()');
  }

  return {
    text: `${col.name}: ${mappedType}('${col.name}')${modifiers.join()}`,
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

function buildRelations(tableInfo: TableInfo, relationMap: RelationMap) {
  const relationSqliteName = relationName(tableInfo);
  const tableNameSqlite = tableName(tableInfo);

  const relations = relationMap[tableInfo.name.name] || [];

  return {
    relationsName: relationSqliteName,
    relation: `
export const ${relationSqliteName} = relations(${tableNameSqlite},({ one, many }) => ({
  ${relations
    .map((e) => {
      const [fieldName, fkCol, pkCol, targetTable, relationName, type] = e;

      return `${fieldName}: ${type}(${tableName(targetTable)}, {
      ${
        type === 'one'
          ? `
      fields: [${tableName(tableInfo.name.name)}.${fkCol}],
      references: [${tableName(targetTable)}.${pkCol}], `
          : ''
      }
        relationName: '${relationName}',
        })`;
    })
    .join(',\n')}

}));
     `,
  };
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

function tableName(table: TableInfo | string) {
  const prefix = 'table';
  return (
    prefix +
    capitalizeFirstLetter(typeof table === 'string' ? table : table.name.name)
  );
}

function relationName(table: TableInfo) {
  const prefix = 'relations';
  return prefix + capitalizeFirstLetter(table.name.name);
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function unCapitalizeFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
