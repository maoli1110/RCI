"use strict";
// $(function () {
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
    'img/1.png',
    'img/2.png',
    'img/3.png',
    'img/4.png',
    'img/5.png',
    'img/scrollbg.png',
    'img/scrollbg3.png',
    'img/logo.png',
    'img/pendant.png',
    'img/pot.png',
    'img/text1.jpg',
    'img/text2.jpg',
    'img/text3.jpg',
    'img/text4.jpg',
    'img/text5.jpg',
    'img/text6.jpg',
    'img/straw.png',
    'img/flower.png',
    'img/wrapper2.png',
    'img/wrapper1.png',
    'img/up.png'
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
      page.init();
    },800)
    console.log('onComplete')
  }
});

loader.start();
var page = (function () {
  var isshaking = false;
  var p0Animate = [
    {className: '.wrapper-top', animate: 'slideInDown'},
    {className: '.wrapper-footer', animate: 'slideInUp'},
    {className: '.wave-wrapper', animate: 'slideInUp'},
    {className: '.pot-wrapper', animate: 'slideInUp'},
    // {className: '.cloudbg', animate: 'slideInDown'},
    {className: '.flower', animate: 'slideInUp'},
    {className: '.straw', animate: 'slideInUp'}
  ];
  var p0OutAnimate = [
    {className: '.wrapper-top', animate: 'slideOutUp'},
    {className: '.wrapper-footer', animate: 'slideOutDown'},
    {className: '.pot-wrapper', animate: 'slideOutDown'},
    {className: '.cloudbg', animate: 'slideOutDown'},
    {className: '.flower', animate: 'slideOutDown'},
    {className: '.straw', animate: 'slideOutDown'}
  ]
  var p0AfterAnimate = [ // 饼，云，光束(等饼下来后加动画)
    {className: '.gift', animate: 'bounceInDown'},
    {className: '.cloud-l', animate: 'slideInLeft'},
    {className: '.cloud-r', animate: 'slideInRight'},
    {className: '.beam', animate: 'zoomIn', delayIn: 500}
  ];
  var p0AfterOutAnimate = [
    {className: '.gift', animate: 'slideOutUp'},
    {className: '.cloud-l', animate: 'slideOutLeft'},
    {className: '.cloud-r', animate: 'slideOutRight'},
    {className: '.beam', animate: 'zoomOut'},
    // {className: '.mask', animate: 'zoomOut'}
  ]
  var couponInAnimate = [
    {className: '.wrapper-top', animate: 'slideInDown'},
    {className: '.wrapper-footer', animate: 'slideInUp'},
    {className: '.cloud-t', animate: 'slideInDown'},
  ]
  var stickerList = [1, 2, 3, 4, 5, 6],
      currentSticker,
      campaignObj = {},
      hotList = [];
  return {
    init: function () {
      function onBridgeReady(){
        WeixinJSBridge.call('hideToolbar');
      }
      if (typeof WeixinJSBridge == "undefined"){
        if( document.addEventListener ){
          document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
        }else if (document.attachEvent){
          document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
          document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
      }else{
        onBridgeReady();
      }
      // 解决微信下方白条导航问题
      $('.login').on('click', function () {
        window.location.replace('./index.html?type=1');
      });
      var currentUrl = new URL(window.location.href);
      var returnModel = currentUrl.searchParams.get('type') ? (1 == currentUrl.searchParams.get('type') ? 'success' : 'fail') : undefined; // ?type=1 为登录成功后返回链接url查询参数
      var geo = currentUrl.searchParams.get('geo') || 'DEFAULT';
      var filterGeo = 'NORTH' ===  geo ? 'tj' : 'sh';
      $('.'+filterGeo).show(); // 根据地区显示部分信息
      // console.log(returnModel)
      // 点击首页向下箭头
      $('.up').on('click',function(){
          var height = $('.page1').height()+20;
         $('.main').attr('style','transform:translate3d(0px, -'+height+'px, 0px); transition-duration: 500ms');
      });

      // 点击船触发摇一摇事件  PC调试用
      $('.wrapper-top').on('click', function () {
        if (!isshaking) {
          isshaking = true;
          p0AfterAnimateFunc()
        }
      });
      
      // 生成tab内容
      if ($.isEmptyObject(campaignObj)) {
        $.getJSON('./json/hot.json', function (data) {
          hotList = data;
          $.getJSON('./json/campaign.json', function (data) {
            campaignObj = data;
            var hotContent = createHotContent(hotList);
            handleCampaignObj(campaignObj, filterGeo, hotContent);
            var tabClone = $('.scrollInP1 .tab-container').clone(true, true)
            // tabClone.find('.tab-btns').addClass('original-btns')
            tabClone.appendTo($('.campaign'))
          })
        })
      }
      // 初始化页面
      if (returnModel) {
        $('.container.index1').show();
        $('.wrapper-top').css('bottom', 'initial')
        $('.up').addClass('inscroll');
        // 优惠券动画
        $.each(couponInAnimate, function (i, obj) {
          $(obj.className).animateCss(obj.animate)
        });
        setTimeout(function () { // 动画完成后加
          $('.scrollInP2').show();
          $('.scrollInP2').addClass('after');
          $('.'+returnModel).fadeIn();
          setTimeout(function () {
            scrollFunc();
          }, 400)
        }, 1000)
      } else {
        $('.container.index').show();
        // p0动画
        $.each(p0Animate, function (i, obj) {
          $(obj.className).animateCss(obj.animate)
        });
        setTimeout(function () {
          $('.cloudbg').addClass('after');
        }, 2000)
      }

      // 第一页上拉显示第二屏促销
      customerTouchFunc($('.wrapper-top'), false, function () {
        $('.wave-wrapper').addClass('after');
        $('.up').fadeOut();
        $('.cloudbg').removeClass('after');
        outAnimateFunc(p0OutAnimate);
        $('.cloud-t').fadeIn(300).animateCss('slideInDown');
        setTimeout(function () {
          $('.scroll-up-p1').find('.original-btns').find('li').first().trigger('click')
          $('.container').addClass('afterScroll').delay(300).queue(function () {
            $('.scrollInP1').fadeIn();
            setTimeout(function () {
              $('.scrollInP1').delay(600).addClass('after');
              $('.scroll-up-p1').delay(600).fadeIn();
              $('.scrollInP1 .scroll-content').scrollTop(0)
            }, 400)
            // .animateCss('slideInDown', function () {
            // })
            $(this).dequeue();
          })
        }, 600);
      });
      // 第一页第二屏促销返回第一屏
      $('.scroll-up-p1').on('click', function () {
        $('.scrollInP1').removeClass('after');
        resetBtns();
        $('.cloud-t').fadeOut();
        setTimeout(function () {
          $('.up').fadeIn();
          $('.scroll-up-p1').hide()
          $('.scrollInP1').hide();
          $('.container').removeClass('afterScroll');
          $('.wave-wrapper').removeClass('after');
          // 从促销回到摇一摇后的界面，不需要还原
          $.each(p0OutAnimate, function (i, obj) {
            $(obj.className).show();
          });
          setTimeout(function () {
            $('.cloudbg').addClass('after');
          }, 1000)
        }, 1000)
      });
      // 生成符图片
      function createStickerFunc(callback) {
        $('.sticker-result').show().animateCss('zoomIn');
        $('.sticker-close').on('click', function (e) {
          $('.sticker-result').animateCss('zoomOut', function () {
            $('.sticker-result').hide();
          });
          $('.mask').fadeOut().css('zIndex', 379);
          $(this).unbind('click');
          callback && callback();
        })
      }
      function outAnimateFunc(animateList) {
        $.each(animateList, function (i, obj) {
          $(obj.className).addClass('faster')
          $(obj.className).animateCss(obj.animate, function () {
            $(obj.className).hide();
          });
        });
      }
      function p0AfterAnimateFunc() {
        // 签筒摇动后续动画
        $('.potshakebg').show();
        $('.pot-wrapper').addClass('faster').animateCss('shake', function () {
          $('.potshakebg').hide();
          // 门框上移下移消失
          $('.wrapper-top').animate({top: -500}, 700, function () {$(this).hide();});
          $('.wrapper-footer').animate({bottom: -500}, 700, function () {$(this).hide();});
          // 波浪+船向放大向下
          $('.wave-wrapper').addClass('after');
          // 背景烟&花&草消失
          $('.cloudbg').fadeOut();
          $('.flower').fadeOut();
          $('.straw').fadeOut();
          var randomNum = Math.floor(Math.random()*stickerList.length);
          currentSticker = stickerList[randomNum];
          stickerList.splice(randomNum, 1);
          $('.sticker-result').find('img').attr('src', 'img/text' + currentSticker + '.jpg?id='+(new Date()).getTime())
          // 签筒下沉，签上浮, 上云出现
          $('.sticker' + currentSticker).css('zIndex', 200).addClass('after');
          $('.pot-wrapper').animate({top: 1500}, 500).queue(function (next) {
            $('.cloud-t').fadeIn(300).animateCss('slideInDown');
            $('.up').fadeOut();
            next();
          }).delay(300).queue(function (next) {
            // 签出现后2s左右(动画需要耗时)，出现遮罩层/圈/左右云/光束，光束需要在圈稳定后出现
            $('.mask').fadeIn();
            $.each(p0AfterAnimate, function (i, obj) {
              var delayIn = obj.delayIn || 0;
              $(obj.className).delay(delayIn).fadeIn().animateCss(obj.animate, function () {
                $(obj.className)
              });
            });
            next();
          }).delay(2000).queue(function (next) {
            // 2s后遮罩层/圈/左右云/光束退出
            outAnimateFunc(p0AfterOutAnimate);
            next();
          }).delay(400).queue(function () {
            $('.mask').css('zIndex', 600);
            $('.scrollInP0').fadeIn(500);
            // 解签， 画轴打开
            createStickerFunc(function () {
             $('.up').addClass('inscroll').fadeIn();
              $('.scrollInP0').removeClass('after').addClass('after');
              $('.pot-wrapper').hide();
              $('.wave-wrapper').css('zIndex', -1);
            });
            $(this).dequeue();
            scrollFunc();
          })
        });
      }
      function scrollFunc() {
        var scrollWrapper = $('.scrollInP0 .content-wrapper, .scrollInP2 .content-wrapper'),
        topContent = scrollWrapper.find('.content-top');
        scrollWrapper.on('scroll', function () {
          var target = $(this).parent().parent().hasClass('scrollInP0') ? 'scrollInP0' : 'scrollInP2'
          var container = $(this).parent().parent().parent().parent().hasClass('index1') ? $('.index1') : $('.index');
          if ($(this).scrollTop() > topContent.height() + $(this).find('.hotsale').outerHeight() + 40) { // + $(this).find('.original-btns').height()
            if (container.find('.fixed-btns').css('display') == 'none') {
              // console.log('show fixed-btns')
              container.find('.fixed-btns').attr('target', target).show();
              $('.up.inscroll').fadeOut();
            }
          } else {
            if (container.find('.fixed-btns').css('display') !== 'none') {
              // console.log('hide fixed-btns')
              container.find('.fixed-btns').attr('target', '').hide();
              $('.up.inscroll').fadeIn();
            }
          }
        })
      }
      function scrollP1Func() {
        $('.scrollInP1 .scroll-content').on('scroll', function () {
          var container = $('.index')
          if ($(this).scrollTop() > $(this).find('.hotsale').height() + $(this).find('.original-btns').outerHeight() + 40) {
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
        })
      }

      function createHotContent(hotList) {
        var hotContent = $('<div/>').addClass('hotsale');
        var hotInstance = $($('#hotsale-instance').html());
        hotContent.append('<img style="width:100%;" src="img/titlehotsale.jpg"/>')
        $.each(hotList, function (i, item) {
          var instance = hotInstance.clone();
          instance.find('.banner-img').attr('src', item.imgUrl);
          instance.find('.banner-title').text(item.title);
          instance.find('.boat').text(item.boatName);
          instance.find('.time').text(item.time);
          instance.find('.days').text(item.days);
          instance.find('.desc').html(item.desc.split('\n').map(function (s) {
            return '<p>' + s + '</p>'
          }));
          instance.find('.tag').text(item.tag);
          instance.find('.currPriceOne').text(item.currentPriceOne);
          instance.find('.origPriceOne').text(item.originalPriceOne);
          instance.find('.currPriceThree').text(item.currentPriceThree)
          instance.find('.origPriceThree').text(item.originalPriceThree)
          instance.find('.fourAvgPrice').text(item.fourAvgPrice);
          instance.find('.link').attr('href', item.link);
          instance.appendTo(hotContent);
        });
        return hotContent;
      }
      function handleCampaignObj(campaignObj, filterGeo, hotContent) {
        // console.log('hotContent', hotContent)
        $.each(campaignObj, function (key, value) {
          // 添加tab选择按钮
          var btnObj = $($('#tabBtn').html());
          btnObj.addClass('tab' + value.index).find('a').addClass('btn-img');
          btnObj.appendTo($('.tab-btns'))
          // 添加tab对应banner内容
          var contentObj = $('<div  class="tab-content"/>');
          var ulObj = $('<ul class="tab-list"/>');
          // banner内容根据地区进行筛选
          value.banners = value.banners.filter(function (b) {
            return !b.geo || filterGeo === b.geo;
          });
          $.each(value.banners, function (i, banner) {
            var liObj = $($('#bannerLi').html());
            liObj.find('.banner-img').attr('src', banner.imgUrl);
            liObj.find('.banner-title').text(banner.title);
            liObj.find('.boat').text(banner.boatName);
            liObj.find('.time').text(banner.time);
            liObj.find('.days').text(banner.days);
            liObj.find('.tag').text(banner.tag);
            liObj.find('.room').text(banner.roomType);
            liObj.find('.origPrice').text(banner.originalPrice);
            liObj.find('.currPrice').text(banner.currentPrice);
            liObj.find('.link').attr('href', "javascript:_a.push(['_trackEvent', 'link', 'click', '跳转监测连接', '']),setTimeout(function(){location.href='"+banner.link+"'}, 200)");
            //liObj.find('.link').attr('href', banner.link);
            if (!banner.isHot) liObj.find('.hot').hide()
            liObj.appendTo(ulObj);
          });
          ulObj.appendTo(contentObj);
          contentObj.appendTo($('.scrollInP1 .tab-container'));

          // tab按钮添加事件
          btnObj.on('click', function () {
            var index = $(this).index();
            $(this).closest('.container').find('.fixed-btns').find('li').removeClass('active').eq(index).addClass('active');
            $(this).parent().find('li').removeClass('active').eq(index).addClass('active');
            $(this).parent().parent().find('.tab-content').hide().eq(index).show();
          });
        });
        $('.tab-btns').find('li').first().trigger('click')
        $('.tab-btns').clone().hide().addClass('fixed-btns').appendTo('.container')
        // 塞爆款
        hotContent.insertBefore($('.tab-btns').not('.fixed-btns'));
        
        $('.fixed-btns').find('li').on('click', function () {
          var index = $(this).index(),
          target = $(this).parent().attr('target');
          // $(this).parent().find('li').removeClass('active').eq(index).addClass('active');
          $('.'+target).find('.original-btns').find('li').eq(index).trigger('click');
        })
        scrollP1Func();
      }

      function resetBtns() {
        $('.fixed-btns').attr('target', '').hide();
        $('.fixed-btns').find('li').removeClass('active').first().addClass('active');
        $('.scrollInP1').find('.tab-btns').find('li').removeClass('active').first().trigger('click');
      }
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion',deviceMotionHandler,false);
        var SHAKE_THRESHOLD = 7000;
        var last_update = 0;
        var x, y, z, last_x = 0, last_y = 0, last_z = 0;
        function deviceMotionHandler(eventData) {
          var acceleration =eventData.accelerationIncludingGravity;
          var curTime = new Date().getTime();
          if ((curTime-last_update)> 10) {
            var diffTime = curTime -last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x +y + z - last_x - last_y - last_z) / diffTime * 10000;
            if (speed > SHAKE_THRESHOLD && isshaking == false) {
              // 摇一摇触发代码
              //检测代码
              clickEvent("luck_draw");
              isshaking = true;
              p0AfterAnimateFunc();
              setTimeout(function(){
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
      // 手动触发上下滑动事件
      function customerTouchFunc(targetObj, isExcludeChild, upCallback, downCallback, excludeObjClass) {
        var ts;
        targetObj.on('touchstart', function (e){
          // console.log('touchstart')
          if (isExcludeChild && e.target != this)
            return;
          if (excludeObjClass && $(e.target).hasClass(excludeObjClass)) {
            return;
          }
          ts = e.originalEvent.touches[0].clientY;
        });
        targetObj.on('touchend touchcancel', function (e){
          // console.log('touchend')
          if (isExcludeChild && e.target != this)
            return;
          if (excludeObjClass && $(e.target).hasClass(excludeObjClass)) {
            return;
          }
          var te = e.originalEvent.changedTouches[0].clientY;
          if(ts > te+5){
            upCallback && upCallback();
          } else {
            downCallback && downCallback(ts, te);
          }
        });
      }
    }
  }
})();