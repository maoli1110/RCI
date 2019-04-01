var campaignId = "f426db4e398c92f45179dcb5ed6865b3727d7c57cc79af25c336907e8b66e948";
//是否有token
var accessToken = decodeURIComponent(getQueryVariable('accessToken'));

//用户名
var username = "";
//绑定的手机
var mobile = "";

var openid = "";

var version = "30";


/**
 * 开始加载
 */
$(function () {

  if (accessToken != "false") {
    //alert(accessToken);
  }

  //验证是否登入
  $.ajax({
    url: "https://www.rcclchina.com.cn/Rccl.Campaign/Campaign/CheckLogin",
    type: "GET",
    data: {
      campaignId: campaignId
    },
    success: function (response) {
      if (response.success) {
        accessToken = response.data
        getUserInfo();
      }
      //
    }
  });

  login();


  /**
   * 登入操作
   * 1、先判断是否登入了 2、登入后判断是否可以领取，
   */
  function login() {
    $('.login').on('click', function () {
		
		//直接检测按钮事件
		clickEvent("get_coupon");
	
      if (username) { // 已登录  直接领优惠券

        //判断是否可以领取
        getcount(mobile);

      } else {
        fwxlogin();
      }
    })
  }

});

/**
 * 获取url参数
 */
function paramstool()
{
  var queryParamList = ['hmsr', 'hmpl', 'hmcu', 'hmkw', 'hmci', 'cs6', 'geo', 'info' , "login" , 'v'];
  var queryParamObj = {};
  var resultparam = "";
  var url = new URL(window.location.href);
  queryParamList.forEach(function (name) {
    if (url.searchParams.get(name)) {
      //queryParamObj[name] = url.searchParams.get(name);
      resultparam = resultparam + "&" +name + "=" + url.searchParams.get(name);
    }
  });

  return resultparam;
}

/**
*去除login标志
*/
function paramstool_login()
{
	var queryParamList = ['hmsr', 'hmpl', 'hmcu', 'hmkw', 'hmci', 'cs6', 'geo', 'info' , 'v'];
  var queryParamObj = {};
  var resultparam = "";
  var url = new URL(window.location.href);
  queryParamList.forEach(function (name) {
    if (url.searchParams.get(name)) {
      //queryParamObj[name] = url.searchParams.get(name);
      resultparam = resultparam + "&" +name + "=" + url.searchParams.get(name);
    }
  });

  return resultparam;
}


function fwxlogin() {

  var resultparam = paramstool();
  //如果未登入则跳到注册登入
  var returnurl = "https://www.rcclchina.com.cn/campaign/cnycamp2019/index.html?v=" + version + "&login=1&campaignId=" + campaignId + resultparam;
  window.location.href = "https://www.rcclchina.com.cn/Orchard.Rccl.Users/Login/Login?returnUrl=" + encodeURIComponent(returnurl);
}



/**
 * 获取用户信息
 * 如果登入回调回来则直接领券
 */
function getUserInfo() {
  if (accessToken && accessToken.length > 0) {
    $.ajax({
      url: "https://www.rcclchina.com.cn/Rccl.Campaign/Campaign/GetUser",
      type: "GET",
      data: {
        campaignId: campaignId,
        accessToken: accessToken
      },
      success: function (response) {
        console.log(response);
        username = response["username"];
        mobile = response["mobile"];
        //$("#userInfo").html(JSON.stringify(response))

        //判断是否是登入回调login 为 1表示第一次登入回调，则送优惠券
        var loginresult = decodeURIComponent(getQueryVariable('login'));
        if (loginresult != null && loginresult != "undefined" && loginresult != "false")
        {
          getcount(mobile);
        }

      }
    })

  }
}

/**
 * 发送短信通知用户
 * @param tel
 */
function  sendsms(tel)
{
  $.ajax({
    url: "https://www.rcclchina.com.cn/Rccl.Campaign/Campaign/SendSms",
    type: "POST",
    data: {
      campaignId: campaignId,
      mobile: tel,
      content:'感谢您参与“皇家船递好运”活动！恭喜您获得：588元立减优惠券3张，官网预订指定航次用券即享立减优惠！点击https://0x9.me/sb3LC查看适用航次，或详询4008207705'
    },
    success: function (response) {
      console.log(response);

    }
  })
}


/**
 * 获取抽奖次数 抽过一次则不让继续抽
 * @param mobile
 */
function getcount(mobile)
{
  //var url="http://rcclchina-api.seventyagency.com.cn/a.php";
  var url="https://shop.h5.gamesoul.com.cn/rcclchina-newship/a.php";

  $.post( url, { act : 'get_yhq_count' , mobile:mobile}, function(a){

    if(!a.success)
    {
      //第一次领直接发3张优惠券
      if (a.count <= 0)
      {
		//直接加次数
		addcount(mobile);
		
        yhq();
        yhq();
        yhq();

		//发送短信
		sendsms(mobile);
		setTimeout(function(){
			window.location.replace('./index.html?type=1'+paramstool_login());
		},500);
        
      }
      else
      {
		setTimeout(function(){
			window.location.replace('./index.html?type=2'+paramstool_login());
		},500);
        
      }
    }
    else
    {
      //alert(a.msg);
    }

  }, "json");
}

/**
 * 增加抽奖次数
 * @param mobile
 */
function addcount(mobile)
{
  //var url="http://rcclchina-api.seventyagency.com.cn/a.php";
  var url="https://shop.h5.gamesoul.com.cn/rcclchina-newship/a.php";
  $.post(url, { act : 'save_count' , mobile:mobile}, function(a){

    if(!a.success)
    {
      //alert(a.msg);
    }
    else
    {
      //alert(a.msg);
    }

  }, "json");
}

//赠送优惠券
function yhq() {
  //生成优惠券码
  var str = Date.parse(new Date()) / 1000 + "";
  var couponCode = randomWord(false, 5) + str.substring(3);

  $.ajax({
    url: "https://www.rcclchina.com.cn/Api/Rccl.Coupon/CouponApi/GiveUserCoupon",
    type: "POST",
    data: {
      couponCode: couponCode,
      as400: "2CP1",
      username: username,
      extraCode: ""
    },
    success: function (response) {
      //送出一张优惠券就加1	  
      
      console.log(response)
      //$("#userInfo").html(JSON.stringify(response))
    }
  });


}


function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

//随机串
function randomWord(randomFlag, min, max) {
  var str = "",
    range = min,
    arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

function isWeixin() {
  return window.navigator.userAgent.indexOf('MicroMessenger') !== -1
}