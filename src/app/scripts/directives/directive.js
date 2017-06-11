
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
    .directive('fsTabnav', function($location, $interpolate, fsTabnavTheme, $compile, $timeout, fsUtil, $sce) {
        return {
            templateUrl: 'views/directives/tabnav.html',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "=?fsSelected"
            }
        };
    })
 	.directive('fsTabnavItem', function(fsUtil,$location) {
        return {
            templateUrl: 'views/directives/tabnavitem.html',
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

                if(!$scope.$parent.$parent.selected) {
                	$scope.$parent.$parent.selected = $scope.name;
                }

                selectUrl();

            	$scope.$parent.$parent.$watch('selected',function(selected) {
            		$scope.selected = selected;
            	});

                $scope.$on('$stateChangeSuccess',selectUrl);

            	$scope.ngClick = function(event) {
					if($scope.disabled) {
						return event.preventDefault();
					}

					//if item has a .url $scope.selected will get updated by stateChangeSuccess().
					//the one exception is if the current url is the same as item.url then stateChangeSuccess() wont fire  we need to manually change $scope.selected
					//var url = $scope.url ? item.url.replace(/^#/,'') : false;
					//if(!url || url==$location.$$url)
					$scope.$parent.$parent.selected = $scope.name;

					if($scope.click) {
						$scope.$eval($scope.click);
					 	event.preventDefault();
					}
                }

                function selectUrl() {
					if($scope.url && $scope.url.replace(/^[^\/]+/,'')==$location.$$url.replace(/\?.*/,'')) {
	                	$scope.$parent.$parent.selected = $scope.name;
	              	}
                }
            }
        }
    })
    .provider('fsTabnavTheme',function($mdThemingProvider){
    return {
      $get : function() {
        return {
          themeColors : $mdThemingProvider
        };
      }
    };
  });
})();