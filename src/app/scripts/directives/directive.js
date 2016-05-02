(function () {
    'use strict';

    angular.module('fs-angular-tabnav',[])
    .directive('fsTabnav', function($location, $interpolate) {
        return {
            templateUrl: 'views/directives/tabnav.html',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "=?fsSelected"
            },

            link: function($scope, element, attrs, ctrl, $transclude) {
                
                $scope.items = [];
                $transclude(function(clone, scope) {
                    
                    var index = 0;
                    angular.forEach(clone,function(el) {
                        if(el.nodeName.match(/fs-tabnav-item/i)) {

                            var name = el.textContent;
                            if(el.getAttributeNode('fs-url')) {
                                var url = $interpolate(el.getAttributeNode('fs-url').nodeValue)(scope.$parent.$parent);
                                $scope.items.push({ url: url, name: name });

                                if(!angular.isNumber($scope.selected) && url==$location.$$url) {
                                    $scope.selected = index;
                                }
                            }

                            if(el.getAttributeNode('fs-click')) {
                                $scope.items.push({ click: el.getAttributeNode('fs-click').nodeValue, scope: scope.$parent.$parent, name: name });
                            }
                            index++;
                        }
                    });
                });

                $scope.click = function(item) {

                    if(item.url) {
                        $location.path(item.url);
                    
                    } else if(item.click) {
                        item.scope.$eval(item.click);
                    }
                }
            }
        };
    })
})();
