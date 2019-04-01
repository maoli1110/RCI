"use strict";
// $(function() {
//   page.init();
// });
$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };
      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));
    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });
    return this;
  },
});

// 预加载图片
var loader = new resLoader({
  resources: [
    'img/load-ship.png',
    'img/load-wave.png',
    'img/1.png',
    'img/2.png',
    'img/3.png',
    'img/4.png',
    'img/5.png',
    'img/back.png',
    'img/cloud-back.png',
    'img/coupon.png',
    'img/coupongray.png',
    'img/flower.png',
    'img/l-cloud.png',
    'img/light.png',
    'img/load-ship.png',
    'img/logo.png',
    'img/pc2.png',
    'img/pot.png',
    'img/r-cloud.png',
    'img/scrollbgwave.png',
    'img/ship.png',
    'img/ship.png',
    'img/straw.png',
    'img/t-cloud.png',
    'img/title.png',
    'img/title.png',
    'img/titlehotsale.jpg',
    'img/scrollbg.png',
    'img/scrollbg2.png',
    'img/base.png',
    'img/zi1.png',
    'img/zi2.png',
    'img/zi3.png',
    'img/zi4.png',
    'img/zi5.png',
    'img/zi6.png',
    'img/hot/1.png',
    'img/hot/2.png',
    'img/hot/3.png',
    'img/hot/4.png',
    'img/mb_gp/1.png',
    'img/mb_gp/2.png',
    'img/mb_gp/3.png',
    'img/mb_gp/4.png',
    'img/mb_gp/5.png',
    'img/mb_gp/6.png',
    'img/mb_gp/7.png',
    'img/mb_lz_v1/1.png',
    'img/mb_lz_v1/2.png',
    'img/mb_lz_v1/3.png',
    'img/mb_lz_v1/4.png',
    'img/mb_lz_v1/5.png',
    'img/mb_lz_v1/6.png',
    'img/mb_lz_v1/7.png',
    'img/mb_lz_v1/8.png',
    'img/mb_lz_v2/1.png',
    'img/mb_lz_v2/2.png',
    'img/mb_lz_v2/3.png',
    'img/mb_lz_v2/4.png',
    'img/mb_lz_v2/5.png'
  ],
  onStart: function(total) {
  },
  onProgress: function(current, total) {
    var percent = ((current / total)*100+'').split('.')[0]+'%';
    console.log(percent, 'percent')
    $('.loading-percent').text(percent)
  },
  // 开始动画
  onComplete: function(total) {
    setTimeout(function(){
      $(".loading").hide();
      $('.container-wrap.coupon').hide();
      $('.container-wrap.main').hide();
      page.init();
    },800)
    console.log('onComplete')
  }
});

loader.start();

