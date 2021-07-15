#!/usr/bin/env node
/* eslint no-console:off */

import { program } from 'commander';
import { bootstrap } from './main';

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
    .parse(process.argv);

  const { command } = prog.opts();

  await bootstrap({
    command,
  });
};

main().catch(console.error);
