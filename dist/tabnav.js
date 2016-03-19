

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
                            var path = el.getAttributeNode('fs-url') ? el.getAttributeNode('fs-url').nodeValue : '';                        
                            $scope.items.push({ path: path, name: el.textContent });
                        }
                    });
                });

                $scope.redirect = function(path) {
                    $location.path(path);
                }
            }
        };
    });
})();

angular.module('fs-angular-tabnav').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/tabnav.html',
    "<md-tabs md-selected=\"selected\" md-no-pagination md-enable-disconnect md-border-bottom>\r" +
    "\n" +
    "    <md-tab ng-repeat=\"item in items\" ng-click=\"redirect(item.path); $event.preventDefault();\">\r" +
    "\n" +
    "        {{item.name}}\r" +
    "\n" +
    "    </md-tab>\r" +
    "\n" +
    "</md-tabs>\r" +
    "\n"
  );

}]);
