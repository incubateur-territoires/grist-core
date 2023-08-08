import { Client } from "minio";
import { program, Option } from "commander";
import fs from "fs/promises";
import path from "path";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

// FIXME rather use addOption with Option constructor, which seems cleaner
program
  .addOption(
    new Option("-b, --bucket <bucket>", "the name of the bucket")
      .makeOptionMandatory()
      .env("GRIST_DOCS_MINIO_BUCKET")
  )
  .addOption(
    new Option("-e, --endpoint <endpoint>", "the endpoint of the S3 API")
      .makeOptionMandatory()
      .env("GRIST_DOCS_MINIO_ENDPOINT")
  )
  .addOption(
    new Option("-a, --accesskey <accessKey>", "the access key")
      .makeOptionMandatory()
      .env("GRIST_DOCS_MINIO_ACCESS_KEY")
  )
  .addOption(
    new Option(
      "-d, --datadir <datadir>",
      "The local path to the document"
    ).makeOptionMandatory()
  )
  .addOption(
    new Option("-s, --secretkey <secretKey>", "the secret key")
      .makeOptionMandatory()
      .env("GRIST_DOCS_MINIO_SECRET_KEY")
  )
  .addOption(
    new Option("--region <region>", "the region of the bucket").env(
      "GRIST_DOCS_MINIO_BUCKET_REGION"
    )
  )
  .addOption(
    new Option("--prefix <prefix>", "the prefix for the files").env(
      "GRIST_DOCS_MINIO_PREFIX"
    )
  )
  .addOption(
    new Option("--port <port>", "the port of the S3 API")
      .env("GRIST_DOCS_MINIO_PORT")
      .argParser(parseInt)
  );
// TODO
// .option(
//   "--no-ssl",
//   "do not connect to the S3 API using ssl",
//   ["0", "false"].includes(String(process.env.GRIST_DOCS_MINIO_USE_SSL))
// );

program.parse();
const opts = program.opts();
console.log("options : \n", opts);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const client = new Client({
    accessKey: opts.accesskey,
    secretKey: opts.secretkey,
    endPoint: opts.endpoint,
    port: parseInt(opts.port, 10),
    region: opts.region,
    useSSL: !opts.noSsl,
  });
  const answer = await question(
    "OK to run the migration to S3 (be sure that your backup exist!!!) [y/N] "
  );
  if (answer.toLowerCase() !== "y") {
    console.log("Quit");
    process.exit();
  }

  for (const file of await fs.readdir(opts.datadir)) {
    if (path.extname(file) === ".grist") {
      const remoteFilePath = `${opts.prefix}/${file}`;
      console.log(`Uploading ${remoteFilePath}...`);
      await client.fPutObject(
        opts.bucket,
        remoteFilePath,
        path.join(opts.datadir, file)
      );
    }
  }
  console.log("DONE ! 🎉");
}

main();
