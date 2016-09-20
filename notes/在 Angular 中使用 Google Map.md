# 在 Angular 中使用 Google Map

---

##  简介

---

近期项目中需要引入 Google Map，目的是在地图上显示一系列设备的地理位置信息、设备相关的信息、设备的状态信息和相互间的拓扑关系。

我大部分的功能是基于 [angular-google-maps](https://github.com/angular-ui/angular-google-maps) 实现的，还有一部分的功能是直接使用 Google Maps API 实现，下面对我整个的实现过程做一个记录。

## 引入 Google Map

---

### 获取 Google Map 授权
要想使用 Google Map API 功能，首先你需要到 [Google API Console](https://console.developers.google.com) 上注册一个 API KEY（翻墙）。

用你的 Google 账号登录到 [Google API Console](https://console.developers.google.com) 上，然后找到 google 地图 API 部分，选择其中的 Google Maps JavaScript API 项，创建一个秘钥，如下图：


![选择 Google 地图 API 中的 Google Maps JavaScript API 项](http://upload-images.jianshu.io/upload_images/2601216-d679b8e867048119.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后可以看到你的账户名下会生成一个秘钥，我们就是通过这个秘钥才能够使用 Google 地图服务：


![生成的秘钥](http://upload-images.jianshu.io/upload_images/2601216-ec7caa92ed0d2aeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


顺便插一句，Google Maps JavaScript API 对 IE8 浏览器是不提供支持的，目前只支持 IE9 及以上。

### 引入指令 angular-google-maps
有了 API KEY 就可以着手引入 `angular-google-maps` 了，具体的引入过程可以在这个指令的[文档主页]( http://angular-ui.github.io/angular-google-maps)找到。

引入指令的时候需要将上面申请到的 KEY 写入代码配置项，具体如下：
```JavaScript
angular.module( "myGMap", ['uiGmapgoogle-maps'] )
.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
	GoogleMapApi.configure({
		key: 'AI...bla..bla...xsQ', // 配置申请的 key
	});
}])
```

## 使用 angular-google-maps

---

### 设置指令容器的样式
在使用中遇到的第一个问题与这个指令容器的样式有关，当我引入依赖文件，完成简单的配置后，在我的 `index.html` 文件中添加如下代码：

```html
<div ui-gmap-google-map center='map.center' zoom='map.zoom'></div>
```

刷新页面后发现页面上什么都没有，F12 调出熟悉的调试界面，发现地图内的元素的高度都是 0，那么如果给地图中所有的 div 容器设置高度应该可以解决这个问题。后来我查看 github 上的 issue，在里面果然发现了解决方法。

那就是，使用了上面的 html 代码的同时还需要在你的 css 文件中添加如下与高度相关的代码：

```css
.angular-google-map,
.angular-google-map-container{
	width: 100%;
	height: 100%;
}
```

现在地图就可以正常显示出来了：



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
			// icon: "styles/img/server.png",
			title: "SERVER"
		}
	};
```

可以看到地图上显示出一个 marker 标记，指示的是服务器的位置，由于我将 options.icon 设置为自己的图标，所以地图上显示的是我设定的图标。

##### ui-gmap-markers
ui-gmap-markers 指令的主要属性有：
- models：是一个数组，数组的项是要显示的 marker 标记的属性信息
- coords：单个 marker 标记的位置信息
- idkey：marker 的 id
- icon：marker 所使用的 icon
- options：marker 的选项属性
- events：事件与事件处理函数

上述的属性参考的值同 ui-gmap-marker 中的参考值一致，但是有一点需要注意的是：像 coords, icon, options 等属性可以设置成指定的单个 marker 标记的对应属性。
也就是说，models 数组中的每一个 marker 标记都设置有 coords, icon, options 等属性，我们生成的时候可以通过在 coords, icon, options 等外面加上单引号 '' 来指定当生成这些 marker 的时候是从对应 marker 自己内部同名属性中取值。

有点绕，依旧上代码。

假设我们有两类的设备（假定为 deviceA 和 deviceB），那么我们可以对应生成两组标记（假定为 markersDeviceA 和 markersDeviceB ），根据 DRY 原则（偷懒原则）我们可以将生成两组标记的工作抽象成一个服务。

代码如下：



在 index.html 中添加上



### 使用 lines

### window 与 windows

searchbox 显示

### 使用原生的 Google Maps API
