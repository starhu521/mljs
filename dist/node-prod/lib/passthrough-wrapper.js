
var http=require('http'),noop=require("./noop");var PassThroughWrapper=function(){this.configure();};PassThroughWrapper.prototype.configure=function(username,password,logger){};PassThroughWrapper.prototype.request=function(options,content,callback_opt){if(undefined!=options.contentType){options.headers["Content-type"]=options.contentType;}
return http.request(options,(callback_opt||noop));};PassThroughWrapper.prototype.get=function(options,callback_opt){if(undefined!=options.contentType){options.headers["Content-type"]=options.contentType;}
return http.get(options,(callback_opt||noop));};module.exports=function(){return new PassThroughWrapper()};