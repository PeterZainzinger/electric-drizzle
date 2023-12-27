import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Client } from 'pg';
import { z } from 'zod';
import { fetchTableInfos } from './lib/fetch-table-infos';
import { generateSchemaArgs, GenerateSchemaArgs } from './lib/generator_args';

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
}
