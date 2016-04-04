'use strict';

angular.module('myApp.welcome', ['ngRoute','ngStorage','firebase','uiGmapgoogle-maps'])


.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/welcome', {
		templateUrl: 'welcome/welcome.html',
		controller: 'WelcomeCtrl'
	});
}])



.controller('WelcomeCtrl', ['$rootScope','$firebase','$filter','$scope','CommonProp','$interval','$localStorage', 
	function($rootScope,$firebase,$filter,$scope,CommonProp,$interval,$localStorage) 
{
	var ref = new Firebase("https://radiant-torch-2638.firebaseio.com/data");
	$scope.username = CommonProp.getUser();


	var user = $scope.username;
	console.log(user);
	//I am replacing apersand within my FireBase URL
	var UserId = user.replace('@','');
	var NewUserId = UserId.replace('.','');
	console.log("NewUserID "+NewUserId);
	var checkifAdmin = new Firebase("https://radiant-torch-2638.firebaseio.com/users/"+NewUserId);

	console.log("https://radiant-torch-2638.firebaseio.com/users/"+NewUserId);
	//$scope.username is the loggedin user
	
	$rootScope.users = [];

	//MAP
	$scope.map = { center: { latitude: 53.3441, longitude: -6.2675 }, zoom: 10, bounds:{} };
	$scope.options = {scrollwheel: true};


	//-----------------------------------
    //CHECK IF USER IS ADMIN 
    //-----------------------------------

	checkifAdmin.once("value", function(snapshot) 
	{

		  // The callback function will get called once
		  snapshot.forEach(function(childSnapshot) 
		  {
		    // crazy key
		    var key = childSnapshot.key();
			console.log("key: "+key);		   
		    // childData will be the actual contents of the child
		    var childData = childSnapshot.val();
		    $scope.AdminVal = childData.Admin;
		    console.log($scope.AdminVal)
		});

		console.log("Admin value inside scope: "+$scope.AdminVal);


		var u = $scope.username.replace('@','');
		var NewU = u.replace('.','');
		var reduceduser = $filter('lowercase')(NewU);

		if($scope.AdminVal!=true)
		{
			console.log("IM NOT A ADMIN");
			//get all the users info
			//var NotAdmin = new Firebase("https://radiant-torch-2638.firebaseio.com/data/"+NewUserId);
				ref.once("value", function(snapshot) 
				{
					//console.log("Number of Users: "+snapshot.numChildren());
					$scope.len = snapshot.numChildren();
					var count = 0;
					$scope.Singleuser = [];
					  // The callback function will get called twice, once for "fred" and once for "barney"
					  snapshot.forEach(function(childSnapshot) 
					  {
					    // key will be = to the usersname
					    var key = childSnapshot.key();
					    var lkey = $filter('lowercase')(key);
					    console.log("Key: "+key);
					    console.log("Scope username: "+$scope.username);
					    console.log("key "+lkey+", Reduced User "+reduceduser); 
					    	if( lkey == reduceduser)
							{
							    //Set the users = to their position in the Array
							    //$scope.Singleuser[0] = key;
							   
							   console.log("key===reduceduser");
								var select = document.getElementById("selectUser");
								var us = key; //$scope.Singleuser[0];
								var el = document.createElement("option");
								el.textContent = us;
								el.value = us;
								select.appendChild(el);

							    // childData will be the actual contents of the child
							    var childData = childSnapshot.val();

							    //Increment Count at the very last part of my forEach statement
							    count++;
							}

					}
					);
				});
			}
			else //if admin
			{
				ref.once("value", function(snapshot) 
				{
					console.log("Im a ADMIN");
					//console.log("Number of Users: "+snapshot.numChildren());
					$scope.len = snapshot.numChildren();
					var count = 0;
					  // The callback function will get called twice, once for "fred" and once for "barney"
					  snapshot.forEach(function(childSnapshot) 
					  {
					    // key will be "newyork" the first time and "test" the second time
					    var key = childSnapshot.key();

					    //Set the users = to their position in the Array
					    $rootScope.users[count] = key;
					   
						var select = document.getElementById("selectUser");
						var us = $rootScope.users[count];
						var el = document.createElement("option");
						el.textContent = us;
						el.value = us;
						select.appendChild(el);

					    // childData will be the actual contents of the child
					    var childData = childSnapshot.val();

					    //Increment Count at the very last part of my forEach statement
					    count++;
					});
				});


			}

		});


	$scope.$watch('selectedUser', function (date)
	{
    	//Declare Start Date
    	$rootScope.selectedUser = $scope.selectedUser;
    	//console.log("Selected User: "+$rootScope.selectedUser);
    	
    });

	//Start Date $ Start Time----------------------------------
	$scope.StartDate = new Date();

	$scope.$watch('StartDate', function (date)
	{
    	//Declare Start Date
    	//console.log("Start date as entered is: "+$scope.StartDate);
    	$rootScope.StartDate = $scope.StartDate;

    });

    $scope.$watch('StartTime', function (date)
	{
    	//Declare Start Date
    	//console.log("Start time as entered is: "+$scope.StartTime);
    	$rootScope.StartTime = $scope.StartTime;
    });


    //End Date & Time ----------------------------------------
    
    $scope.EndDate = new Date();

    $scope.$watch('EndDate', function (date)
    {
    	//console.log($scope.EndDate);
    	$rootScope.EndDate = $scope.EndDate;
    });

    $scope.$watch('EndTime', function (date)
	{
    	//Declare Start Date
    	//console.log("End time as entered is: "+$scope.EndTime);
    	$rootScope.EndTime = $scope.EndTime;
    });


			
	//FirebaseObject?>???????
    $scope.Retrieve = function()
    {
    	//DATE STRING DECLARED
    	$rootScope.StartString = $rootScope.StartDate + ":" + $rootScope.StartTime;
    	$rootScope.EndString = $rootScope.EndDate + ":" + $rootScope.EndTime;

    	//Converting the date string into timestamp because timestamp is used to ref FB
    	$scope.StartTS = Date.parse($rootScope.StartString);
    	$scope.EndTS = Date.parse($rootScope.EndString);
    	//console.log("Start Timestamp: " + $scope.StartTS);
    	//console.log("End Timestamp: "+ $scope.EndTS);

    	alert("Search Started");

		//Declaring the firebase URL according to the user selected
		var ref = new Firebase("https://radiant-torch-2638.firebaseio.com/data/"+$rootScope.selectedUser);
		//console.log(ref);
		
		var query = ref.orderByChild("Time").startAt($scope.StartTS).endAt($scope.EndTS);

		query.on('value', function(snapshot) 
			{
				var data = snapshot.val();
			
			});

			//If you're trying to bind the query results to an AngularJS view, you do this by:
		  	$scope.items = $firebase(query).$asArray();

		 
		 //Wait till FB has downloaded all info before plotting on map
			$scope.items.$loaded().then(function(items) 
			{

    			console.log("Length: "+$scope.items.length);
    			//Track Markers
    			$scope.markers = [];
    			$scope.speedtracker =  0;

    			for (var j=0; j < $scope.items.length; j++) 
				{

					$scope.Lat = $scope.items[j].Latitude; 
					$scope.Lon = $scope.items[j].Longitude;
					$scope.Speed = $scope.items[j].Speed * 3.6;


					if($scope.Speed>$scope.speedtracker)
					{
						$scope.speedtracker = $scope.Speed;
					}
					
					//console.log("Latitude: "+$scope.Lat+","+"Longitude: "+$scope.Lon)
					//console.log(j);
				 	$scope.markers.push({	
									    	id: j,
									    	control:{},
					                		latitude: parseFloat($scope.Lat),
					                		longitude: parseFloat($scope.Lon),
					                		icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
						            	});

				 	//$scope.map.bounds.extend

				}

				//Centre my map around my returned results mid point
					//$scope.map.bounds = {$scope.markers[0].latitude};
					if($scope.markers[0] != null)
					{
						$scope.map.bounds = {
												northeast: 
												{
												    latitude: $scope.markers[0].latitude,
												    longitude: $scope.markers[0].longitude
												},
												southwest: 
												{
												    latitude: $scope.markers[$scope.items.length-1].latitude,
												    longitude: $scope.markers[$scope.items.length-1].longitude
												}
											};

					}
					else //If the user has no information
					{

						console.log("The user has no information");
						alert("The user has no information");
					}
				//Haversine Forulae to calculate distance between points
				function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) 
				{
				  var R = 6371; // Radius of the earth in kilometers
				  var dLat = deg2rad(lat2 - lat1); // deg2rad below
				  var dLon = deg2rad(lon2 - lon1);
				  var a =
				    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
				    Math.sin(dLon / 2) * Math.sin(dLon / 2);
				  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				  var d = R * c; // Distance in KM
				  //console.log(d);
				  return  d;
				  
				}

				function deg2rad(deg) {
				  return deg * (Math.PI / 180)
				}

				$scope.Total = 0.0;

				for (var x=0; x < $scope.markers.length-1; x++) 
				{

					var y = x+1;
					//console.log("Lat x: "+ $scope.markers[x].Latitude+", Lon x: "+ $scope.markers[x].Longtitude+ ", Lat y: " +$scope.markers[y].Latitude+", Lon: "+ $scope.markers[y].Longitude)
					$scope.Distance = _getDistanceFromLatLonInKm($scope.markers[x].latitude, $scope.markers[x].longitude, $scope.markers[y].latitude, $scope.markers[y].longitude);
					$scope.Total = $scope.Total + $scope.Distance;
					
				}

				console.log("Distance Travelled: "+ $scope.Total + " Km/h");

			});

	


	}

	$scope.LogOut = function()
	{

		
	}



}
]);


