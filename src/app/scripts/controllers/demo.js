'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.text = '';
    $scope.id = '11111111';
    $scope.selected = 1;

    $scope.disabled = false;

    $scope.click = function() {
        alert('clicked!');
    }
});
