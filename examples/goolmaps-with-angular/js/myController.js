angular.module("myGMap")
.controller( "myCtrl", [ "$scope", function( $scope ){

	function createMarkers(deviceData){
    var i, len, deviceIndex;
    var icon = {
      iconA: "theme/default/img/cpe.png",
      iconB: "theme/default/img/wbs.png"
    }
		var marker = {
      id: deviceData.id,
      coords: { latitude: deviceData.latitude, longitude: deviceData.longitude },
      show: true,
      // icon: icon,
      options: { draggable: true, title: deviceData.deviceName },
      selected: false,
      ishover: false
    }

		switch( deviceData.deviceType ){
			case "deviceA":
				// marker.icon = icon.iconA;
				$scope.deviceAMarkers.markers.push( marker );
				break;
			case "deviceB":
				// marker.icon = icon.iconB;
				$scope.deviceAMarkers.markers.push( marker );
				break;
		}
  };

	$scope.map = {
    center: {
      latitude: 41,
      longitude: -74
    },
    zoom: 10
  };

  // server marker
  $scope.serverMarker = {
    id: 0,
    coords: {
      latitude: 41,
      longitude: -74
    },
    options: {
			// draggable: true,
			// icon: "styles/img/server.png",
			title: "SERVER"
		}
  };

	// device markers
	// --------------
	var data = [
		{ deviceName: "A-1", deviceType: "deviceA", id: 1, latitude: 41.3, longitude: -73.8 },
		{ deviceName: "A-2", deviceType: "deviceA", id: 2, latitude: 41.2, 	 longitude: -73.4 },
		{ deviceName: "B-1", deviceType: "deviceB", id: 3, latitude: 40.7, longitude: -73.8 },
		{ deviceName: "A-3", deviceType: "deviceA", id: 4, latitude: 40.7, longitude: -74.2 },
		{ deviceName: "B-2", deviceType: "deviceB", id: 5, latitude: 41,   longitude: -74.4 },
		{ deviceName: "A-4", deviceType: "deviceA", id: 6, latitude: 41.3, longitude: -74.2 }
	];
	// deviceA
	$scope.deviceAMarkers = {
		markers: []
	};

	// deviceB
	$scope.deviceBMarkers = {
		markers: []
	};

	for( var i = 0, len = data.length; i < len; i ++ ){
		createMarkers( data[i] );
	}


}]);
