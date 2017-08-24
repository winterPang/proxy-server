/**
 * Created by zhangsen5 on 2016/11/10.
 */

function Base64AndMD5(str) {
  
      return CryptoJS.enc.Base64.stringify(CryptoJS.MD5(str));
  
  }
  
  function HmacSHA256(str,key) {
  
      return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str,key));
  
  }
  var Utils = {};
  
  Utils.notBlank = function(string) {
  
      if(string == null)
          return false;
      if(typeof string != 'string')
          return false;
      if(string == '')
          return false;
      return true;
  }
  
  Utils.checkMethod=function (method) {
  
      if(method!="GET"&&'POST'!=method&&"DELETE"!=method&&"PUT"!=method)
      {
          return false;
      }
      else
          return true;
  
  }
  Utils.returnResult=function (success,msg) {
      var result={};
      result.success=success;
      result.msg=msg;
      if(success==false)
          console.warn(msg);
      return result;
  }
  
  function ArtemisApi(Method,Path){
  
      var method=Method.toUpperCase();
      var key='';
      var secret='';
      var header={};
      var query={};
      var body;
      var pathParam={};
      var host='';
      var url=Path;
      var signHeader='';
      var isBodyForm=false;
      var bodyStr='';
      //var contentType = 'application/json;charset=UTF-8';
      
      if(!Utils.checkMethod(method))
      {
          return Utils.returnResult(false,'http method 必须为 GET/POST/DELETE/PUT');
      }
      if(!Utils.notBlank(url))
      {
          return Utils.returnResult(false,'path为空');
      }
  
      this.setAppSecret=function (appKey,appSecret) {
  
          if(!Utils.notBlank(appKey))
              throw 'appKey 为空';
          if(!Utils.notBlank(appSecret))
              throw 'appSecret 为空';
          key=appKey;
          secret=appSecret;
      }
      this.setHeader=function (Header) {
          if(Header==null)
              throw 'Header is null';
          if(typeof Header!='object')
              throw 'Header 不是一个Object';
          header=Header;
      }
      this.setQuery=function (Query) {
          if(Query==null)
              throw 'Query is null';
          if(typeof Query !='object')
              throw 'Query 不是一个Object';
          query=Query;
      }
      this.setBodyForm=function (bodyForm) {
          if(bodyForm==null)
              throw 'bodyForm is null';
          /*if(typeof bodyForm !='object')
              throw 'bodyForm 不是一个Object';*/
          body=bodyForm;
      }
      this.setBodyStr=function (BodyStr) {
          if(bodyStr==null)
              throw 'bodyForm is null';
          /*if(typeof bodyForm !='object')
           throw 'bodyForm 不是一个Object';*/
          bodyStr=BodyStr;
      }
      this.setpathParam=function (PathParam) {
          if(PathParam==null)
              throw 'PathParam is null';
          if(typeof PathParam !='object')
              throw 'PathParam 不是一个Object';
          pathParam=PathParam;
      }
      this.setHost=function (Host) {
  
          if(Utils.notBlank(Host))
              host=Host;
      };
      this.setContentType=function (ContentType) {
  
          if(Utils.notBlank(ContentType))
              //contentType=ContentType;
              header['Content-Type'] = ContentType;
      };
  
      this.request = function (fn1,fn2) {
          //var data = {};
          url = replacePathParams(url,pathParam);
          isBodyForm=isBodyFormFunction();
          if(Utils.notBlank(key)&&Utils.notBlank(secret)) {
              sign();
          }
          $.ajax({
              type:method,
              url:host+getQueryUrl(),
              //contentType: contentType,
              data:getBody(),
              beforeSend: function(request) {
                  for(var k in header)
                  {
                      request.setRequestHeader(k, header[k]);
                  }
              },
              success: function (reData,textStatus, jqXHR) {
                  fn1(reData, textStatus, jqXHR);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                  fn2(jqXHR, textStatus, errorThrown);
              }
          });        
      }
  
      function getBody() {
          if(isBodyForm) {
              return body;
          }else if(bodyStr){
              return bodyStr;
          }else {
              return {};
          }
      }
  
      function sign() {
          var signStr='';
          header['X-Ca-Timestamp']=Date.parse(new Date());
          header['X-Ca-Key']=key;
          header=jsonSort(header);
          signStr+=method+'\n';
          signStr+=buildBeforeHeader();
          signStr+=buildHeader();
          signStr+=buildResource();
          header['X-Ca-Signature-Headers']=signHeader;
          var hmacsha256=HmacSHA256(signStr,secret);
          header['X-Ca-Signature']=hmacsha256;
          console.log('hmacSha256:'+hmacsha256+'\n');
          console.log('signString:\n'+signStr);
      }
  
      function buildHeader() {
  
          var signStr='';
          for(var k in header)
          {
              if(k!='Accept'&&k!='Content-MD5'&&k!='Content-Type'&&k!='Date')
              {
                  signStr+=k.toLowerCase()+':'+header[k]+'\n';
                  if(signHeader!='')
                      signHeader+=',';
                  signHeader+=k.toLowerCase();
              }
          }
          return signStr;
      }
  
      function buildBeforeHeader() {
          var signStr='';
  
          if(header['Accept']==null)
          {
              header['Accept']='*/*';
          }
  /*        if(isBodyForm)
          {
              header['Content-MD5']='';
  
              signStr+=Base64AndMD5(bodyStr)+'\n';
          }*/
          if(header['Content-Type']==null)
          {
              if(isBodyForm)
                  header['Content-Type']='application/x-www-form-urlencoded;charset=UTF-8';
              else
                  header['Content-Type']='text/plain;charset=UTF-8';
          }
          signStr+=header['Accept']+'\n';
          signStr+=header['Content-Type']+'\n';
          if(Utils.notBlank(header['Date']))
          {
              signStr+=header['Date']+'\n';
          }
          return signStr;
      }
  
      function isBodyFormFunction() {
          var bodyEmpty=true;
          if(bodyStr){
              return false;
          }
          for(var k in body)
          {
              bodyEmpty=false;
              break;
          }
          if(bodyEmpty==false && (method=='POST' || method=='PUT'))
          {
              return true;
          }
          else
          {
              return false;
          }
      }
  
      function buildResource() {
  
          var signStr='';
          var temp={};
          for(var k in query)
          {
              temp[k]=query[k];
          }
          if(isBodyForm)
          {
              for(var k in body)
              {
                  temp[k]=body[k];
              }
          }
          temp=jsonSort(temp);
          for(var k in temp)
          {
              if(signStr!='')
              {
                  signStr+='&';
              }
              signStr+=k+'='+temp[k];
          }
          if(signStr!='')
          {
              signStr=url+'?'+signStr;
          }
          else
              signStr=url;
          return signStr;
      }
  
      function replacePathParams(path,pathParams){
  
          if(pathParams == null||typeof(pathParams)!='object')
              return path;
          for(var k in pathParams)
          {
              var v=pathParams[k];
              if(Utils.notBlank(v))
              {
                  path=path.replace('{'+k+'}',v);
              }
          }
          return path;
  
      }
  
      function getQueryUrl() {
          var str='';
          for(var i in query)
          {
              if(str!='')
              {
                  str+='&';
              }
              str+=i+'='+query[i];
          }
          if(str!='')
              return url+'?'+str;
          else
              return url;
      }
  
      function jsonSort(json)
      {
          if(json==null||typeof(json)!='object')
              return json;
          var array=[];
          for(var i in json)
          {
              var o={};
              o['k']=i;
              o['v']=json[i];
              array.push(o);
          }
          array.sort(sortByKey)
          var result={};
          for(var i=0;i<array.length;i++)
          {
              result[array[i].k]=array[i].v;
          }
  
          return result;
  
          function sortByKey(a,b) {
              return a.k.localeCompare(b.k);
          }
      }
  
  }
  
  
  