import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { fetchTableInfos } from './lib/fetch-table-infos';
import { generateSchemaArgs, GenerateSchemaArgs } from './lib/generator_args';
import { generateAllMigrations } from './lib/generate_migrations';
import * as fs from 'fs/promises';
import * as path from 'path';

if (typeof require !== 'undefined' && require.main === module) {
  yargs(hideBin(process.argv))
    .command(
      'generate',
      '\t\tGenerate electric drizzle code',
      () => {},
      async (argv) => {
        const argsParsed = generateSchemaArgs.parse(argv);
        await generate(argsParsed);
      }
    )
    .option('output', {
      demandOption: true,
      alias: 'o',
      type: 'string',
      description: 'output directory',
    })
    .option('service', {
      demandOption: true,
      alias: 's',
      type: 'string',
      description: 'service url',
    })
    .option('proxy_url', {
      demandOption: true,
      alias: 'p',
      type: 'string',
      description: 'postgres connection string for proxy',
    })
    .demandCommand(1)
    .parse();
}

async function generate(args: GenerateSchemaArgs) {
  const tableInfos = await fetchTableInfos(args);
  const migrations = generateAllMigrations(tableInfos);

  const migrationsFile = path.join(args.output, 'migrations.ts');
  const dir = path.dirname(migrationsFile);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    migrationsFile,
    `export default ${JSON.stringify(migrations, null, 2)}`
  );
}
