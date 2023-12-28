import * as fs from 'fs';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import * as fsPromise from 'fs/promises';
import { GenerateSchemaArgs } from './generator_args';
import decompress from 'decompress';
import { load } from 'protobufjs';

export type MigrationInfo = {
  version: string;
  statements: { sql: string; table: string }[];
};

export async function fetchMigrationInfo(
  args: Pick<GenerateSchemaArgs, 'service'>
): Promise<MigrationInfo[]> {
  const { service } = args;

  const { path: downloadDir, tempDir } = await downloadAndUnzipFile(
    service + '/api/migrations?dialect=sqlite'
  );

  const versions = await fsPromise.readdir(downloadDir);

  const protoSchema = await load(
    path.join(path.join(__dirname, '..', 'assets'), 'satellite.proto')
  );

  const SatOpMigrate = protoSchema.lookupType(
    'Electric.Satellite.SatOpMigrate'
  );

  const res = await Promise.all(
    versions.map(async (dir) => {
      const metadata = JSON.parse(
        await fsPromise.readFile(
          path.join(downloadDir, dir, 'metadata.json'),
          'utf-8'
        )
      );
      const ops = metadata.ops.map(
        (op) =>
          SatOpMigrate.decode(Buffer.from(op, 'base64')) as unknown as {
            stmts: { sql: string }[];
            table: {
              name: string;
            };
          }
      );
      return {
        version: dir,
        statements: (
          await fsPromise.readFile(
            path.join(downloadDir, dir, 'migration.sql'),
            'utf-8'
          )
        )
          .split('\n\n')
          .map((e, i) => ({ sql: e, table: ops[i].table.name })),
      } satisfies MigrationInfo;
    })
  );

  await fsPromise.rm(tempDir, { recursive: true, force: true });

  return res;
}

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(outputPath);

    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download file. Status Code: ${response.statusCode}`
          )
        );
        return;
      }

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  });
}

async function downloadAndUnzipFile(url: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'download-'));
  const downloadPath = path.join(tempDir, 'downloaded.zip');
  const unzipPath = path.join(tempDir, 'unzipped');

  await downloadFile(url, downloadPath);
  console.log(`File downloaded to ${downloadPath}`);
  const unzippedFiles = await decompress(downloadPath, unzipPath);

  console.log(`File downloaded and unzipped to ${unzipPath}`);
  return {
    tempDir,
    path: unzipPath,
    files: unzippedFiles,
  };
}
