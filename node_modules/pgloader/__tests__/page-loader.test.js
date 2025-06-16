import os from 'os';
import fs from 'mz/fs';
import path from 'path';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import loadPage from '../src/';

const address = 'https://hexlet.io';
const pathToRes = '/courses';
const body = 'test data';
const message = ' has been saved!';

axios.defaults.adapter = httpAdapter;

const mkdirTmp = () => fs.mkdtempSync(path.join(os.tmpdir(), '_tests_'));

describe('Testing loadPage function: ', () => {
  beforeEach(() => {
    nock(address)
      .get(pathToRes)
      .reply(200, body);
  });
  afterAll(() => {
    //here should be cleaner
  });

  /*
  it('should return success message', () => {
    const tmpDir = mkdirTmp();
    const expected = `hexlet-io-courses.html${message}`;
    expect.assertions(1);
    return loadPage(`${address}${pathToRes}`, tmpDir)
      .then((message) => {
        expect(message[0]).toBe(expected);
    });
  });
  */

  it('should write data to file', () => {
    const tmpDir = mkdirTmp();
    const fileName = path.format({
      dir: tmpDir,
      base: 'hexlet-io-courses.html',
    });
    expect.assertions(1);
    return loadPage(`${address}${pathToRes}`, tmpDir).then(() => {
      expect(fs.readFileSync(fileName, 'utf8')).toBe('test data\n');
    });
  });
});
