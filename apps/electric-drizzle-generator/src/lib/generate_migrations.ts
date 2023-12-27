import { Statement } from './copied/util';
import { AllTableInfos, TableInfo } from './fetch-table-infos';
import { generateTableTriggers, Table } from './copied/triggers';
import { postgres2sqlite } from './type_mappings';

export function generateAllMigrations(info: AllTableInfos) {
  const triggers = info.table
    .map(generateTriggersForTable)
    .flat()
    .map((stmt) => stmt.sql);

  return {
    statements: [...info.migrationStatements, ...triggers] as string[],
    version: info.migrationVersion,
  };
}

function generateTriggersForTable(tbl: TableInfo): Statement[] {
  const table = {
    tableName: tbl.name.name,
    namespace: 'main',
    columns: tbl.columns.map((col) => col.name),
    primary: tbl.constraints.find((e) => e.primary).primary.keys,
    /*
    // TODO(peter): support foreign keys
    foreignKeys: tbl
      .map((fk) => {
      if (fk.fkCols.length !== 1 || fk.pkCols.length !== 1)
        throw new Error(
          'Satellite does not yet support compound foreign keys.'
        );
      return {
        table: fk.pkTable,
        childKey: fk.fkCols[0],
        parentKey: fk.pkCols[0],
      };
    }),
     */
    foreignKeys: [],
    columnTypes: Object.fromEntries(
      tbl.columns.map((col) => {
        const sqliteType =
          postgres2sqlite[
            col.type.name.toLowerCase() as keyof typeof postgres2sqlite
          ];
        if (!sqliteType) throw new Error(`Unknown type ${col.type.name} `);
        return [
          col.name,
          {
            sqliteType,
            pgType: col.type.name.toUpperCase(),
          },
        ];
      })
    ),
  } satisfies Table;
  const fullTableName = table.namespace + '.' + table.tableName;
  return generateTableTriggers(fullTableName, table);
}
