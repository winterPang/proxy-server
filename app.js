'use strict';

var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');
var url = require('url');
var fs = require('fs');
var express = require('express')

var PROXY_PORT = 8000;
var httpsPort  = 9000;
var proxy, server;
const app = express();

app.use(function(req,res,next){
    // res.cookie('CASTGC', 'TGT-54-cJiSusXjNGtC9esoP1KO9L0UbtnTN1XR4FJZVhdHHWEb6B1P6D-cas', { secure: true });
    // res.cookie('JSESSIONID', '702BE90C463D01D44680388A8C6E41CB', { secure: true });
     next()
})

app.use(express.static(__dirname + '/public'));//设置静态文件目录

// Create a proxy server with custom application logic
proxy = httpProxy.createProxy({});

proxy.on('error', function (err) {
    console.log('ERROR');
    console.log(err);
});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
    console.log('RAW Request from the target =====start====');
    // proxyReq.setHeader('Cookie',' CASTGC=TGT-54-cJiSusXjNGtC9esoP1KO9L0UbtnTN1XR4FJZVhdHHWEb6B1P6D-cas; _safe_license=true; JSESSIONID=702BE90C463D01D44680388A8C6E41CB; remember=admin ')  ;
    console.log('RAW Request from the target =====end====');
});

proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('RAW Request from the target =====start====');
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    console.log('RAW Request from the target =====end====');
    //res.json({"a":1,"b":2})
    // console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});
   
  // 
  // Listen for the `open` event on `proxy`. 
  // 
proxy.on('open', function (proxySocket) {
    // listen for messages coming FROM the target here 
    
  });
   
  // 
  // Listen for the `close` event on `proxy`. 
  // 
proxy.on('close', function (res, socket, head) {
    // view disconnected websocket connections 
   
  });

app.use('/notify_url',function(req, res){
    console.log("===========notify_url============")
})

app.use('/',function(req, res){
    console.warn('------------originalUrl   start----------')
    console.warn(req.originalUrl)
    console.warn('-----------originalUrl   end-----------')
    console.warn('------------headers   start----------')
    console.warn(req.headers)
    console.warn('-----------headers   end-----------')
    //  var finalUrl = 'https://18.50.129.151:9999/';
    //  var finalUrl = 'http://127.0.0.1:8080/';
    var finalUrl = 'https://open8200.hikvision.com';
    // var finalUrl = 'https://api.megvii.com';
    var finalAgent = null;
     var parsedUrl = url.parse(finalUrl);
     console.warn('------------finalUrl  start----------')
     console.warn(parsedUrl)
     console.warn('------------finalUrl   end-----------')
     if (parsedUrl.protocol === 'https:') {
         finalAgent = https.globalAgent;
     } else {
         finalAgent = http.globalAgent;
     }
     var headers = {};
     for(const k in req.headers){
        headers[k] = req.headers[k];
     }
     delete req.headers.host;
     //写死cookie
    //  req.headers.cookie = 'CASTGC=TGT-54-cJiSusXjNGtC9esoP1KO9L0UbtnTN1XR4FJZVhdHHWEb6B1P6D-cas; _safe_license=true; JSESSIONID=702BE90C463D01D44680388A8C6E41CB; remember=admin'
     headers.host = parsedUrl.hostname;
     proxy.web(req, res, {
         target: finalUrl,
         agent: finalAgent,
         headers: headers,
        // prependPath: false,
       //  xfwd : false,
         secure: false,
        // hostRewrite: finalUrl.host,
        // protocolRewrite: parsedUrl.protocol
     });
})


server = http.createServer(app);

// google代理
// server = http.createServer(function (req, res) {
//     //var finalUrl = req.url,
//     var finalUrl = 'https://www.google.com';
//     var finalAgent = null;
//     var parsedUrl = url.parse(finalUrl);

//     if (parsedUrl.protocol === 'https:') {
//         finalAgent = https.globalAgent;
//     } else {
//         finalAgent = http.globalAgent;
//     }
//     console.log('2222222222222222')
//     proxy.web(req, res, {
//         target: finalUrl,
//         agent: finalAgent,
//         headers: { host: parsedUrl.hostname },
//         prependPath: false,
//         xfwd : true,
//         hostRewrite: finalUrl.host,
//         protocolRewrite: parsedUrl.protocol
//     });
// });

console.log('listening on port ' + PROXY_PORT);

// var targetServer = http.createServer(function(req,res){
//     console.warn("===============targetServer===============")
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
//     res.end();  
// })
// targetServer.listen('8080')
server.listen(PROXY_PORT);

const certifiacteOpt = {
    key: fs.readFileSync('./certificate/server.key'),
    cert: fs.readFileSync('./certificate/server.crt'),
    passphrase: '11111111' //证书密码
}

var httpsServer = https.Server(certifiacteOpt, app);

//https默认de监听端口时443，启动1000以下的端口时需要sudo权限
httpsServer.listen(httpsPort, function(err){  
    console.log("https listening on port: " + httpsPort);
});