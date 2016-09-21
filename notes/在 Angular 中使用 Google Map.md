# 在 Angular 中使用 Google Map
---

##  简介
---

近期项目中需要引入 Google Map，需求之一是在地图上显示一系列设备地理位置信息、设备的状态信息和设备间的网络拓扑关系。

我大部分的功能是基于指令 [angular-google-maps](https://github.com/angular-ui/angular-google-maps) 实现的，还有一部分的功能是直接使用 Google Maps API 实现，这里对基本的实现过程做一个记录。

## 引入 Google Map
---

### 获取 Google Map 授权

要想使用 Google Map API 功能，首先需要到 [Google API Console](https://console.developers.google.com) 上注册一个 API KEY（翻墙）。

用你的 Google 账号登录到 [Google API Console](https://console.developers.google.com) 上，然后找到 google 地图 API 部分，选择其中的 Google Maps JavaScript API 项，创建一个秘钥，如下图：

![选择 Google 地图 API 中的 Google Maps JavaScript API 项](http://upload-images.jianshu.io/upload_images/2601216-d679b8e867048119.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后可以看到你的账户名下会生成一个秘钥，只有通过这个秘钥才能够使用 Google 地图服务：

![生成的秘钥](http://upload-images.jianshu.io/upload_images/2601216-ec7caa92ed0d2aeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

顺便插一句，Google Maps JavaScript API 对 IE8 浏览器是不提供支持的，目前只支持 IE9 及以上。

### 引入指令 angular-google-maps

有了 API KEY 就可以着手引入 `angular-google-maps` 了，关于这个指令的介绍和具体的引入方法可以在这个指令的[文档主页]( http://angular-ui.github.io/angular-google-maps)找到。

注意一点，在引入指令的时候需要将上面申请到的 KEY 写入代码配置项，具体如下：

```JavaScript
angular.module( "myGMap", ['uiGmapgoogle-maps'] )
.config( ['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	GoogleMapApi.configure({
		key: 'AI......xsQ', // 配置你申请的 key
	});
}]);
```

## 使用 angular-google-maps

---

### 设置指令容器的样式
在使用中遇到的第一个问题与这个指令容器的样式有关，当我引入依赖文件，完成简单的配置后，在我的 `index.html` 文件中添加如下代码：

```html
<div ui-gmap-google-map center='map.center' zoom='map.zoom'></div>
```

刷新页面后发现页面上什么都没有，F12 调出熟悉的调试界面，发现地图内的元素的高度都是 0，那么如果给地图中所有的 div 容器设置高度应该可以解决这个问题。后来我查看 github 上的 issue，在里面果然发现了解决方法。那就是在使用了上面的 html 代码的同时还需要在你的 css 文件中添加如下与高度相关的代码：

```css
.angular-google-map,
.angular-google-map-container{
	width: 100%;
	height: 100%;
}
```

现在地图就可以正常显示出来了：

![正确显示的地图]()

### 使用 marker 和 markers 显示设备位置

要在地图上显示出设备位置，自然而然的我们想到使用 marker 标记，在 angular-google-maps 中与 marker 相关的指令有两个：ui-gmap-marker 和 ui-gmap-markers。从命名上也可以看出来，前者显示的是单个的 marker，后者用于显示多个 marker。

根据我们的需求，一个服务器连着多台不同种类的设备，因为服务器只有一个，可以用 ui-gmap-marker 指令予以显示；其它设备有多台而且分为不同种类，可以对同种类的设备使用 ui-gmap-markers 指令。

##### ui-gmap-marker
ui-gmap-marker 指令主要的属性有：
- idKey：marker 的标识
- coords：用来指定 marker 标记的位置（经纬度坐标），包含有 latitude 和 longitude 两个属性的对象
- click：指定点击 marker 标记时的处理函数
- options：指令的配置项，详细选项可以参考[这里](https://developers.google.com/maps/documentation/javascript/reference#MarkerOptions) ，需要提醒的一个属性是 options.icon，我们可以利用这个属性来引入自己的 marker 图片
- events：指定在 marker 上发生的事件及处理函数，关于 marker 标记的详细 events 可以看[这里](https://developers.google.com/maps/documentation/javascript/reference#Marker)

那么在地图上显示服务器的代码可以这么写。

在 index.html 中增加下面代码：

```html
	<!-- server marker -->
	<ui-gmap-marker coords="serverMarker.coords"
									options="serverMarker.options"
									idkey="serverMarker.id"></ui-gmap-marker>
```

在控制器的 js 文件中增加下面代码：

```javascript
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
```

可以看到地图上显示出一个 marker 标记，指示的是服务器的位置，由于我将 options.icon 设置为自己的图标，所以地图上显示的是我设定的图标。

![ui-gmap-marker 标签生成单个服务器 marker 标记]

##### ui-gmap-markers
ui-gmap-markers 指令的主要属性有：
- models：是一个数组，数组的项是要显示的 marker 标记的属性信息
- coords：单个 marker 标记的位置信息
- idkey：marker 的 id
- icon：marker 所使用的 icon
- options：marker 的选项属性
- events：事件与事件处理函数

上述的属性参考的值同 ui-gmap-marker 中的参考值一致，但是有一点需要注意：像 coords, icon, options 等属性可以设置成指定的单个 marker 标记的对应属性。
也就是说，models 数组中的每一个 marker 标记都含有 coords, icon, options 等属性，我们使用 ui-gmap-markers 标签的时候可以通过在 coords, icon, options 等属性外面加上单引号 '' 来指定当生成这些 marker 的时候是从对应 marker 自己内部同名属性中取值。

假设我们有两类设备（deviceA 和 deviceB），那么我们可以对应使用两组标记（假定为 markersDeviceA 和 markersDeviceB ）表示，这里我们构造一份包含有设备基本信息的数据，同时用函数 createMarkers 负责两组标记的生成工作。同时，为了区分不同设备，在网上找了两个图标 deviceA.png 和 deviceB.png 表示不同种类设备（侵删）。

js 代码如下：
```javascript
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

// device markers
// --------------
var data = [
	{ deviceName: "A-1", deviceType: "deviceA", ststus: "managed", 	 id: 1, coords: { latitude: 41.3, longitude: -73.8 } },
	{ deviceName: "A-2", deviceType: "deviceA", ststus: "unmanaged", id: 2, coords: { latitude: 41.2, longitude: -73.4 } },
	{ deviceName: "B-1", deviceType: "deviceB", ststus: "unmanaged", id: 3, coords: { latitude: 40.7, longitude: -73.8 } },
	{ deviceName: "A-3", deviceType: "deviceA", ststus: "managed", 	 id: 4, coords: { latitude: 40.7, longitude: -74.2 } },
	{ deviceName: "B-2", deviceType: "deviceB", ststus: "unmanaged", id: 5, coords: { latitude: 41,   longitude: -74.4 } },
	{ deviceName: "A-4", deviceType: "deviceA", ststus: "managed", 	 id: 6, coords: { latitude: 41.3, longitude: -74.2 } }
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
```

在 index.html 中的标签 ui-gmap-google-map 内加上代码:

```html
<!-- device A markers -->
<ui-gmap-markers models="deviceAMarkers.markers"
								 coords="'coords'"
								 icon="'icon'"
								 options="'options'"></ui-gmap-markers>

<!-- device B markers -->
<ui-gmap-markers models="deviceBMarkers.markers"
								 coords="'coords'"
								 icon="'icon'"
								 options="'options'"></ui-gmap-markers>
```

刷新页面，就可以看到地图上出现了我们的设备：



![ui-gmap-markers 标签生成不同种类的多个 marker 标记]


### 使用 ui-gmap-polyline 绘制网络拓扑
目前我们已经成功的在地图上显示出了所有的设备，现在我们需要显示多一些信息：网络拓扑以及设备的状态。设备与服务器之间的连接可以用简单的连线进行表示，设备被管理的状态可以用连线的颜色表示（红色表示未被管理，蓝色表示被管理）。

此处利用 ui-gmap-polyline 和 ng-repeat 进行绘制。

ui-gmap-polyline 指令的主要属性有：
- path：定义连线起始点和终止点的经纬度
- stroke：可以定义连线的颜色、线宽和不透明度
- clickable：定义连线是否响应 click 事件
- draggable：定义连线是否可拖动
- editable：定义连线是否可编辑（改变形状之类的）
- geodesic：定义连线是否适应地球的地形（曲率）
- visible：显示或者隐藏连线
- fit：使地图边界和连线相适
- events：事件响应处理函数，详细内容可以看[这里](https://developers.google.com/maps/documentation/javascript/reference#Polyline)

与我们生成设备 marker 一致，我们也将连线按照 deviceA 和 deviceB 进行划分，用函数 createLines 负责两组连线的生成工作。

js 代码如下：

```javascript
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
	createLines( data[i] );
}
```

刷新页面，就可以看到地图上在设备和服务器之间出现了连线，这些简单的连线表明了网络的拓扑结构，连线的颜色表示了设备是否处于被管理的状态。



![ui-gmap-polyline 标签绘制网络拓扑]


当然此处只是针对设备直连服务器这一简单情况作的示例，在实际开发中更一般的还会包含有设备之间互连的情况，这种情况下连线就会稍微复杂一点，此时只需要获取到当前设备的下游设备就可以绘制出整个网络的拓扑结构了。


有时候设备在地图上面显示的位置可能会有偏差，此时我们就有拖动设备 marker 标记来修改设备坐标的需求了，理想的情形如下：
- 拖动设备时与设备相关的连线全部隐藏
- 拖动结束后显示新的连线

此处就用到 marker 的 event 选项了，events 属性中有一项是 drag，它指定了在 marker 发生拖动事件时的处理函数，我们可以在这个处理函数中隐藏连线；events 还有一个属性项是 dragend，可以用它指定拖动事件结束时的处理函数，我们可以在这个处理函数中设置新连线的端点并显示。

js 代码如下：

```javascript
function markersDragHandler(deviceType, marker, eventName, args){
	var lines = $scope[ deviceType + "Lines"].lines;
	var line = getLineItemByDeviceID( lines, marker.model.id );
	if ( line ) line.visible = false;
}

function markersDragendHandler(deviceType, marker, eventName, args){
	var lines = $scope[ deviceType + "Lines"].lines;
	var line = getLineItemByDeviceID( lines, marker.model.id );
	if ( !line ) return;
	var location = {
		latitude: marker.getPosition().lat(),
		longitude: marker.getPosition().lng()
	}
	line.path[1] = location;
	if ( !line.visible ) line.visible = true;
}

// deviceAMarkers
$scope.deviceAMarkers = {
	markers: [],
	events:{
			drag: function(marker, eventName, args){
				console.log( "deviceA drag!" );
				markersDragHandler( "deviceA", marker, eventName, args );
			},
			dragend: function(marker, eventName, args){
				console.log( "deviceA drag end!" );
				markersDragendHandler( "deviceA", marker, eventName, args );
			}
	}
};

// deviceBMarkers
$scope.deviceBMarkers = {
	markers: [],
	events:{
		drag: function(marker, eventName, args){
			console.log( "deviceB drag!" );
			markersDragHandler( "deviceB", marker, eventName, args );
		},
		dragend: function(marker, eventName, args){
			console.log( "deviceB drag end!" );
			markersDragendHandler( "deviceB", marker, eventName, args );
		}
	}
};
```

相应的在 index.html 中给 ui-gmap-markers 指令添加 events 属性：

```html
<!-- device A markers -->
<ui-gmap-markers models="deviceAMarkers.markers"
								 coords="'coords'"
								 icon="'icon'"
								 options="'options'"
								 events="deviceAMarkers.events"
								 ></ui-gmap-markers>

<!-- device B markers -->
<ui-gmap-markers models="deviceBMarkers.markers"
								 coords="'coords'"
								 icon="'icon'"
								 options="'options'"
								 events="deviceBMarkers.events"
								 ></ui-gmap-markers>
```

此时的拖动行为就是正常的了，进一步；了解 Marker events 的其它事件可以看[这里](https://developers.google.com/maps/documentation/javascript/reference#Marker)。


### 其它

上述内容仅仅是实现了一些简单的显示，作为在 angular 中成功引入 Google maps 来说足够了，如果想要了解更多的功能可以到这个指令的[文档主页]( http://angular-ui.github.io/angular-google-maps)进一步了解。

如果你对这个指令的部分内容不满意，想在代码中获得更多的自由，可以直接调用 [Google Maps APIs](https://developers.google.com/maps/documentation/javascript/3.exp/reference) 也是完全可以的，这时可以通过在 ui-gmap-google-map 指令 events 属性中监听 tilesloaded 事件来获取当前地图的实例。

具体方式如下：

js 代码：

```javascript
$scope.map = {
	center: {
		latitude: 41,
		longitude: -74
	},
	zoom: 10,
	events: {
		tilesloaded: function(map) {
			$scope.$apply(function() {
				console.log( "map instance --> ", map );
			});
		}
	}
};
```

index.html 中添加：
```html
<ui-gmap-google-map center='map.center' zoom='map.zoom' events="map.events">
	<!-- blablabla -->
</ui-gmap-google-map>
```

此处获取到了 map 的实例，就可以利用它来使用 Places 库之类的功能，也就可以进一步拓展你的项目的功能了。
