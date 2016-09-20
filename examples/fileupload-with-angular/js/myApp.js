angular.module( "myApp", [] )
.directive( "fileModel", [ "$parse", function( $parse ){
  return {
    restrict: "A",
    link: function( scope, element, attrs ){
      var model = $parse( attrs.fileModel );
      var modelSetter = model.assign;

      element.bind( "change", function(){
        scope.$apply( function(){
          modelSetter( scope, element[0].files[0] );
          console.log( scope );
        } )
      } )
    }
  }
}])
.directive( "iframeFileUpload", [function(){
  var inner = 		"<div>";
      inner +=    	"<form action=\"/server\" method=\"post\" enctype=\"multipart/form-data\" target=\"uploadIframe\">";
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
      // 可以在此处监听 change 事件、改变控件的外观等等
    }
  }
}])
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
.controller( "myController", [ "$scope", "fileUpload", function( $scope, fileUpload ){
  $scope.sendFile = function(){
    var url = "/server",  // 随便定义的一个 url
        file = $scope.fileToUpload;
    if ( !file ) return;
    fileUpload.uploadFileToUrl( file, url );
  }
}])
