'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.text = '';
    $scope.id = '11111111';
    $scope.selected = '';

    $scope.disabled = false;
    $scope.show = false;

    $scope.click = function() {
        alert('clicked!');
    }
});
