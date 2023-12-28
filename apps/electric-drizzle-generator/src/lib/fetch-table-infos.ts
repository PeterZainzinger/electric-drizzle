import { Client } from 'pg';
import * as http from 'http';
import { GenerateSchemaArgs } from './generator_args';
import { fetchMigrationInfo } from './fetch-migration-infos';

export type AllTableInfos = Awaited<ReturnType<typeof fetchTableInfos>>;

export async function fetchTableInfos(
  args: Pick<GenerateSchemaArgs, 'proxy_url' | 'service'>
) {
  const { proxy_url } = args;

  const client = new Client(proxy_url);

  console.log('Connecting to proxy...');
  await client.connect();
  console.log('Connected to proxy');
  const { rows } = await client.query<{
    schema_name: string;
    table_name: string;
  }>('SELECT schema_name,table_name from electric.electrified;');
  console.log('Found electrified tables:');
  console.table(rows);

  const { rows: schemaRows } = await client.query<{
    schema: {
      tables: TableInfo[];
    };
    version: string;
  }>(
    'SELECT schema.schema, migration_ddl,version from electric.schema order by id; '
  );

  const lastSchema = schemaRows[schemaRows.length - 1];
  const tablesElectrified = lastSchema.schema.tables.filter((e) => {
    const electrified = rows.find(
      (r) => r.table_name === e.name.name && r.schema_name === e.name.schema
    );
    return electrified !== undefined;
  });

  // query migration version

  const { rows: versionRows } = await client.query<{
    version: string;
  }>(
    'SELECT version from electric.migration_versions order by inserted_at desc limit 1;'
  );
  if (versionRows.length === 0) {
    throw new Error('No migration version found');
  }

  const migrationVersion = versionRows[0].version;

  console.log('Disconnecting from proxy...');
  await client.end();
  console.log('Disconnected from proxy');

  const migrationStatements = await fetchMigrationInfo(args);

  return {
    migrationVersion,
    migrationStatements,
    table: tablesElectrified,
  };
}

export type ColumnType = {
  name: string;
  type: {
    name: string;
  };
  constraints: {
    notNull?: {};
  };
};

export type TableInfo = {
  name: {
    name: string;
    schema: string;
  };
  columns: ColumnType[];
  constraints: {
    primary?: {
      keys: string[];
      name: string;
    };
    foreign?: {
      name: string;
      fkCols: string[];
      pkCols: string[];
      pkTable: {
        name: string;
        schema: string;
      };
      onDelete: string;

    }

  }[];
};
