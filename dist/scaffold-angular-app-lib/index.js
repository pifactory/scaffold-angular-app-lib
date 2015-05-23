'use strict';
// Source: app-lib/scripts/lib.js
angular
  .module('scaffoldAppLib', []);
;// Source: app-lib/scripts/directives/smcComponentX.js
angular.module('scaffoldAppLib')
  .directive('smcComponentX', function () {
    return {
      restrict: 'E',
      scope: {
        text: '='
      },
      controller: function ($scope, SomeService) {
        $scope.text = 'x-' + SomeService.getme();
      },
      templateUrl: 'scaffold-angular-app-lib/views/componentX.html'
    };
  });

;// Source: app-lib/scripts/services/someService.js
angular.module('scaffoldAppLib')
  .service('SomeService', function () {
    return {
      getme: function () {
        return 'server response';
      }
    };
  });
