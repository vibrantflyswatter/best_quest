import fs from 'mz/fs';
import debug from 'debug';
import { makeName, getResponse, writeToFile } from './common';
import { fetchResources } from './resources';

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/

export default (url, outputDir) => {
  const log = debug('page-loader:');
  const resourcesDir = makeName(url, outputDir, '_files');
  const htmlFileName = makeName(url, outputDir, '.html');
  log('Starting %s', 'page-loader');
  console.log('Url: ', url);
  console.log('Page will be saved to: ', outputDir);

  return fs.mkdir(resourcesDir)
    .then(() => getResponse(url))
    .then(htmlPage => fetchResources(htmlPage, url, resourcesDir, htmlFileName))
    .then(dataColl => Promise.all(dataColl.map(el => writeToFile(el.data, el.location, el.type))))
    .catch(err => log(`Err: ${err.message}`));
};
