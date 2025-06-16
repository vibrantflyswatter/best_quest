#! /usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../../package.json');

var app = _interopRequireWildcard(_package);

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander2.default.version(app.version).description('This program downloads resourse by given URL and save it to the local dir').option('-o, --output [path]', 'directory to save downloaded page').arguments('<url>').action(function (url) {
  var outputDir = _commander2.default.output || process.cwd();
  (0, _2.default)(url, outputDir);
});

_commander2.default.parse(process.argv);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vcGFnZS1sb2FkZXIuanMiXSwibmFtZXMiOlsiYXBwIiwidmVyc2lvbiIsImRlc2NyaXB0aW9uIiwib3B0aW9uIiwiYXJndW1lbnRzIiwiYWN0aW9uIiwidXJsIiwib3V0cHV0RGlyIiwib3V0cHV0IiwicHJvY2VzcyIsImN3ZCIsInBhcnNlIiwiYXJndiJdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7OztBQUNBOztJQUFZQSxHOztBQUNaOzs7Ozs7OztBQUVBLG9CQUNHQyxPQURILENBQ1dELElBQUlDLE9BRGYsRUFFR0MsV0FGSCxDQUVlLDJFQUZmLEVBR0dDLE1BSEgsQ0FHVSxxQkFIVixFQUdpQyxtQ0FIakMsRUFJR0MsU0FKSCxDQUlhLE9BSmIsRUFLR0MsTUFMSCxDQUtVLFVBQUNDLEdBQUQsRUFBUztBQUNmLE1BQU1DLFlBQVksb0JBQVFDLE1BQVIsSUFBa0JDLFFBQVFDLEdBQVIsRUFBcEM7QUFDQSxrQkFBU0osR0FBVCxFQUFjQyxTQUFkO0FBQ0QsQ0FSSDs7QUFVQSxvQkFBUUksS0FBUixDQUFjRixRQUFRRyxJQUF0QiIsImZpbGUiOiJwYWdlLWxvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG5pbXBvcnQgcHJvZ3JhbSBmcm9tICdjb21tYW5kZXInO1xuaW1wb3J0ICogYXMgYXBwIGZyb20gJy4uLy4uL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgbG9hZFBhZ2UgZnJvbSAnLi4vJztcblxucHJvZ3JhbVxuICAudmVyc2lvbihhcHAudmVyc2lvbilcbiAgLmRlc2NyaXB0aW9uKCdUaGlzIHByb2dyYW0gZG93bmxvYWRzIHJlc291cnNlIGJ5IGdpdmVuIFVSTCBhbmQgc2F2ZSBpdCB0byB0aGUgbG9jYWwgZGlyJylcbiAgLm9wdGlvbignLW8sIC0tb3V0cHV0IFtwYXRoXScsICdkaXJlY3RvcnkgdG8gc2F2ZSBkb3dubG9hZGVkIHBhZ2UnKVxuICAuYXJndW1lbnRzKCc8dXJsPicpXG4gIC5hY3Rpb24oKHVybCkgPT4ge1xuICAgIGNvbnN0IG91dHB1dERpciA9IHByb2dyYW0ub3V0cHV0IHx8IHByb2Nlc3MuY3dkKCk7XG4gICAgbG9hZFBhZ2UodXJsLCBvdXRwdXREaXIpO1xuICB9KTtcblxucHJvZ3JhbS5wYXJzZShwcm9jZXNzLmFyZ3YpO1xuIl19