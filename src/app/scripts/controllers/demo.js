'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.text = '';
    $scope.id = '11111111';
    $scope.selected = '';
    $scope.variable = ' TEST!';

    $scope.disabled = false;
    $scope.show = false;

    $scope.click = function(e) {
    	debugger;
        alert('clicked!');
    }

    $scope.hasPermission = function() {
    	return false;
    }
});
