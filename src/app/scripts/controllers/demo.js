'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.text = '';
    
    $scope.click = function() {
        alert('clicked!');
    }
});
