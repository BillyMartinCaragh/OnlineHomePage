'use strict';

angular.module('myApp.register', ['ngRoute','firebase'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/register', {
    templateUrl: 'register/register.html',
    controller: 'RegisterCtrl'
  });
}])

.controller('RegisterCtrl', ['$scope','$location','$firebaseAuth','$filter', function($scope,$location,$firebaseAuth,$filter) {
 	$scope.mesg = 'Hello';
 	var firebaseObj = new Firebase("https://radiant-torch-2638.firebaseio.com");
    $scope.checkboxModel = {Value : false};
    var auth = $firebaseAuth(firebaseObj);
        $scope.signUp = function() 
        {
            if (!$scope.regForm.$invalid) 
            {
                var email = $filter('lowercase')($scope.user.email);
                var password = $scope.user.password;
                if (email && password) 
                {
                    auth.$createUser(email, password)
                        .then(function()
                         {
                            // do things if success
                            console.log('User creation success');
                           

                            $scope.$watch('checkboxModel.Value', function (newVal,oldVal)
                            {
                                $scope.checkboxModel.Value = newVal;

                            });             


                            var onComplete = function(error) 
                                  {
                                  if (error) {
                                    console.log('Synchronization failed');
                                  } else {
                                    console.log('Synchronization succeeded');
                                  }
                                };
                            
                            var user = email;
                            //I am replacing apersand within my FireBase URL
                            var UserId = user.replace('@','');
                            var NewUserId = UserId.replace('.','');

                            //When useris created, see if the user has admin rights
                            var userref = new Firebase("https://radiant-torch-2638.firebaseio.com/users/"+NewUserId);

                            userref.push({Admin: $scope.checkboxModel.Value},onComplete); 
                            
                            console.log("User datails pushed into DB");
                            console.log($scope.checkboxModel.Value);
                            alert("User Created successfully, now please log in");
                            $location.path('/home');
                        }, function(error) 
                        {
                            // do things if failure

                            console.log(error);
                            $scope.regError = true;
                            $scope.regErrorMessage = error.message;
                        });
                }
            }
        };
}]);
