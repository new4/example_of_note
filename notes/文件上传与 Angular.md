# 文件上传与 Angular

---

最近项目需要使用 Angular，对于初学 Angular 的我只能硬着头皮上了，项目中有一个需求是文件上传，磕磕绊绊之下也实现了，将实现过程中学习到的一些知识记录下来以备将来查阅。

本文代码示例可以在我的 [github](https://github.com/new4/example_of_note) 上找到。

### 与表单数据编码相关的知识
---

通常，我们使用 HTML 的标签 `<form>` 来为用户输入创建一个表单，使用 `<input type="file">` 作为文件上传的控件。

要将表单的数据发送给后台，不仅要通过指定 `<form>` 的属性 `method` 来确定发送数据的 HTTP 方法而且需要通过指定 `<form>` 的属性 `enctype` 来确定对发送数据的编码方式。

下面对这两个属性进行简单说明。

#### 表单 form 的属性 `method`

`<form>` 的属性 `method` 规定用于发送 form-data 的 HTTP 方法，其值可以为 `get` 或者 `post`。`get` 请求会将表单的数据编码后以 `name1=value1&name2=value2` 的形式附加到请求的 url 后面进行发送。`post` 请求会将表单的数据进行编码之后置于请求体中进行发送。

本文接下来的讨论主要基于 `post` 请求方式。

#### 表单 form 的属性 `enctype`

`<form>` 标签的属性 `entype` 用来规定在发送表单数据之前应该如何对其进行编码，其实就是用来指定请求的编码类型。   

`enctype`属性有 3 个取值，在 [w3school](http://www.w3school.com.cn/) 中对于其取值的描述如下：

| 取值                              | 描述                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| application/x-www-form-urlencoded | 空格转换为 "+" 加号，特殊符号转换为 [ASCII HEX 值](http://www.w3school.com.cn/tags/html_ref_urlencode.html) |
| multipart/form-data               |不对字符编码。在使用包含文件上传控件的表单时，必须使用该值                                                   |
| text/plain                        | 空格转换为 "+" 加号，但不对特殊字符编码                                                                     |

其中 `application/x-www-form-urlencoded` 是默认采用的编码的方式，如果表单 `<form>` 中有用到文件上传的控件，就要手动指定编码为 `multipart/form-data`。

下面分别对上述这几种编码方式进行举例（均基于 `post` 请求方式）

- 编码为 `application/x-www-form-urlencoded` 的情况

首先，构造一个表单：

```html
<form method="post" action="/" enctype="application/x-www-form-urlencoded">
  <input type="text" name="name1" placeholder="name1">
  <input type="text" name="name2" placeholder="name2">
  <input type="submit">
</form>
```

在输入框内分别输入 `i'm name1` 和 `name@2` ，根据[编码](http://www.w3school.com.cn/tags/html_ref_urlencode.html)规则，提交表单的时候，表单数据会被编码成 `name1=i%27m+name1&name2=name%402` 置于请求体中进行传递，在 `chrome` 浏览器中执行结果也正如预期所示。

![以 `application/x-www-form-urlencoded` 编码来发送的表单数据](http://upload-images.jianshu.io/upload_images/2601216-6e73137c373b14be.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 编码为 `multipart/form-data` 的情况

编码为 `multipart/form-data` 的情况又有所不同，先来看看示例代码的结果。

示例代码：

```html
<form method="post" action="/" enctype="multipart/form-data">
  <input type="text" name="name1" placeholder="name1">
  <input type="text" name="name2" placeholder="name2">
  <input type="file" name="inputfile">
  <input type="submit">
</form>
```

在输入框内分别输入 `i'm name1` 和 `name@2` ，再选择一个名为 testfile.txt 的文件上传，可以在 `chrome` 中看到发送的请求如下：

![以 `multipart/form-data` 编码来发送的表单数据](http://upload-images.jianshu.io/upload_images/2601216-89419dd70d4b1b49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意图片中的红框部分，`Content-Type` 值为 `multipart/form-data; boundary=----WebKitFormBoundaryBdpfgMg4VKAZat6C` ，其中多了一个叫做 `boundary` 的字段，它是由浏览器随机生成的一个字符串，作为表单数据的分割边界来使用的，在服务器端会根据这个 `boundary` 边界字段来解析表单数据。

可以明显看到，以边界分割的每一段均对应于一项表单数据，每项数据均包含有一个 `Content-Disposition` 字段和一个 `name` 字段，而对于上传的文件则会多一个指定上传文件名字的 `filename` 的属性和上传文件的类型的 `Content-Type` 字段，由于例子中上传的文件是 `.txt` 格式的文件，因此 `Content-Type` 的值为 `text/plain`，有关文件的扩展名和 `Content-Type` 的对照表可以看[这里](http://tool.oschina.net/commons)。

- 编码为 `text/plain` 的情况
这种情况与编码为 `application/x-www-form-urlencoded` 的情况类似，唯一的差别就在于 `text/plain` 不对特殊字符进行编码。

### 文件上传的 Angular 实现
---

#### 基于 `FormData` 的实现

实现的思路：通过 `File API` 获取控件中上传的文件，利用 `FormData` 类型构造表单数据上传。

##### 基本知识：`File API` 和 `FormData 类型`

- `File API`

`File API`（文件API）为Web 开发人员提供一种安全的方式来访问用户计算机中的文件，并更好地对这些文件执行操作。

具体来讲，`File API` 在表单中的文件输入字段的基础上，又添加了一些直接访问文件信息的接口。`HTML5` 在 `DOM` 中为文件输入元素添加了一个 `files` 集合。在通过文件输入字段选择了一或多个文件时，`files` 集合中将包含一组 `File` 对象，每个 `File` 对象对应着一个文件。

构造一个文件上传的表单，通过如下 `jQuery` 代码：

```javascript
$("input[type='file']")[0].files
```

在 `chrome` 浏览器控制台中可以看到获得的信息如下：

![](http://upload-images.jianshu.io/upload_images/2601216-8b375c62de78a4a5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到选取的文件 `testfile.txt` 的相关信息，因此可以通过上述方式来获得上传的文件。

关于 `File API` 的更多叙述可以在[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/File)获得。

- `FormData` 类型

`FormData` 是在 `XMLHttpRequest Level 2` 中定义的，为序列化表单以及创建与表单格式相同的数据（用于通过XHR 传输）提供了便利。

下面这段对于 `FormData` 对象的描述引用自 [MDN](https://developer.mozilla.org/zh-CN/)，更多关于 `FormData` 类型的叙述可以在[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData)获得。

>XMLHttpRequest Level 2 添加了一个新的接口 FormData. 利用FormData 对象，我们可以通过 JavaScript 用一些键值对来模拟一系列表单控件，我们还可以使用 XMLHttpRequest 的 send() 方法来异步的提交这个"表单". 比起普通的 ajax, 使用 FormData 的最大优点就是我们可以异步上传一个二进制文件.


可见，我们可以使用 `FormData` 对象来模拟实现文件上传时候提交的表单数据，而构造提交的数据是通过 `FormData` 的方法 `append()` 实现的，它用于给当前 `FormData` 对象添加一个键/值对。

##### Angular 实现

有了上面所说的实现思路和基础知识，现在可以着手进行代码的实现了。

- 首先，编写一个指令用来获取上传文件的 `File` 对象。

代码如下：

```javascript
.directive( "fileModel", [ "$parse", function( $parse ){
  return {
    restrict: "A",
    link: function( scope, element, attrs ){
      var model = $parse( attrs.fileModel );
      var modelSetter = model.assign;

      element.bind( "change", function(){
        scope.$apply( function(){
          modelSetter( scope, element[0].files[0] );
          // console.log( scope );
        } )
      } )
    }
  }
}])
```

这个指令的使用方式如下：

```html
<input type="file" file-model="fileToUpload">
```

对于 `<input>` 元素，在它们失去焦点且 value 值改变时会触发 `change` 事件，因此我们在指令的 `link` 函数中监听元素上的 `change` 事件，在事件响应函数中获取用户上传的文件信息，并且将该文件赋值给 `$scope` 对象中与指令 `fileModel` 绑定的属性（上例中为 `fileToUpload`）。

可以运行例子中的代码，选择一个文件 `filetest.txt`，打印出赋值后的 `$scope` 对象如下：

![将获取的上传文件赋给 `$scope` 对象](http://upload-images.jianshu.io/upload_images/2601216-e24c079662a7d62e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如红框所示，$scope 的属性 `fileToUpload` 即是上传的文件 `filetest.txt` 的信息。

- 然后，编写一个服务用于发送上传文件的 `multipart/form-data` 请求。

代码如下：

```javascript
.service( "fileUpload", ["$http", function( $http ){
  this.uploadFileToUrl = function( file, uploadUrl ){
    var fd = new FormData();
    fd.append( "file", file )
    $http.post( uploadUrl, fd, {
      transformRequest: angular.identity,
      headers: { "Content-Type": undefined }
    })
    .success(function(){
      // blabla...
    })
    .error( function(){
      // blabla...
    })
  }
}])
```

在服务 `fileUpload` 的方法 `uploadFileToUrl` 中，通过 `FormData` 的 `append()` 方法将上传的文件序列化为表单数据，然后通过 `$http.post()` 方法发送给后台。

Angular 默认的 `transformRequest` 方法会尝试序列化我们的 `FormData` 对象，因此此处我们使用 `angular.identity` 函数来覆盖它；另外，angular 在发送 POST 请求的时候使用的默认 `Content-Type` 是 `application/json`，因此此处需要调整为 `undefined`，这时浏览器会自动的帮我们设置成 `multipart/form-data` 的编码方式，同时还会生成一个合适的 `boundary`，如果手动设置成 `multipart/form-data` 的话就不会生成 `boundary` 字段了。

- 最后，在控制器的合适地方发送这个请求。

现在我们已经获得了上传的文件的相关信息，也有一个用于发送该文件的服务，那么只要在控制器中定义一个用于发送的函数，然后在合适的时机调用它即可将文件上传到后台去了。

举个例子，在控制器的 `$scope` 里面定义一个发送请求的函数 `sendFile`：

```javascript
.controller( "myCtrl", [ "$scope", "fileUpload", function( $scope, fileUpload ){
  $scope.sendFile = function(){
    var url = "/server",
        file = $scope.fileToUpload;
    if ( !file ) return;
    fileUpload.uploadFileToUrl( file, url );
  }
}])
```

然后我们可以定义一个按钮，当用户点击这个按钮的时候就会将上传的文件发送出去。

```html
<button type="button" ng-click="sendFile()">Submit</button>
```

结果是这样的：

![通过 `FormData` 上传文件的请求](http://upload-images.jianshu.io/upload_images/2601216-95e0211fcf533d20.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 兼容性

由于 `FormData` 只兼容 IE10+ ，因此上述方法也只是在 IE10+ 中可以使用。

如果你的应用需要兼容 IE8 ，老老实实封装一个含有 iframe 的指令即可，请接着往下看。

#### 含有 iframe 的实现

指令代码如下

```javascript
.directive( "iframeFileUpload", [function(){
  var inner = "<div>";
      inner +=    "<form action=\"/server\" method=\"post\" enctype=\"multipart/form-data\" target=\"uploadIframe\">";
      inner +=        "<input type=\"file\" name=\"filename\">";
      inner +=        "<input type=\"submit\">";
      inner +=      "</form>";
      inner +=      "<iframe id=\"uploadIframe\" name=\"uploadIframe\" style=\"display:none\"></iframe>";
      inner +=    "</div>";
  return{
    restrict: "A",
    template: inner,
    // or
    // templateUrl: "components/iframeFileUpload.html",
    replace: true,
    scope: {},
    link: function( scope, element, attrs ){
      // blabla...
    }
  }
}])
```

调用方式大概是这样的：

```html
<div iframe-file-upload></div>
```
