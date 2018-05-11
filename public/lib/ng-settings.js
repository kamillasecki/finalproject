/*global angular*/
/*global $*/
var app = angular.module('profSet', ['ngMaterial', 'ngMessages']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('pink')
        .accentPalette('orange');
});

var mainController = function($scope, $http, $mdDialog) {
    $scope.showHints = true;
    
    $scope.changeDname = function() {
        var data = {};
        data.name = $scope.displayName;
        
        var onComplete = function(r) {
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Info')
                .textContent(r.data)
                .ariaLabel('Info')
                .ok('ok')
                .openFrom('#left')
                .closeTo('#right')
            );
        };
        
        var onError = function (r) {
            console.log(r);
        };
        
        $http.put('api/user/changedname', data)
            .then(onComplete, onError)
                .catch(angular.noop);
    };
    
    $scope.changePass = function() {
        var data = {};
        data.newPass = $scope.newPass;
        data.oldPass = $scope.oldPass;
        
        var onComplete = function(r) {
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Info')
                .textContent(r.data)
                .ariaLabel('Info')
                .ok('ok')
                .openFrom('#left')
                .closeTo('#right')
            );
        };
        
        var onError = function (r) {
            console.log(r);
        };
        
        if($scope.newPass == $scope.newPass2){
            $http.put('api/user/changepass', data)
            .then(onComplete, onError)
                .catch(angular.noop);
        } else {
            $mdDialog.show(
                $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Info')
                .textContent("Both new passwords must be the same!")
                .ariaLabel('Info')
                .ok('ok')
                .openFrom('#left')
                .closeTo('#right')
            );
        }
    };
};

function passwordVerify() {
    return {
      restrict: 'A', // only activate on element attribute
      require: '?ngModel', // get a hold of NgModelController
      link: function(scope, elem, attrs, ngModel) {
        if (!ngModel) return; // do nothing if no ng-model

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('passwordVerify', function(val) {
          validate();
        });

        var validate = function() {
          // values
          var val1 = ngModel.$viewValue;
          var val2 = attrs.passwordVerify;

          // set validity
          ngModel.$setValidity('passwordVerify', val1 === val2);
        };
      }
    };
  }

app.controller("mainController", ["$scope", "$http", "$mdDialog", mainController]);
app.directive('passwordVerify', passwordVerify);
