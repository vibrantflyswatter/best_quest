'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('mz/fs');

var _fs2 = _interopRequireDefault(_fs);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _common = require('./common');

var _resources = require('./resources');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
eslint no-shadow: ["error", { "allow": ["data", "url", "fileName", "error"] }]
*/
/*
eslint-env es6
*/

exports.default = function (url, outputDir) {
  var log = (0, _debug2.default)('page-loader:');
  var resourcesDir = (0, _common.makeName)(url, outputDir, '_files');
  var htmlFileName = (0, _common.makeName)(url, outputDir, '.html');
  log('Starting %s', 'page-loader');
  console.log('Url: ', url);
  console.log('Page will be saved to: ', outputDir);

  return _fs2.default.mkdir(resourcesDir).then(function () {
    return (0, _common.getResponse)(url);
  }).then(function (htmlPage) {
    return (0, _resources.fetchResources)(htmlPage, url, resourcesDir, htmlFileName);
  }).then(function (dataColl) {
    return Promise.all(dataColl.map(function (el) {
      return (0, _common.writeToFile)(el.data, el.location, el.type);
    }));
  }).catch(function (err) {
    return log('Err: ' + err.message);
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJ1cmwiLCJvdXRwdXREaXIiLCJsb2ciLCJyZXNvdXJjZXNEaXIiLCJodG1sRmlsZU5hbWUiLCJjb25zb2xlIiwibWtkaXIiLCJ0aGVuIiwiaHRtbFBhZ2UiLCJQcm9taXNlIiwiYWxsIiwiZGF0YUNvbGwiLCJtYXAiLCJlbCIsImRhdGEiLCJsb2NhdGlvbiIsInR5cGUiLCJjYXRjaCIsImVyciIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7QUFHQTs7OztrQkFJZSxVQUFDQSxHQUFELEVBQU1DLFNBQU4sRUFBb0I7QUFDakMsTUFBTUMsTUFBTSxxQkFBTSxjQUFOLENBQVo7QUFDQSxNQUFNQyxlQUFlLHNCQUFTSCxHQUFULEVBQWNDLFNBQWQsRUFBeUIsUUFBekIsQ0FBckI7QUFDQSxNQUFNRyxlQUFlLHNCQUFTSixHQUFULEVBQWNDLFNBQWQsRUFBeUIsT0FBekIsQ0FBckI7QUFDQUMsTUFBSSxhQUFKLEVBQW1CLGFBQW5CO0FBQ0FHLFVBQVFILEdBQVIsQ0FBWSxPQUFaLEVBQXFCRixHQUFyQjtBQUNBSyxVQUFRSCxHQUFSLENBQVkseUJBQVosRUFBdUNELFNBQXZDOztBQUVBLFNBQU8sYUFBR0ssS0FBSCxDQUFTSCxZQUFULEVBQ0pJLElBREksQ0FDQztBQUFBLFdBQU0seUJBQVlQLEdBQVosQ0FBTjtBQUFBLEdBREQsRUFFSk8sSUFGSSxDQUVDO0FBQUEsV0FBWSwrQkFBZUMsUUFBZixFQUF5QlIsR0FBekIsRUFBOEJHLFlBQTlCLEVBQTRDQyxZQUE1QyxDQUFaO0FBQUEsR0FGRCxFQUdKRyxJQUhJLENBR0M7QUFBQSxXQUFZRSxRQUFRQyxHQUFSLENBQVlDLFNBQVNDLEdBQVQsQ0FBYTtBQUFBLGFBQU0seUJBQVlDLEdBQUdDLElBQWYsRUFBcUJELEdBQUdFLFFBQXhCLEVBQWtDRixHQUFHRyxJQUFyQyxDQUFOO0FBQUEsS0FBYixDQUFaLENBQVo7QUFBQSxHQUhELEVBSUpDLEtBSkksQ0FJRTtBQUFBLFdBQU9mLGNBQVlnQixJQUFJQyxPQUFoQixDQUFQO0FBQUEsR0FKRixDQUFQO0FBS0QsQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdtei9mcyc7XG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgbWFrZU5hbWUsIGdldFJlc3BvbnNlLCB3cml0ZVRvRmlsZSB9IGZyb20gJy4vY29tbW9uJztcbmltcG9ydCB7IGZldGNoUmVzb3VyY2VzIH0gZnJvbSAnLi9yZXNvdXJjZXMnO1xuXG4vKlxuZXNsaW50IG5vLXNoYWRvdzogW1wiZXJyb3JcIiwgeyBcImFsbG93XCI6IFtcImRhdGFcIiwgXCJ1cmxcIiwgXCJmaWxlTmFtZVwiLCBcImVycm9yXCJdIH1dXG4qL1xuLypcbmVzbGludC1lbnYgZXM2XG4qL1xuXG5leHBvcnQgZGVmYXVsdCAodXJsLCBvdXRwdXREaXIpID0+IHtcbiAgY29uc3QgbG9nID0gZGVidWcoJ3BhZ2UtbG9hZGVyOicpO1xuICBjb25zdCByZXNvdXJjZXNEaXIgPSBtYWtlTmFtZSh1cmwsIG91dHB1dERpciwgJ19maWxlcycpO1xuICBjb25zdCBodG1sRmlsZU5hbWUgPSBtYWtlTmFtZSh1cmwsIG91dHB1dERpciwgJy5odG1sJyk7XG4gIGxvZygnU3RhcnRpbmcgJXMnLCAncGFnZS1sb2FkZXInKTtcbiAgY29uc29sZS5sb2coJ1VybDogJywgdXJsKTtcbiAgY29uc29sZS5sb2coJ1BhZ2Ugd2lsbCBiZSBzYXZlZCB0bzogJywgb3V0cHV0RGlyKTtcblxuICByZXR1cm4gZnMubWtkaXIocmVzb3VyY2VzRGlyKVxuICAgIC50aGVuKCgpID0+IGdldFJlc3BvbnNlKHVybCkpXG4gICAgLnRoZW4oaHRtbFBhZ2UgPT4gZmV0Y2hSZXNvdXJjZXMoaHRtbFBhZ2UsIHVybCwgcmVzb3VyY2VzRGlyLCBodG1sRmlsZU5hbWUpKVxuICAgIC50aGVuKGRhdGFDb2xsID0+IFByb21pc2UuYWxsKGRhdGFDb2xsLm1hcChlbCA9PiB3cml0ZVRvRmlsZShlbC5kYXRhLCBlbC5sb2NhdGlvbiwgZWwudHlwZSkpKSlcbiAgICAuY2F0Y2goZXJyID0+IGxvZyhgRXJyOiAke2Vyci5tZXNzYWdlfWApKTtcbn07XG4iXX0=