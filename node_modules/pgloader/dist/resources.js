'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateHtml = exports.updateLinks = exports.fetchResources = exports.getLinks = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _common = require('./common');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/

var log = (0, _debug2.default)('page-loader:');

var getLinks = function getLinks(html, selector, predicate) {
  var $ = _cheerio2.default.load(html);
  return $(selector).toArray().map(function (el) {
    var src = el.attribs.src || el.attribs.href;
    return { type: el.name, src: src };
  }).filter(function (el) {
    return !predicate.test(el.src);
  });
};

var updateLinks = function updateLinks(linksColl, dirName) {
  return linksColl.reduce(function (acc, el) {
    var _nodePath$parse = _path2.default.parse(el.src),
        dir = _nodePath$parse.dir,
        ext = _nodePath$parse.ext,
        name = _nodePath$parse.name;

    var newEl = _extends({}, el);
    var newName = '' + _path2.default.join(dir, name).replace(/\W/g, '-').slice(1) + ext;
    newEl.localSrc = _path2.default.format({
      root: '/ignored',
      dir: dirName,
      base: newName,
      ext: 'ignored'
    });
    newEl.fileName = newName;
    return [].concat(_toConsumableArray(acc), [newEl]);
  }, []);
};

var updateHtml = function updateHtml(html, linksColl) {
  var result = linksColl.reduce(function (acc, el) {
    var attrib = el.type === 'link' ? 'href' : 'src';
    var $ = _cheerio2.default.load(acc);
    $('[' + attrib + '="' + el.src + '"]').removeAttr(attrib).attr(attrib, el.localSrc);
    return $.html();
  }, html);

  return result + '\n';
};

var fetchResources = function fetchResources(html, url, resourcesDir, htmlFileName) {
  var linksColl = getLinks(html, 'img[src], script[src], link[href]', /^(\w+:)?\/{2,}/);
  var updatedLinksColl = updateLinks(linksColl, resourcesDir);
  var updatedHtml = updateHtml(html, updatedLinksColl);
  var coll = [{ type: 'html', data: Promise.resolve(updatedHtml), location: htmlFileName }];
  var result = updatedLinksColl.reduce(function (acc, el) {
    var responseType = el.type === 'img' ? 'stream' : 'json';

    var _nodeUrl$parse = _url2.default.parse(url),
        protocol = _nodeUrl$parse.protocol,
        host = _nodeUrl$parse.host;

    log('Fetching... ' + protocol + '//' + host + el.src);
    var newEl = {
      type: el.type,
      data: (0, _common.getResponse)(protocol + '//' + host + el.src, responseType),
      location: '' + resourcesDir + _path2.default.sep + el.fileName
    };
    return [].concat(_toConsumableArray(acc), [newEl]);
  }, coll);

  return result;
};

