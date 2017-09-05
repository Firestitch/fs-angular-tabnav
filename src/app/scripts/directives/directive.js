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
    .directive('fsTabnav', function() {
        return {
            template: '<div class="md-tabs" layout="row" ng-transclude="tabs"></div><div ng-transclude="content"></div>',
            restrict: 'E',
            transclude: {
            	tabs: 'fsTabnavItem',
            	content: '?fsTabnavContent'
            },
            scope: {
               selected: '=?fsSelected',
               id: '@fsId'
            },
            controller: function($scope) {
            	var self = this;

            	self.$scope = $scope;
            	self.$scope.panes = {};
            }
        };
    })
    .directive('fsTabnavPane', function(fsUtil) {
        return {
            template: '<div class="fs-tabnav-pane" ng-show="name==selected" xxx="{{id}}-{{guid}}-{{panes}}" ng-if="name==selected || panes[id][guid]" ng-init="panes[id][guid]=true" ng-transclude></div>',
            restrict: 'E',
            transclude: true,
            scope: {
               name: '@fsName'
            },
            require: '^fsTabnav',
            controller: function($scope) {
            	$scope.guid = fsUtil.guid();
            },
            link: function($scope, element, attr, controller) {
            	$scope.panes = controller.$scope.panes;

            	controller.$scope.$watch('id',function(id) {
	        		$scope.id = id;
	        		if(!$scope.panes[id]) {
	        			$scope.panes = {};
	        		}
	        	});

            	controller.$scope.$watch('selected',function(selected) {
	        		$scope.selected = selected;
	        	});
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
            	if(!$scope.name) {
                    $scope.name = fsUtil.guid();
                }
            },
            link: function($scope, element, attr, controller) {

            	if(!$scope.hasOwnProperty('show')) {
            		$scope.show = true;
            	}

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