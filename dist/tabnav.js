

(function () {
    'use strict';


    /**
     * @ngdoc directive
     * @name fs.directives:fs-tabnav
     * @restrict E
     * @param {string} fs-selected Selected the tab based on the tab name
    */

    /**
     * @ngdoc directive
     * @name fs.directives:fs-tabnav-item
     * @restrict E
     * @param {string} fs-url The url that the browser will be redirected to when the tab is clicked
     * @param {string} fs-name The name of the tab used for selecting the active tab through fs-tabnav.fs-selected
     * @param {expression|function} fs-show The expression or function used to determine if the tab should be shown. Defaults to true
     * @param {string} fs-disabled When set to true the tab will be in a disabled state
     * @param {function} fs-click A function that is fired when the tab is clicked
    */

    angular.module('fs-angular-tabnav',['fs-angular-util'])
    .directive('fsTabnav', function($location, $interpolate, $compile, $timeout, fsUtil, $sce) {
        return {
            template: '<div class="md-tabs" ng-transclude layout="row"></div>',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "=?fsSelected"
            },
            controller: function($scope) {
            	this.$scope = $scope;
            }
        };
    })
 	.directive('fsTabnavItem', function(fsUtil,$location) {
        return {
            template: '<a ng-href="{{url}}" ng-click="ngClick($event)" class="md-tab" ng-class="{ disabled: disabled, selected: selected==name, \'fs-theme-primary-border-color\': selected==name, \'fs-theme-primary-color\': selected==name }" ng-hide="!show" ng-transclude></a>',
            replace: true,
            restrict: 'E',
            transclude: true,
            require: '^fsTabnav',
            scope: {
               url: '@fsUrl',
               click: '&fsClick',
               name: '@fsName',
               disabled: '=?fsDisabled',
               show: '=?fsShow'
            },
            controller: function($scope) {

            	if($scope.show===undefined) {
            		$scope.show = true;
            	}

            	if(!$scope.name) {
                    $scope.name = fsUtil.guid();
                }
            },
            link: function($scope, element, attr, controller) {

	        	selectedUrl();

	        	if($scope.selected || (!controller.$scope.selected && !$scope.url)) {
	        		select();
	        	}

				$scope.$on('$stateChangeSuccess',selectedUrl);

	        	controller.$scope.$watch('selected',function(selected) {
	        		$scope.selected = selected;
	        	});

	        	$scope.ngClick = function(e) {
	        		$scope.click({ $event: e });

					if(!$scope.url) {
						select();
					}
	        	}

	        	function selectedUrl() {
	        		if ($scope.url && $scope.url.replace(/^\/[#\!]/,'') == $location.$$url) {
                		select();
                	}
                }

                function select() {
	        		controller.$scope.selected = $scope.name;
	        	}
            }
        }
    });
})();

