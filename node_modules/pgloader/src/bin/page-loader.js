#! /usr/bin/env node

import program from 'commander';
import * as app from '../../package.json';
import loadPage from '../';

program
  .version(app.version)
  .description('This program downloads resourse by given URL and save it to the local dir')
  .option('-o, --output [path]', 'directory to save downloaded page')
  .arguments('<url>')
  .action((url) => {
    const outputDir = program.output || process.cwd();
    loadPage(url, outputDir);
  });

program.parse(process.argv);
