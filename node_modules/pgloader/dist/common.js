'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeToFile = exports.getResponse = exports.makeName = undefined;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/
var log = (0, _debug2.default)('page-loader:');

var makeName = function makeName(uri, dir, type) {
  var _url$parse = _url2.default.parse(uri),
      host = _url$parse.host,
      path = _url$parse.path;

  var name = ('' + (host || '') + path).replace(/\W/g, '-');
  return '' + dir + _path2.default.sep + name + type;
};

var getResponse = function getResponse(url, responseType) {
  log('GET ' + url + ' Response type: ' + responseType);
  return (0, _axios2.default)({ method: 'get', url: url, responseType: responseType }).then(function (response) {
    log('Data received successfully');
    return response.data;
  }).catch(function (err) {
    return log('Data receiving error: ' + err.message);
  });
};

var writeToFile = function writeToFile(resourse, fileName, type) {
  var baseName = _path2.default.basename(fileName);
  var defaultMessage = baseName + ' has been saved!';
  return resourse.then(function (data) {
    if (type === 'img') {
      var stream = data.pipe(_fs2.default.createWriteStream(fileName));
      return _path2.default.basename(stream.path + ' has been saved!');
    }
    return _fs2.default.writeFile(fileName, data);
  }).then(function (streamMessage) {
    return log('' + (streamMessage || defaultMessage));
  }).catch(function (err) {
    return log('Write file error: ' + err.message);
  });
};

