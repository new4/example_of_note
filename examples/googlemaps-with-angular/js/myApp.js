angular.module( "myGMap", ['uiGmapgoogle-maps'] )
.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	GoogleMapApi.configure({
		key: '' // 此处配置你申请的 key
	});
}])
