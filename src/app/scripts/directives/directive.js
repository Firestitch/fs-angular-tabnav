(function () {
    'use strict';

    angular.module('fs-angular-tabnav',[])
    .directive('fsTabnav', function($location) {
        return {
            templateUrl: 'views/directives/tabnav.html',
            restrict: 'E',
            transclude: true,
            scope: {
               selected: "@fsSelected"
            },

            link: function($scope, element, attrs, ctrl, $transclude) {
                $scope.items = [];

                $transclude(function(clone, scope) {
                    
                    angular.forEach(clone,function(el) {
                        if(el.nodeName.match(/fs-tabnav-item/i)) {

                            var name = el.textContent;
                            if(el.getAttributeNode('fs-url')) {
                                $scope.items.push({ url: el.getAttributeNode('fs-url').nodeValue, name: name });
                            }

                            if(el.getAttributeNode('fs-click')) {
                                $scope.items.push({ click: el.getAttributeNode('fs-click').nodeValue, scope: scope.$parent.$parent, name: name });
                            }
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