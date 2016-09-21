angular.module("myGMap")
.controller( "myCtrl", [ "$scope", function( $scope ){

	function createMarkers(deviceData){
    var i, len, deviceIndex;
    var icon = {
      deviceA: "images/deviceA.png",
      deviceB: "images/deviceB.png"
    }
		var marker = {
      id: deviceData.id,
      coords: deviceData.coords,
      show: true,
      // icon: icon,
      options: { draggable: true, title: deviceData.deviceName },
      selected: false,
      ishover: false
    }

		switch( deviceData.deviceType ){
			case "deviceA":
				marker.icon = icon.deviceA;
				$scope.deviceAMarkers.markers.push( marker );
				break;
			case "deviceB":
				marker.icon = icon.deviceB;
				$scope.deviceAMarkers.markers.push( marker );
				break;
		}
  };

	function createLines(deviceData){
    var i, len, deviceIndex;
    var lineColor = {
      managed: "#4acbd6",
      unmanaged: "#c11c66"
    }

		var line = {
			id: deviceData.id,
			path: [ $scope.serverMarker.coords, deviceData.coords	],
			stroke: {
					color: deviceData.status === "managed" ? lineColor.managed : lineColor.unmanaged,
					weight: 4
			},
			editable: false,
			draggable: false,
			geodesic: true,
			fit: false,
			visible: true
		}

		switch( deviceData.deviceType ){
			case "deviceA":
				$scope.deviceALines.lines.push( line );
				break;
			case "deviceB":
				$scope.deviceBLines.lines.push( line );
				break;
		}
  };

	function getLineItemByDeviceID( lines, id ){
		
	}

	function markersDragHandler(deviceType, marker, eventName, args){
		var lines = $scope[ deviceType + "Lines"].lines;

		console.log( marker );
		console.log( lines );

		// var toLineItem = findLineItemByMarkerID( lines, marker.key );
		// if ( toLineItem ) toLineItem.visible = false;
	}

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
			icon: "images/server.png",
			title: "SERVER"
		}
  };

	// device data
	var data = [
		{ deviceName: "A-1", deviceType: "deviceA", status: "managed", 	 id: 1, coords: { latitude: 41.3, longitude: -73.8 } },
		{ deviceName: "A-2", deviceType: "deviceA", status: "unmanaged", id: 2, coords: { latitude: 41.2, longitude: -73.4 } },
		{ deviceName: "B-1", deviceType: "deviceB", status: "managed", 	 id: 3, coords: { latitude: 40.7, longitude: -73.8 } },
		{ deviceName: "A-3", deviceType: "deviceA", status: "managed", 	 id: 4, coords: { latitude: 40.7, longitude: -74.2 } },
		{ deviceName: "B-2", deviceType: "deviceB", status: "unmanaged", id: 5, coords: { latitude: 41,   longitude: -74.4 } },
		{ deviceName: "A-4", deviceType: "deviceA", status: "managed", 	 id: 6, coords: { latitude: 41.3, longitude: -74.2 } }
	];

	// deviceAMarkers
	$scope.deviceAMarkers = {
		markers: [],
		events:{
				drag: function(marker, eventName, args){
					markersDragHandler( "deviceA", marker, eventName, args );
				}
		}
	};

	// deviceBMarkers
	$scope.deviceBMarkers = {
		markers: [],
		events:{
			drag: function(marker, eventName, args){
				markersDragHandler( "deviceB", marker, eventName, args );
			}
		}
	};

	// deviceALines
	$scope.deviceALines = {
		lines: []
	};

	// deviceBLines
	$scope.deviceBLines = {
		lines: []
	};

	// create
	for( var i = 0, len = data.length; i < len; i ++ ){
		createMarkers( data[i] );
		createLines( data[i] );
	};

	// ------------------------------------------------------------
	console.log( "scope == ", $scope );

}]);
