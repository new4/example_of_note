angular.module("myGMap")
.factory( "myGmapSrv", [ function(){
  function createMarkers(deviceData){
    var i, len, deviceIndex;
    var icon = {
      iconA: "theme/default/img/cpe.png",
      iconB: "theme/default/img/wbs.png"
    }

    if ( deviceData.deviceType === "deviceA" ) icon = icon.iconA;
    icon = icon.iconB;

    return {
      id: deviceData.id,
      coords: { latitude: deviceData.latitude, longitude: deviceData.longitude },
      show: true,
      icon: icon,
      options: { draggable: true },
      selected: false,
      ishover: false
    }
  }

  return {
    createMarkers: createMarkers
  }

}])
