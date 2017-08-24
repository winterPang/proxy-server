  $(function () {

      //延迟初始化
      $(document).ready(function () {
          setTimeout(function () {
              init();
          }, 500);
      });

      //初始化
      function init() {
          var OCXobj = document.getElementById("PlayViewOCX");
          var txtInit = $("#config").val();
          OCXobj.ContainOCX_Init(txtInit);
      }

      //提交按钮
      $('.submit').on('click', function () {
          var PalyType = $('.PalyType').val();
          var SvrIp = $('.SvrIp').val();
          var SvrPort = $('.SvrPort').val();
          var appkey = $('.appkey').val();
          var appSecret = $('.appSecret').val();
          var time = $('.time').val();
          var timeSecret = $('.timeSecret').val();
          var httpsflag = $('.httpsflag').val();
          var CamList = $('.CamList').val();

          var param = 'ReqType:' + PalyType + ';' + 'SvrIp:' + SvrIp + ';' + 'SvrPort:' + SvrPort + ';' + 'Appkey:' + appkey + ';' + 'AppSecret:' + appSecret + ';' + 'time:' + time + ';' + 'timesecret:' + timeSecret + ';' + 'httpsflag:' + httpsflag + ';' + 'CamList:' + CamList + ';';

          play_ocx_do(param);

      });

      $('.close').on('click', function () {
          var param = 'hikvideoclient://VersionTag:artemis;Exit:1;';
          play_ocx_do(param);

      });


      ////OCX控件视频处理函数
      function play_ocx_do(param) {
          if ("null" == param || "" == param || null == param || "undefined" == typeof param) {
              return;
          } else {
              var OCXobj = document.getElementById("PlayViewOCX");
              console.log(OCXobj)
              OCXobj.ContainOCX_Do(param);
          }
      }

      //刷新或者关闭当前页面前关闭当前页面上的OCX窗口和VideoClient进程
      window.onunload = function(){
          var param = 'hikvideoclient://VersionTag:artemis;Exit:1;';
          play_ocx_do(param);
      }
  });