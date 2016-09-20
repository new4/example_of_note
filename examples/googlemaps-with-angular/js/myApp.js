angular.module( "myGMap", ['uiGmapgoogle-maps'] )
.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	GoogleMapApi.configure({
		key: 'AIzaSyBODcxicW3MBaptaVE8T_hVEd5hnQLQxsQ'
	});
}])
