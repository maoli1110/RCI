
 $(function() {
	window.share = {
		imgUrl : window.location.origin + '/images/img.jpg',
		link : window.location.href,
		title : "穿越百年芳华，这家照相馆等你探店",
		desc : "走进时光穿梭照相馆，邂逅上世纪芳华的你"
		}
		shareConfig();
	});
	
	function shareConfig(){

		 $.getJSON('a.php?act=jsticket',
        { 'strURL' :  location.href },
        function(data)
        {
            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: data.appid, // 必填，公众号的唯一标识
                timestamp: data.timestamp, // 必填，生成签名的时间戳
                nonceStr: data.nonceStr, // 必填，生成签名的随机串
                signature: data.signature,// 必填，签名，见附录1
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
					'chooseImage',
					'previewImage',
					'uploadImage'
                ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });

            wx.ready(function () {
                $('#bgMusic')[0].play();
                wxcheck();
                function wxcheck(){
                    wx.checkJsApi({
                        jsApiList: [
                            'onMenuShareTimeline',
                            'onMenuShareAppMessage',
							'chooseImage',
							'previewImage',
							'uploadImage'
                        ],
                        success: function (res) {
                            //alert(JSON.stringify(res));

                        }
                    });
                }

                wx.onMenuShareTimeline({
                    imgUrl : window.share.imgUrl,
                    link : window.share.link,
                    title : window.share.desc,
                    desc : window.share.desc,
                    success: function () {
                        // 用户确认分享后执行的回调函数
                        if(_hmt){
                            _hmt.push(['_trackEvent','click', "分享朋友圈"]);
                        }
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });

                wx.onMenuShareAppMessage({
                    imgUrl : window.share.imgUrl,
                    link : window.share.link,
                    title : window.share.title,
                    desc : window.share.desc,
                    trigger: function (res) {
                        //	alert('用户点击分享到朋友圈');
                    },
                    success: function (res) {
                        //	alert('已分享');
                        if(_hmt){
                            _hmt.push(['_trackEvent','click', "分享朋友"]);
                        }
                    },
                    cancel: function (res) {
                        //	alert('已取消');
                    },
                    fail: function (res) {
                        //	alert(JSON.stringify(res));
                    }
                });

            });
        });

		}
	
		
		



