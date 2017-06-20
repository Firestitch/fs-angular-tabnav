'use strict';

angular
.module('app', [
    'config',
    'ui.router',
    'ngMaterial',
    'fs-angular-tabnav'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

    $urlRouterProvider.otherwise('/404');
    $urlRouterProvider.when('', '/demo');
    $urlRouterProvider.when('/', '/demo');

    $locationProvider.html5Mode(true);

    $stateProvider
    .state('demo', {
        url: '/demo',
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    })

    .state('general', {
        url: '/general',
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    })

    .state('404', {
        templateUrl: 'views/404.html',
        controller: 'DemoCtrl'
    })

    .state('settings', {
        url: '/settings',
        templateUrl: 'views/demo.html',
        controller: 'DemoCtrl'
    });

})
.run(function ($rootScope, BOWER) {
    $rootScope.app_name = BOWER.name;
});
