import nodeUrl from 'url';
import nodePath from 'path';
import cheerio from 'cheerio';
import debug from 'debug';
import { getResponse } from './common';

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/

const log = debug('page-loader:');

const getLinks = (html, selector, predicate) => {
  const $ = cheerio.load(html);
  return $(selector).toArray()
    .map((el) => {
      const src = el.attribs.src || el.attribs.href;
      return { type: el.name, src };
    })
    .filter(el => !predicate.test(el.src));
};

const updateLinks = (linksColl, dirName) =>
  linksColl.reduce((acc, el) => {
    const { dir, ext, name } = nodePath.parse(el.src);
    const newEl = { ...el };
    const newName = `${(nodePath.join(dir, name).replace(/\W/g, '-')).slice(1)}${ext}`;
    newEl.localSrc = nodePath.format({
      root: '/ignored',
      dir: dirName,
      base: newName,
      ext: 'ignored',
    });
    newEl.fileName = newName;
    return [...acc, newEl];
  }, []);

const updateHtml = (html, linksColl) => {
  const result = linksColl.reduce((acc, el) => {
    const attrib = el.type === 'link' ? 'href' : 'src';
    const $ = cheerio.load(acc);
    $(`[${attrib}="${el.src}"]`).removeAttr(attrib).attr(attrib, el.localSrc);
    return $.html();
  }, html);

  return `${result}\n`;
};

const fetchResources = (html, url, resourcesDir, htmlFileName) => {
  const linksColl = getLinks(html, 'img[src], script[src], link[href]', /^(\w+:)?\/{2,}/);
  const updatedLinksColl = updateLinks(linksColl, resourcesDir);
  const updatedHtml = updateHtml(html, updatedLinksColl);
  const coll = [
    { type: 'html', data: Promise.resolve(updatedHtml), location: htmlFileName },
  ];
  const result = updatedLinksColl.reduce((acc, el) => {
    const responseType = el.type === 'img' ? 'stream' : 'json';
    const { protocol, host } = nodeUrl.parse(url);
    log(`Fetching... ${protocol}//${host}${el.src}`);
    const newEl = {
      type: el.type,
      data: getResponse(`${protocol}//${host}${el.src}`, responseType),
      location: `${resourcesDir}${nodePath.sep}${el.fileName}`,
    };
    return [...acc, newEl];
  }, coll);

  return result;
};

export { getLinks, fetchResources, updateLinks, updateHtml };
