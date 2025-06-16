import url from 'url';
import nodePath from 'path';
import fs from 'mz/fs';
import axios from 'axios';
import debug from 'debug';

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/
const log = debug('page-loader:');

const makeName = (uri, dir, type) => {
  const { host, path } = url.parse(uri);
  const name = `${host || ''}${path}`.replace(/\W/g, '-');
  return `${dir}${nodePath.sep}${name}${type}`;
};

const getResponse = (url, responseType) => {
  log(`GET ${url} Response type: ${responseType}`);
  return axios({ method: 'get', url, responseType })
    .then((response) => {
      log('Data received successfully');
      return response.data;
    })
    .catch(err => log(`Data receiving error: ${err.message}`));
};

const writeToFile = (resourse, fileName, type) => {
  const baseName = nodePath.basename(fileName);
  const defaultMessage = `${baseName} has been saved!`;
  return resourse.then((data) => {
    if (type === 'img') {
      const stream = data.pipe(fs.createWriteStream(fileName));
      return nodePath.basename(`${stream.path} has been saved!`);
    }
    return fs.writeFile(fileName, data);
  }).then(streamMessage => log(`${(streamMessage || defaultMessage)}`))
    .catch(err => log(`Write file error: ${err.message}`));
};

export { makeName, getResponse, writeToFile };
