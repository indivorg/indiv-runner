#!/usr/bin/env node
/* eslint no-console:off */

import { exec } from 'child_process';
import { program } from 'commander';
import { runner } from './main';

const main = async () => {
  const prog = program
    .name('indiv-runner')
    .description(
      'port-forwards all services, creates environment file and starts the service',
    )
    .option(
      '-r, --command <command>',
      'a command to run after runner has started e.g. yarn run dev',
    )
    .option('-n, --namespace <namespace>', 'namespace to run', 'indiv-prod')
    .option(
      '--config-map <name>',
      'which configmap to look for services',
      'service-env-config',
    )
    .parse(process.argv);

  const { command, namespace, configMap } = prog.opts();
  const env = await runner({ namespace, configMap });

  if (command) {
    console.log(`Running command: ${command}\n`);
    const cmd = exec(command, { env: { ...env, ...process.env } });

    cmd.stdout.on('data', (d) => process.stdout.write(d));
    cmd.stderr.on('data', (d) => process.stderr.write(d));

    cmd.on('exit', (code) => {
      console.log('child process exited with code ' + code.toString());
      process.exit(code);
    });
  }
};

main().catch(console.error);
