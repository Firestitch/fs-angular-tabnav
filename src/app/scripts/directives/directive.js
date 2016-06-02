(function () {
    'use strict';

    angular.module('fs-angular-tabnav',[])
    .directive('fsTabnav', function($location, $interpolate, fsTabnavTheme) {
        return {
            templateUrl: 'views/directives/tabnav.html',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "=?fsSelected"
            },

            link: function($scope, element, attrs, ctrl, $transclude) {
              
              var s = $location;
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

                $scope.accent = setRGB('accent');
                $scope.selected = $scope.selected===undefined ? 0 : $scope.selected;
                $scope.items = [];
                
                $transclude(function(clone, scope) {
                    
                    var index = 0;
                    angular.forEach(clone,function(el) {
                        if(el.nodeName.match(/fs-tabnav-item/i)) {
                               
                            var item = { name: el.textContent, href: 'javascript:;' };
                            if(el.getAttributeNode('fs-url')) {
                                item.url = $interpolate(el.getAttributeNode('fs-url').nodeValue)(scope.$parent.$parent);

                                if(!item.url.match(/^http/i)) {
                                  item.url = item.url.replace(/^#/,'');

                                  // if(!$location.$$html5) {
                                  //   item.url = '#' + item.url;
                                  // }
                                  
                                  if(item.url==$location.$$url) {
                                      $scope.selected = index;
                                  }
                                }
                            }

                            if(el.getAttributeNode('fs-click')) {
                                item.click = el.getAttributeNode('fs-click').nodeValue;
                                item.scope = scope.$parent.$parent;
                            }

                            $scope.items.push(item);
                            index++;
                        }
                    });
       
                    var item = $scope.items[$scope.selected];
                    if(item) {
                      item.style = { color: $scope.accent, borderColor: $scope.accent };
                    }             
                });

                $scope.click = function(item, $event) {

                  angular.forEach($scope.items,function(tmp) {
                      tmp.style = item.$$hashKey==tmp.$$hashKey ? { color: $scope.accent, borderColor: $scope.accent } : {};
                  });

                  if(item.click) {
                      item.scope.$eval(item.click);
                      $event.preventDefault();
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


