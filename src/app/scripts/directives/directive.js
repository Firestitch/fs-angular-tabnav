
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
     * @param {expression} fs-show The expression used to show the tab. Defaults to true
     * @param {string} fs-disabled When set to true the tab will be in a disabled state
     * @param {function} fs-click A function that is fired when the tab is clicked
    */

    angular.module('fs-angular-tabnav',[])
    .directive('fsTabnav', function($location, $interpolate, fsTabnavTheme, $compile, $timeout) {
        return {
            templateUrl: 'views/directives/tabnav.html',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "=?fsSelected"
            },

            link: function($scope, element, attrs, ctrl, $transclude) {

                var stateChangeSuccess = function(event, toState, toParams, fromState, fromParams) {
                    angular.forEach($scope.items,function(item) {
                      if(item.url==$location.$$url) {
                      	$timeout(function() {
                        	$scope.selected = item.name;
                        });
                      }
                    });
                }

                $scope.$on('$stateChangeSuccess',stateChangeSuccess);

                var guid = function() {
                    return 'xxxxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                        return v.toString(16);
                    });
                }

                $scope.accent = setRGB('accent');
                $scope.items = [];

                $transclude(function(clone, scope) {

                    angular.forEach(clone,function(el) {
                        if(el.nodeName.match(/fs-tabnav-item/i)) {

                            var el = angular.element(el);
                            var template = el.text();

                            if(template.match(/^{{/)) {
                              scope.$watch($interpolate(template), function (value) {
                                item.template = $interpolate(value)(scope.$parent.$parent);
                              });
                            }

                          	if(!el.attr('fs-name')) {
                              el.attr('fs-name',guid());
                            }

                            var item = { 	template: template,
                            				href: 'javascript:;',
                            				name: el.attr('fs-name'),
                            				style: { color: $scope.accent, borderColor: $scope.accent },
                            				show: true };

                            if(el.attr('fs-url')) {

                                item.url = $interpolate(el.attr('fs-url'))(scope.$parent.$parent);

                                scope.$watch(
                                function() {
                                    return $interpolate(el.attr('fs-url'))(scope.$parent.$parent);
                                },
                                function (newValue, oldValue) {
                                    if (newValue != oldValue) {
                                        item.url = $interpolate(newValue)(scope.$parent.$parent);

                                        if (!item.url.match(/^http/i)) {
                                            item.url = item.url.replace(/^#/, '');
                                            if (!$location.$$html5) {
                                                item.url = '#' + item.url;
                                            }
                                        }
                                    }
                                });

                                if(!item.url.match(/^http/i)) {
                                  item.url = item.url.replace(/^#/,'');

                                  if(item.url==$location.$$url) {
                                    $scope.selected = item.name;
                                  }

                                  if(!$location.$$html5) {
                                    item.url = '#' + item.url;
                                  }
                                }
                            }

                            if(el.attr('fs-click')) {
                                item.click = el.attr('fs-click');
                                item.scope = scope.$parent.$parent;
                            }

                            if(el.attr('fs-show')) {
                              $scope.$parent.$watch(el.attr('fs-show'),function(value) {
                                item.show = value;
                              });
                            }

                            if(el.attr('fs-disabled')) {
                              $scope.$parent.$watch(el.attr('fs-disabled'),function(value) {
                                item.disabled = value;
                              });
                            }

                            $scope.items.push(item);
                        }
                    });
                });

                $scope.click = function(item, event) {
                  if(item.disabled) {
                    return event.preventDefault();
                  }

                  //if item has a .url $scope.selected will get updated by stateChangeSuccess().
                  //the one exception is if the current url is the same as item.url then stateChangeSuccess() wont fire  we need to manually change $scope.selected
                  var url = item.url ? item.url.replace(/^#/,'') : false;
				          if(!url || url==$location.$$url)
                    $scope.selected = item.name;

                  if(item.click) {
                      item.scope.$eval(item.click);
                      event.preventDefault();
                  }
                }

                //var color = $mdColors.getThemeColor('primary');

                function setRGB(input) {

                    var themeProvider = fsTabnavTheme.themeColors;

                    var themeName     = 'default';
                    var hueName       = 'default';
                    var intentionName = 'primary';
                    var hueKey,theme,hue,intention;
                    var shades = {
                      '50' :'50' ,'100':'100','200':'200','300':'300','400':'400',
                      '500':'500','600':'600','700':'700','800':'800','A100':'A100',
                      'A200':'A200','A400':'A400','A700':'A700'
                    };
                    var intentions = {
                      primary:'primary',
                      accent:'accent',
                      warn:'warn',
                      background:'background'
                    };
                    var hues = {
                      'default':'default',
                      'hue-1':'hue-1',
                      'hue-2':'hue-2',
                      'hue-3':'hue-3'
                    };

                    // Do our best to parse out the attributes
                    angular.forEach(input.split(' '), function(value, key) {
                      if (0 === key && 'default' === value) {
                        themeName = value;
                      } else
                      if (intentions[value]) {
                        intentionName = value;
                      } else if (hues[value]) {
                        hueName = value;
                      } else if (shades[value]) {
                        hueKey = value;
                      }
                    });

                    // Lookup and assign the right values
                    if ((theme = themeProvider._THEMES[themeName])) {

                      if ((intention = theme.colors[intentionName]) ) {

                        if (!hueKey) {
                          hueKey = intention.hues[hueName];
                        }
                        if ((hue = themeProvider._PALETTES[intention.name][hueKey]) ) {
                          return 'rgb('+hue.value[0]+','+hue.value[1]+','+hue.value[2]+')';
                        }
                      }
                    }
                  }

            }
        };
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