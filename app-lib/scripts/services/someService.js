'use strict';

angular.module('scaffoldAppLib')
  .service('SomeService', function () {
    return {
      getme: function () {
        return 'server response';
      }
    };
  });