var page = (function() {
  var isshaking = false;
  var isAllowClick = true;
  var checkcouponUrl = 'https://www.rcclchina.com.cn/Rccl.UserCenter/UserCoupon/UserCoupon';
  var p0Animate = [
    // { className: '.wrapper-top', animate: 'slideInDown' },
    //{ className: '.wrapper-footer', animate: 'slideInUp' },
    //{ className: '.wave-wrapper', animate: 'slideInUp' },
    //{ className: '.pot-wrapper', animate: 'slideInUp' }
  ];
  var p0OutAnimate = [
    { className: '.wrapper-top', animate: 'slideOutUp' },
    { className: '.wrapper-footer', animate: 'slideOutDown' },
    { className: '.pot-wrapper', animate: 'slideOutDown' }
  ]
  var p0AfterAnimate = [ // 饼，云，光束(等饼下来后加动画)
    { className: '.gift', animate: 'bounceInDown' },
    { className: '.cloud-l', animate: 'slideInLeft' },
    { className: '.cloud-r', animate: 'slideInRight' },
    { className: '.beam', animate: 'zoomIn', delayIn: 500 }
  ];
  var p0AfterOutAnimate = [
    { className: '.gift', animate: 'slideOutUp' },
    { className: '.cloud-l', animate: 'slideOutLeft' },
    { className: '.cloud-r', animate: 'slideOutRight' },
    { className: '.beam', animate: 'zoomOut' },
    // {className: '.mask', animate: 'zoomOut'}
  ]
  var couponInAnimate = [
    // { className: '.wrapper-top', animate: 'slideInDown' },
    { className: '.wrapper-footer', animate: 'slideInUp' },
    { className: '.cloud-t', animate: 'slideInDown' },
  ]
  var stickerList = [1, 2, 3, 4, 5, 6],
    currentSticker,
    campaignObj = {},
    hotList = [];
  return {
    init: function() {
      /*计算scale比例*/
      var calculateSacle = function() {
        var defaultHeight = 900;
        var realHeight = $(window).height();
        var realWidth = $(window).width();
        var sacleingY = realHeight / 1080;
        var sacleingX = realWidth / 1920;
        var calHeight = realHeight * sacleingY;
        var calWidth = 1920 * sacleingY;
        // $('.page1').attr('style','transform:scale('+sacleingX+','+sacleingY+')');
        // $('.page1').css('height',calHeight+'px');
        $('.page1').css('width', calWidth + 'px');
      }



      var windowHeight = $('body').height();
      var navHeight = $('.head_top').height()?$('.head_top').height():0;
      $('.page1').height(windowHeight - navHeight);
      $('.page2').height(windowHeight);
      // 根据导航栏判断是否显示优惠券
	  /*
      $('.login').on('click', function() {
        window.location.replace('./index.html?type=1');
      });
	  */
      calculateSacle();

      // var currentUrl = new URL(window.location.href);
      var urlParams = {};
      window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        urlParams[key] = value;
      });
      var returnModel = urlParams.type ? (1 == urlParams.type ? 'success' : 'fail') : undefined; // ?type=1 为登录成功后返回链接url查询参数
      var geo = urlParams.geo || 'DEFAULT';
      var filterGeo = 'NORTH' === geo ? 'tj' : 'sh';
      $('.title.' + filterGeo).show(); // title图片根据地区显示
      // 点击首页向下箭头
      $('.up').on('click', function() {
         $('.container-wrap.main').hide();
        $('.page2').addClass('showSingle');
        var height = $('.page1').height() + navHeight;
        $('.container-wrap.main').attr('style', 'transform:translate3d(0px, -' + height + 'px, 0px); transition-duration: 500ms');
      })
      $('.sales_back').on('click', function() {
         $('.page2').removeClass('showSingle');
        var height = $('.page1').height() // + 80;

        $('.container-wrap.main').attr('style', 'transform:translate3d(0px, 0px, 0px); transition-duration: 500ms');
        page.init();
      })

      $('.rule-event').on('click',function () {
        $('.rule-mask').show();
        $('.wrapper-footer').css('zIndex', 100);
        $('.wrapper-top').css('zIndex', 100);
        $('.pot-wrapper-click').css('zIndex',100)
      })
      $('.rule-close').on('click',function () {
        $('.rule-mask').hide();
        $('.wrapper-footer').css('zIndex', 401);
        $('.wrapper-top').css('zIndex', 401);
        $('.pot-wrapper-click').css('zIndex', 500);
      })
      // 点击船触发摇一摇事件  PC调试用
      $('.click-pot').on('click', function() {
        p0AfterAnimateFunc()
      });
      // 生成tab内容
      if ($.isEmptyObject(campaignObj)) {
        $.getJSON('./json/hot.json', function(data) {
          hotList = data;
          $.getJSON('./json/campaign.json', function(data) {
            campaignObj = data;
            var hotContent = createHotContent(hotList);
            var explainContent = $($('#explain').html());
            handleCampaignObj(campaignObj, filterGeo, hotContent,explainContent);
            var tabClone = $('.scrollInP1 .tab-container').clone(true, true)
            // tabClone.find('.tab-btns').addClass('original-btns')
            tabClone.appendTo($('.campaign'))
          })
        })
      }
      // 初始化页面
      if (returnModel) {
        $('.wrapper-top').hide();
        $('.coupon').show();
        // 优惠券动画
        $.each(couponInAnimate, function(i, obj) {
          $(obj.className).animateCss(obj.animate)
        });
        $('.wrapper-top').fadeIn(500);
        setTimeout(function() { // 动画完成后加
          $('.scrollInP2').show();
          $('.' + returnModel).show();
          $('.scrollInP2').addClass('after');
          setTimeout(function() {
            scrollFunc();
          }, 400)
        }, 1000)
      } else {
        $('.container-wrap.main').show();
        // p0动画
        $('.wrapper-top').fadeIn(500);
        $.each(p0Animate, function(i, obj) {
          //$(obj.className).animateCss(obj.animate)
        });
        setTimeout(function() {
          $('.cloudbg').addClass('after');
        }, 1500)
        setTimeout(function() {
          $('.page2').css('display', 'block');
        }, 3000)
      }
      // 立即预订点击事件
      $('.gosale').on('click', function () {
        var height = $('.page1').height() //+ 80;
        $('.container-wrap.main').attr('style', 'transform:translate3d(0px, -' + height + 'px, 0px); transition-duration: 500ms');
      });

      // $('.checkcoupon').on('click', function () {
      //  window.location.href=checkcouponUrl;
      // })
      // $('.coupon-content').on('click',function () {
      //   window.location.href=checkcouponUrl;
      // })

      // 签文带出2888大礼包，注册可领取
      function createStickerFunc(callback) {
        $('.sticker-result').show().animateCss('zoomIn');
        $('.sticker-result').animateCss('zoomOut', function() {
          $('.sticker-result').hide();
          $('.mask').fadeOut().css('zIndex', 379);
        })
      }

      function outAnimateFunc(animateList) {
        $.each(animateList, function(i, obj) {
          $(obj.className).addClass('faster')
          $(obj.className).animateCss(obj.animate, function() {
            $(obj.className).hide();
          });
        });
      }

      function p0AfterAnimateFunc() {
        // 防止二次点击
        if(!isAllowClick) return; 
        isAllowClick = false;
        setTimeout(function() {
          isAllowClick = true;
        },5000);
        // 签筒摇动后续动画
        $('.sticker-wrapper').find('.sticker').each(function(index){
          // console.log(index,'index')
          var index = index+1;
          $(this).removeClass('sticker'+index).addClass('stickerStatic'+index);
          $('.pot-wrapper-shake').addClass('animated').addClass('shake');
        })
        setTimeout(function(){
            afterShake();
        },1500);
        function afterShake() {
          $('.cloudbg').hide();
          // 门框上移下移消失
          $('.wrapper-top .pendant').animate({ top: -500 }, 700, function() { $(this).hide(); });
          $('.wrapper-top .title').animate({ top: -500 }, 700, function() { $(this).hide(); });
          $('.wrapper-footer').animate({ bottom: -500 }, 700, function() { $(this).hide(); });
          // 波浪+船向放大向下
          // $('.wave-wrapper').addClass('after');
          var randomNum = Math.floor(Math.random() * stickerList.length);
          currentSticker = stickerList[randomNum];
          stickerList.splice(randomNum, 1);
          console.log(currentSticker)
          $('.login-content').attr('src', 'img/zi' + currentSticker + '.png')
          // 签筒下沉，签上浮, 上云出现
          $('.sticker' + currentSticker).css('zIndex', 200).addClass('after');
          $('.pot-wrapper').animate({ top: 1500 }, 500).queue(function(next) {
              $('.cloud-t').fadeIn(300).animateCss('slideInDown');
              next();
            })
            .delay(300).queue(function(next) {
              // 签出现后2s左右(动画需要耗时)，出现遮罩层/圈/左右云/光束，光束需要在圈稳定后出现
              $('.mask').fadeIn(200);
              $.each(p0AfterAnimate, function(i, obj) {
                var delayIn = obj.delayIn || 0;
                $(obj.className).delay(delayIn).fadeIn().animateCss(obj.animate, function() {
                  $(obj.className)
                });
              });
              next();
            })
            .delay(2500).queue(function(next) {
              // 2.5s左右后遮罩层/圈/左右云/光束退出
              outAnimateFunc(p0AfterOutAnimate);
              next();
            })
            .delay(500).queue(function() {
              $('.mask').fadeOut(200);
              // $('.wrapper-top').css('bottom', 'initial').css('zIndex', 250)
              $('.scrollInP0').fadeIn(500);
              $('.scroll-content-click').css('display', 'block');
              // 签文带出2888大礼包，注册可领取
              setTimeout(function() {
                // $('.pot-wrapper').hide();
                $('.mask').fadeIn(200);
                $('.scrollInP0').removeClass('after').addClass('after');
                // $('.wave-wrapper').css('zIndex', 200);
                // $('.wrapper-footer').animate({ bottom: 0 }, 700, function() { $(this).show(); });
              }, 1600)
            })
        }
      }

      function scrollFunc() {
        var scrollWrapper = $('.scrollInP0 .content-wrapper, .scrollInP2 .content-wrapper'),
          topContent = scrollWrapper.find('.content-top');
        scrollWrapper.on('scroll', function() {
          var target = $(this).parent().parent().hasClass('scrollInP0') ? 'scrollInP0' : 'scrollInP2'
          var container = $(this).parent().parent().parent().parent().hasClass('.index1') ? $('.index1') : $('.index');
          var originalBtnWidth = $('.original-btns').width();
          $('.fixed-btns').width(originalBtnWidth);

          if ($(this).scrollTop() > topContent.height() + $(this).find('.hotsale').outerHeight() + 40) { // + $(this).find('.original-btns').height()
            if (container.find('.fixed-btns').css('display') == 'none') {
              // console.log('show fixed-btns')
              container.find('.fixed-btns').attr('target', target).show();
            }
          } else {
            if (container.find('.fixed-btns').css('display') !== 'none') {
              // console.log('hide fixed-btns')
              container.find('.fixed-btns').attr('target', '').hide();
            }
          }
        })
      }

      function scrollP1Func() {
        document.getElementsByClassName("page2_wrap")[0].onscroll = function() {
          var container = $('.page2');
          var originalBtnWidth = $('.original-btns').width();
          $('.fixed-btns').css('width', originalBtnWidth);
          var startScope = $(this).find('.hotsale').height() + $(this).find('.original-btns').outerHeight() + $(this).find('.original-btns').outerHeight() + 40 ;
          var endScope = $(this).find('.hotsale').height() + $(this).find('.original-btns').outerHeight() + $(this).find('.original-btns').outerHeight() + 40 + $('.tab-content').height() ;
          if (($(this).scrollTop() >= startScope) && ($(this).scrollTop() <= endScope)) {
            if (container.find('.fixed-btns').css('display') == 'none') {
              // console.log('hide origin')
              container.find('.fixed-btns').attr('target', 'scrollInP1').show();
            }
          } else {
            if (container.find('.fixed-btns').css('display') !== 'none') {
              // console.log('show origin')
              container.find('.fixed-btns').attr('target', '').hide();
            }
          }
        };
      }

      function createHotContent(hotList) {
        var hotContent = $('<div/>').addClass('hotsale');
        var hotInstance = $($('#hotsale-instance').html());
        hotContent.append('<img src="img/titlehotsale.jpg"/>')
        $.each(hotList, function(i, item) {
          var instance = hotInstance.clone();
          instance.find('.banner-img').attr('src', item.imgUrl);
          instance.find('.banner-title').text(item.title);
          instance.find('.boat').text(item.boatName);
          instance.find('.time').text(item.time);
          instance.find('.days').text(item.days);
          instance.find('.desc').html(item.desc.split('\n').map(function(s) {
            return '<p>' + s + '</p>'
          }));
          instance.find('.tag').text(item.tag);
          instance.find('.currPriceOne').text(item.currentPriceOne);
          instance.find('.origPriceOne').text(item.originalPriceOne);
          instance.find('.currPriceThree').text(item.currentPriceThree)
          instance.find('.origPriceThree').text(item.originalPriceThree)
          instance.find('.fourAvgPrice').text(item.fourAvgPrice);
		  instance.find('.price-desc').text(item.priceDesc);
          //instance.find('.link').attr('href', "javascript:_a.push(['_trackEvent', 'link', 'click', '跳转监测连接', '']),setTimeout(function(){location.href='" + item.link + "'}, 200)");
          instance.find('.link').attr('href', item.link);
          instance.appendTo(hotContent);
        });
        console.log(hotContent)
        return hotContent;
      }

      function handleCampaignObj(campaignObj, filterGeo, hotContent,explainContent) {
        // console.log('hotContent', hotContent)
        $.each(campaignObj, function(key, value) {
          // 添加tab选择按钮
          var btnObj = $($('#tabBtn').html());
          btnObj.addClass('tab' + value.index).find('a').addClass('btn-img');
          btnObj.appendTo($('.tab-btns'))
          // 添加tab对应banner内容
          var contentObj = $('<div  class="tab-content"/>');
          var ulObj = $('<ul class="tab-list"/>');
          // banner内容根据地区进行筛选
          value.banners = value.banners.filter(function(b) {
            return !b.geo || filterGeo === b.geo;
          });
          $.each(value.banners, function(i, banner) {
            var liObj = $($('#bannerLi').html());
            liObj.find('.banner-img').attr('src', banner.imgUrl);
            liObj.find('.banner-title').text(banner.title);
            liObj.find('.boat').text(banner.boatName);
            liObj.find('.time').text(banner.time);
            liObj.find('.days').text(banner.days);
            liObj.find('.tag').text(banner.tag);
            liObj.find('.room').text(banner.roomType);
            liObj.find('.origPrice').text('¥' + banner.originalPrice);
            liObj.find('.currPrice').text('¥' + banner.currentPrice);
			liObj.find('.price-desc-tab').text(banner.priceDesc);
            //liObj.find('.link').attr('href', "javascript:_a.push(['_trackEvent', 'link', 'click', '跳转监测连接', '']),setTimeout(function(){location.href='" + banner.link + "'}, 200)");
            liObj.find('.link').attr('href', banner.link);
            if (!banner.isHot) liObj.find('.hot').hide()
            liObj.appendTo(ulObj);
          });
          ulObj.appendTo(contentObj);
          contentObj.appendTo($('.tab-container'));

          // tab按钮添加事件
          btnObj.on('click', function() {
            var index = $(this).index();
            if (index === 0) {
              $('.tab2').removeClass('active');
              $('.tab1').addClass('active');
            } else {
              $('.tab1').removeClass('active');
              $('.tab2').addClass('active');
            }
            $(this).parent().parent().find('.tab-content').hide().eq(index).show();
          });
        });
        $('.tab-btns').find('li').first().trigger('click')
        $('.tab-btns').clone().hide().addClass('fixed-btns').appendTo('.main .page2')
        // 塞爆款
        hotContent.insertBefore($('.tab-btns').not('.fixed-btns'));
        $('.fixed-btns').find('li').on('click', function() {
          var index = $(this).index(),
            target = $(this).parent().attr('target');
          // $(this).parent().find('li').removeClass('active').eq(index).addClass('active');
          $('.' + target).find('.original-btns').find('li').eq(index).trigger('click');
        });
        explainContent.insertAfter('.campaign')
        explainContent.appendTo($('.tab-container'));
        scrollP1Func();
      }

      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', deviceMotionHandler, false);
        var SHAKE_THRESHOLD = 9000;
        var last_update = 0;
        var x, y, z, last_x = 0,
          last_y = 0,
          last_z = 0;

        function deviceMotionHandler(eventData) {
          var acceleration = eventData.accelerationIncludingGravity;
          var curTime = new Date().getTime();
          if ((curTime - last_update) > 10) {
            var diffTime = curTime - last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000;
            if (speed > SHAKE_THRESHOLD && isshaking == false) {
              // 摇一摇触发代码
              isshaking = true;
              p0AfterAnimateFunc();
              setTimeout(function() {
                window.removeEventListener("devicemotion", deviceMotionHandler, false);
                isshaking = false;
              }, 2500);
            }
            last_x = x;
            last_y = y;
            last_z = z;
          }
        }
      }

      window.onresize = function() {
        // calculateSacle();
        // window.location.reload(); 
        // console.log($('.page2').hasClass('showSingle'),'display')
        var wWidth = $(window).width();
        var wHeight = $(window).height();
        if(wWidth && wHeight)
         var a = $(window).height();
         console.log(a,'a')
        if(!$('.page2').hasClass('showSingle')){
          var a = $(window).height();
          $('.page2').height(a);
          page.init();
        }
        if($('.page2').hasClass('showSingle')){
          var a = $(window).height();
          $('.page2').height(a);
        }
        
      }
    }
  }
})();