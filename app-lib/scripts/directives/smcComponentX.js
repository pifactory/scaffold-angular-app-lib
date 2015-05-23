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