exports.makeName = makeName;
exports.getResponse = getResponse;
exports.writeToFile = writeToFile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tb24uanMiXSwibmFtZXMiOlsibG9nIiwibWFrZU5hbWUiLCJ1cmkiLCJkaXIiLCJ0eXBlIiwicGFyc2UiLCJob3N0IiwicGF0aCIsIm5hbWUiLCJyZXBsYWNlIiwic2VwIiwiZ2V0UmVzcG9uc2UiLCJ1cmwiLCJyZXNwb25zZVR5cGUiLCJtZXRob2QiLCJ0aGVuIiwicmVzcG9uc2UiLCJkYXRhIiwiY2F0Y2giLCJlcnIiLCJtZXNzYWdlIiwid3JpdGVUb0ZpbGUiLCJyZXNvdXJzZSIsImZpbGVOYW1lIiwiYmFzZU5hbWUiLCJiYXNlbmFtZSIsImRlZmF1bHRNZXNzYWdlIiwic3RyZWFtIiwicGlwZSIsImNyZWF0ZVdyaXRlU3RyZWFtIiwid3JpdGVGaWxlIiwic3RyZWFtTWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBOzs7QUFHQTs7O0FBR0EsSUFBTUEsTUFBTSxxQkFBTSxjQUFOLENBQVo7O0FBRUEsSUFBTUMsV0FBVyxTQUFYQSxRQUFXLENBQUNDLEdBQUQsRUFBTUMsR0FBTixFQUFXQyxJQUFYLEVBQW9CO0FBQUEsbUJBQ1osY0FBSUMsS0FBSixDQUFVSCxHQUFWLENBRFk7QUFBQSxNQUMzQkksSUFEMkIsY0FDM0JBLElBRDJCO0FBQUEsTUFDckJDLElBRHFCLGNBQ3JCQSxJQURxQjs7QUFFbkMsTUFBTUMsT0FBTyxPQUFHRixRQUFRLEVBQVgsSUFBZ0JDLElBQWhCLEVBQXVCRSxPQUF2QixDQUErQixLQUEvQixFQUFzQyxHQUF0QyxDQUFiO0FBQ0EsY0FBVU4sR0FBVixHQUFnQixlQUFTTyxHQUF6QixHQUErQkYsSUFBL0IsR0FBc0NKLElBQXRDO0FBQ0QsQ0FKRDs7QUFNQSxJQUFNTyxjQUFjLFNBQWRBLFdBQWMsQ0FBQ0MsR0FBRCxFQUFNQyxZQUFOLEVBQXVCO0FBQ3pDYixlQUFXWSxHQUFYLHdCQUFpQ0MsWUFBakM7QUFDQSxTQUFPLHFCQUFNLEVBQUVDLFFBQVEsS0FBVixFQUFpQkYsUUFBakIsRUFBc0JDLDBCQUF0QixFQUFOLEVBQ0pFLElBREksQ0FDQyxVQUFDQyxRQUFELEVBQWM7QUFDbEJoQixRQUFJLDRCQUFKO0FBQ0EsV0FBT2dCLFNBQVNDLElBQWhCO0FBQ0QsR0FKSSxFQUtKQyxLQUxJLENBS0U7QUFBQSxXQUFPbEIsK0JBQTZCbUIsSUFBSUMsT0FBakMsQ0FBUDtBQUFBLEdBTEYsQ0FBUDtBQU1ELENBUkQ7O0FBVUEsSUFBTUMsY0FBYyxTQUFkQSxXQUFjLENBQUNDLFFBQUQsRUFBV0MsUUFBWCxFQUFxQm5CLElBQXJCLEVBQThCO0FBQ2hELE1BQU1vQixXQUFXLGVBQVNDLFFBQVQsQ0FBa0JGLFFBQWxCLENBQWpCO0FBQ0EsTUFBTUcsaUJBQW9CRixRQUFwQixxQkFBTjtBQUNBLFNBQU9GLFNBQVNQLElBQVQsQ0FBYyxVQUFDRSxJQUFELEVBQVU7QUFDN0IsUUFBSWIsU0FBUyxLQUFiLEVBQW9CO0FBQ2xCLFVBQU11QixTQUFTVixLQUFLVyxJQUFMLENBQVUsYUFBR0MsaUJBQUgsQ0FBcUJOLFFBQXJCLENBQVYsQ0FBZjtBQUNBLGFBQU8sZUFBU0UsUUFBVCxDQUFxQkUsT0FBT3BCLElBQTVCLHNCQUFQO0FBQ0Q7QUFDRCxXQUFPLGFBQUd1QixTQUFILENBQWFQLFFBQWIsRUFBdUJOLElBQXZCLENBQVA7QUFDRCxHQU5NLEVBTUpGLElBTkksQ0FNQztBQUFBLFdBQWlCZixVQUFRK0IsaUJBQWlCTCxjQUF6QixFQUFqQjtBQUFBLEdBTkQsRUFPSlIsS0FQSSxDQU9FO0FBQUEsV0FBT2xCLDJCQUF5Qm1CLElBQUlDLE9BQTdCLENBQVA7QUFBQSxHQVBGLENBQVA7QUFRRCxDQVhEOztRQWFTbkIsUSxHQUFBQSxRO1FBQVVVLFcsR0FBQUEsVztRQUFhVSxXLEdBQUFBLFciLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IG5vZGVQYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGZzIGZyb20gJ216L2ZzJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG4vKlxuZXNsaW50IG5vLXNoYWRvdzogW1wiZXJyb3JcIiwgeyBcImFsbG93XCI6IFtcImRhdGFcIiwgXCJ1cmxcIiwgXCJmaWxlTmFtZVwiLCBcImVycm9yXCJdIH1dXG4qL1xuLypcbmVzbGludC1lbnYgZXM2XG4qL1xuY29uc3QgbG9nID0gZGVidWcoJ3BhZ2UtbG9hZGVyOicpO1xuXG5jb25zdCBtYWtlTmFtZSA9ICh1cmksIGRpciwgdHlwZSkgPT4ge1xuICBjb25zdCB7IGhvc3QsIHBhdGggfSA9IHVybC5wYXJzZSh1cmkpO1xuICBjb25zdCBuYW1lID0gYCR7aG9zdCB8fCAnJ30ke3BhdGh9YC5yZXBsYWNlKC9cXFcvZywgJy0nKTtcbiAgcmV0dXJuIGAke2Rpcn0ke25vZGVQYXRoLnNlcH0ke25hbWV9JHt0eXBlfWA7XG59O1xuXG5jb25zdCBnZXRSZXNwb25zZSA9ICh1cmwsIHJlc3BvbnNlVHlwZSkgPT4ge1xuICBsb2coYEdFVCAke3VybH0gUmVzcG9uc2UgdHlwZTogJHtyZXNwb25zZVR5cGV9YCk7XG4gIHJldHVybiBheGlvcyh7IG1ldGhvZDogJ2dldCcsIHVybCwgcmVzcG9uc2VUeXBlIH0pXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBsb2coJ0RhdGEgcmVjZWl2ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICB9KVxuICAgIC5jYXRjaChlcnIgPT4gbG9nKGBEYXRhIHJlY2VpdmluZyBlcnJvcjogJHtlcnIubWVzc2FnZX1gKSk7XG59O1xuXG5jb25zdCB3cml0ZVRvRmlsZSA9IChyZXNvdXJzZSwgZmlsZU5hbWUsIHR5cGUpID0+IHtcbiAgY29uc3QgYmFzZU5hbWUgPSBub2RlUGF0aC5iYXNlbmFtZShmaWxlTmFtZSk7XG4gIGNvbnN0IGRlZmF1bHRNZXNzYWdlID0gYCR7YmFzZU5hbWV9IGhhcyBiZWVuIHNhdmVkIWA7XG4gIHJldHVybiByZXNvdXJzZS50aGVuKChkYXRhKSA9PiB7XG4gICAgaWYgKHR5cGUgPT09ICdpbWcnKSB7XG4gICAgICBjb25zdCBzdHJlYW0gPSBkYXRhLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZU5hbWUpKTtcbiAgICAgIHJldHVybiBub2RlUGF0aC5iYXNlbmFtZShgJHtzdHJlYW0ucGF0aH0gaGFzIGJlZW4gc2F2ZWQhYCk7XG4gICAgfVxuICAgIHJldHVybiBmcy53cml0ZUZpbGUoZmlsZU5hbWUsIGRhdGEpO1xuICB9KS50aGVuKHN0cmVhbU1lc3NhZ2UgPT4gbG9nKGAkeyhzdHJlYW1NZXNzYWdlIHx8IGRlZmF1bHRNZXNzYWdlKX1gKSlcbiAgICAuY2F0Y2goZXJyID0+IGxvZyhgV3JpdGUgZmlsZSBlcnJvcjogJHtlcnIubWVzc2FnZX1gKSk7XG59O1xuXG5leHBvcnQgeyBtYWtlTmFtZSwgZ2V0UmVzcG9uc2UsIHdyaXRlVG9GaWxlIH07XG4iXX0=