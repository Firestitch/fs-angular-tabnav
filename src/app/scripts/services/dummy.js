(function () {
    'use strict';

    angular.module('app')
    .factory('DummyService', function (apiService) {

        var service = {
            gets:gets
        };

        return service;

        function gets(data,options) {
            return apiService.get('dummy', data, apiService.options(options));
        }

    })
    .directive('testLoad', function() {
        return {
            restrict: 'A',
            controller: function($scope) {
            	debugger;
            },
            link: function($scope) {
            	debugger;
            }
        };
    })
})();