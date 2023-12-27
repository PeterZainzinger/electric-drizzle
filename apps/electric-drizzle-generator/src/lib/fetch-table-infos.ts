import { Client } from 'pg';
import { GenerateSchemaArgs } from './generator_args';

export async function fetchTableInfos(
  args: Pick<GenerateSchemaArgs, 'proxy_url'>
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
    migration_ddl: string;
  }>('SELECT schema.schema, migration_ddl from electric.schema order by id; ');
  const migrationStatements = schemaRows.map((e) => e.migration_ddl);
  const lastSchema = schemaRows[schemaRows.length - 1];
  const tablesElectrified = lastSchema.schema.tables.filter((e) => {
    const electrified = rows.find(
      (r) => r.table_name === e.name.name && r.schema_name === e.name.schema
    );
    return electrified !== undefined;
  });

  console.log('Disconnecting from proxy...');
  await client.end();
  console.log('Disconnected from proxy');

  return {
    migrationStatements,
    table: tablesElectrified,
  };
}

export type TableInfo = {
  name: {
    name: string;
    schema: string;
  };
  columns: {
    type: {
      name: string;
    };
    constraints: {
      notNull?: {};
    };
  }[];
  constraints: {
    primary?: {
      keys: string[];
      name: string;
    };
  };
};