exports.getLinks = getLinks;
exports.fetchResources = fetchResources;
exports.updateLinks = updateLinks;
exports.updateHtml = updateHtml;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNvdXJjZXMuanMiXSwibmFtZXMiOlsibG9nIiwiZ2V0TGlua3MiLCJodG1sIiwic2VsZWN0b3IiLCJwcmVkaWNhdGUiLCIkIiwibG9hZCIsInRvQXJyYXkiLCJtYXAiLCJlbCIsInNyYyIsImF0dHJpYnMiLCJocmVmIiwidHlwZSIsIm5hbWUiLCJmaWx0ZXIiLCJ0ZXN0IiwidXBkYXRlTGlua3MiLCJsaW5rc0NvbGwiLCJkaXJOYW1lIiwicmVkdWNlIiwiYWNjIiwicGFyc2UiLCJkaXIiLCJleHQiLCJuZXdFbCIsIm5ld05hbWUiLCJqb2luIiwicmVwbGFjZSIsInNsaWNlIiwibG9jYWxTcmMiLCJmb3JtYXQiLCJyb290IiwiYmFzZSIsImZpbGVOYW1lIiwidXBkYXRlSHRtbCIsInJlc3VsdCIsImF0dHJpYiIsInJlbW92ZUF0dHIiLCJhdHRyIiwiZmV0Y2hSZXNvdXJjZXMiLCJ1cmwiLCJyZXNvdXJjZXNEaXIiLCJodG1sRmlsZU5hbWUiLCJ1cGRhdGVkTGlua3NDb2xsIiwidXBkYXRlZEh0bWwiLCJjb2xsIiwiZGF0YSIsIlByb21pc2UiLCJyZXNvbHZlIiwibG9jYXRpb24iLCJyZXNwb25zZVR5cGUiLCJwcm90b2NvbCIsImhvc3QiLCJzZXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7QUFHQTs7OztBQUlBLElBQU1BLE1BQU0scUJBQU0sY0FBTixDQUFaOztBQUVBLElBQU1DLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxJQUFELEVBQU9DLFFBQVAsRUFBaUJDLFNBQWpCLEVBQStCO0FBQzlDLE1BQU1DLElBQUksa0JBQVFDLElBQVIsQ0FBYUosSUFBYixDQUFWO0FBQ0EsU0FBT0csRUFBRUYsUUFBRixFQUFZSSxPQUFaLEdBQ0pDLEdBREksQ0FDQSxVQUFDQyxFQUFELEVBQVE7QUFDWCxRQUFNQyxNQUFNRCxHQUFHRSxPQUFILENBQVdELEdBQVgsSUFB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QUFBQSxRQUVoQ0MsSUFGZ0Msa0JBRWhDQSxJQUZnQzs7QUFHbERyRCx5QkFBbUJvRCxRQUFuQixVQUFnQ0MsSUFBaEMsR0FBdUM1QyxHQUFHQyxHQUExQztBQUNBLFFBQU1lLFFBQVE7QUFDWlosWUFBTUosR0FBR0ksSUFERztBQUVaa0MsWUFBTSx5QkFBZUssUUFBZixVQUE0QkMsSUFBNUIsR0FBbUM1QyxHQUFHQyxHQUF0QyxFQUE2Q3lDLFlBQTdDLENBRk07QUFHWkQscUJBQWFSLFlBQWIsR0FBNEIsZUFBU1ksR0FBckMsR0FBMkM3QyxHQUFHeUI7QUFIbEMsS0FBZDtBQUtBLHdDQUFXYixHQUFYLElBQWdCSSxLQUFoQjtBQUNELEdBVmMsRUFVWnFCLElBVlksQ0FBZjs7QUFZQSxTQUFPVixNQUFQO0FBQ0QsQ0FwQkQ7O1FBc0JTbkMsUSxHQUFBQSxRO1FBQVV1QyxjLEdBQUFBLGM7UUFBZ0J2QixXLEdBQUFBLFc7UUFBYWtCLFUsR0FBQUEsVSIsImZpbGUiOiJyZXNvdXJjZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbm9kZVVybCBmcm9tICd1cmwnO1xuaW1wb3J0IG5vZGVQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgZ2V0UmVzcG9uc2UgfSBmcm9tICcuL2NvbW1vbic7XG5cbi8qXG5lc2xpbnQgbm8tc2hhZG93OiBbXCJlcnJvclwiLCB7IFwiYWxsb3dcIjogW1wiZGF0YVwiLCBcInVybFwiLCBcImZpbGVOYW1lXCIsIFwiZXJyb3JcIl0gfV1cbiovXG4vKlxuZXNsaW50LWVudiBlczZcbiovXG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdwYWdlLWxvYWRlcjonKTtcblxuY29uc3QgZ2V0TGlua3MgPSAoaHRtbCwgc2VsZWN0b3IsIHByZWRpY2F0ZSkgPT4ge1xuICBjb25zdCAkID0gY2hlZXJpby5sb2FkKGh0bWwpO1xuICByZXR1cm4gJChzZWxlY3RvcikudG9BcnJheSgpXG4gICAgLm1hcCgoZWwpID0+IHtcbiAgICAgIGNvbnN0IHNyYyA9IGVsLmF0dHJpYnMuc3JjIHx8IGVsLmF0dHJpYnMuaHJlZjtcbiAgICAgIHJldHVybiB7IHR5cGU6IGVsLm5hbWUsIHNyYyB9O1xuICAgIH0pXG4gICAgLmZpbHRlcihlbCA9PiAhcHJlZGljYXRlLnRlc3QoZWwuc3JjKSk7XG59O1xuXG5jb25zdCB1cGRhdGVMaW5rcyA9IChsaW5rc0NvbGwsIGRpck5hbWUpID0+XG4gIGxpbmtzQ29sbC5yZWR1Y2UoKGFjYywgZWwpID0+IHtcbiAgICBjb25zdCB7IGRpciwgZXh0LCBuYW1lIH0gPSBub2RlUGF0aC5wYXJzZShlbC5zcmMpO1xuICAgIGNvbnN0IG5ld0VsID0geyAuLi5lbCB9O1xuICAgIGNvbnN0IG5ld05hbWUgPSBgJHsobm9kZVBhdGguam9pbihkaXIsIG5hbWUpLnJlcGxhY2UoL1xcVy9nLCAnLScpKS5zbGljZSgxKX0ke2V4dH1gO1xuICAgIG5ld0VsLmxvY2FsU3JjID0gbm9kZVBhdGguZm9ybWF0KHtcbiAgICAgIHJvb3Q6ICcvaWdub3JlZCcsXG4gICAgICBkaXI6IGRpck5hbWUsXG4gICAgICBiYXNlOiBuZXdOYW1lLFxuICAgICAgZXh0OiAnaWdub3JlZCcsXG4gICAgfSk7XG4gICAgbmV3RWwuZmlsZU5hbWUgPSBuZXdOYW1lO1xuICAgIHJldHVybiBbLi4uYWNjLCBuZXdFbF07XG4gIH0sIFtdKTtcblxuY29uc3QgdXBkYXRlSHRtbCA9IChodG1sLCBsaW5rc0NvbGwpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0gbGlua3NDb2xsLnJlZHVjZSgoYWNjLCBlbCkgPT4ge1xuICAgIGNvbnN0IGF0dHJpYiA9IGVsLnR5cGUgPT09ICdsaW5rJyA/ICdocmVmJyA6ICdzcmMnO1xuICAgIGNvbnN0ICQgPSBjaGVlcmlvLmxvYWQoYWNjKTtcbiAgICAkKGBbJHthdHRyaWJ9PVwiJHtlbC5zcmN9XCJdYCkucmVtb3ZlQXR0cihhdHRyaWIpLmF0dHIoYXR0cmliLCBlbC5sb2NhbFNyYyk7XG4gICAgcmV0dXJuICQuaHRtbCgpO1xuICB9LCBodG1sKTtcblxuICByZXR1cm4gYCR7cmVzdWx0fVxcbmA7XG59O1xuXG5jb25zdCBmZXRjaFJlc291cmNlcyA9IChodG1sLCB1cmwsIHJlc291cmNlc0RpciwgaHRtbEZpbGVOYW1lKSA9PiB7XG4gIGNvbnN0IGxpbmtzQ29sbCA9IGdldExpbmtzKGh0bWwsICdpbWdbc3JjXSwgc2NyaXB0W3NyY10sIGxpbmtbaHJlZl0nLCAvXihcXHcrOik/XFwvezIsfS8pO1xuICBjb25zdCB1cGRhdGVkTGlua3NDb2xsID0gdXBkYXRlTGlua3MobGlua3NDb2xsLCByZXNvdXJjZXNEaXIpO1xuICBjb25zdCB1cGRhdGVkSHRtbCA9IHVwZGF0ZUh0bWwoaHRtbCwgdXBkYXRlZExpbmtzQ29sbCk7XG4gIGNvbnN0IGNvbGwgPSBbXG4gICAgeyB0eXBlOiAnaHRtbCcsIGRhdGE6IFByb21pc2UucmVzb2x2ZSh1cGRhdGVkSHRtbCksIGxvY2F0aW9uOiBodG1sRmlsZU5hbWUgfSxcbiAgXTtcbiAgY29uc3QgcmVzdWx0ID0gdXBkYXRlZExpbmtzQ29sbC5yZWR1Y2UoKGFjYywgZWwpID0+IHtcbiAgICBjb25zdCByZXNwb25zZVR5cGUgPSBlbC50eXBlID09PSAnaW1nJyA/ICdzdHJlYW0nIDogJ2pzb24nO1xuICAgIGNvbnN0IHsgcHJvdG9jb2wsIGhvc3QgfSA9IG5vZGVVcmwucGFyc2UodXJsKTtcbiAgICBsb2coYEZldGNoaW5nLi4uICR7cHJvdG9jb2x9Ly8ke2hvc3R9JHtlbC5zcmN9YCk7XG4gICAgY29uc3QgbmV3RWwgPSB7XG4gICAgICB0eXBlOiBlbC50eXBlLFxuICAgICAgZGF0YTogZ2V0UmVzcG9uc2UoYCR7cHJvdG9jb2x9Ly8ke2hvc3R9JHtlbC5zcmN9YCwgcmVzcG9uc2VUeXBlKSxcbiAgICAgIGxvY2F0aW9uOiBgJHtyZXNvdXJjZXNEaXJ9JHtub2RlUGF0aC5zZXB9JHtlbC5maWxlTmFtZX1gLFxuICAgIH07XG4gICAgcmV0dXJuIFsuLi5hY2MsIG5ld0VsXTtcbiAgfSwgY29sbCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCB7IGdldExpbmtzLCBmZXRjaFJlc291cmNlcywgdXBkYXRlTGlua3MsIHVwZGF0ZUh0bWwgfTtcbiJdfQ==