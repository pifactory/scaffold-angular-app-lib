'use strict';

angular
  .module('scaffoldAppLib', []);

'use strict';

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


'use strict';

angular.module('scaffoldAppLib')
  .service('SomeService', function () {
    return {
      getme: function () {
        return 'server response';
      }
    };
  });
