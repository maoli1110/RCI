(function ($) {

    Trip = function() {
		this.init();
    };
    $.extend(Trip.prototype, {
		
        init: function(data) {
			$('.p2 a').off().on('touchstart',function (e) {
				this.year_id = $(this).index();
				$('.p3').css('background','url(./images/'+this.year_id+'.png) no-repeat center')
				$(this).parent().hide().next().show();
                $('.p3 a').removeClass().addClass('btn'+this.year_id )
            })

			$('.p3 a').on('touchstart',function () {
                $(this).parent().hide().next().show();
            })
        },

		go:function () {
			console.log('123')
        },

        usechooseimg : function () {

			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: function (res) {s
					var localIds = res.localIds;
					var sId = '';
					var dataid = localIds.toString();
					if(isiOS == true){
						wx.getLocalImgData({
							localId: dataid, // 图片的localID
							success: function (res) {
								var localData = res.localData; // localData是图片的base64数据，可以用img标签显示

								ajaxPic(localData)
							}
						});
					}
					if(isAndroid == true){
						wx.uploadImage({
							localId:dataid, // 需要上传的图片的本地ID，由chooseImage接口获得
							isShowProgressTips: 1, // 默认为1，显示进度提示
							success: function (res) {
								var serverId = res.serverId; // 返回图片的服务器端ID

								ajaxandrowPic(serverId)
							}
						});
					}
				}
			});
        },

		
		makeCanvas:function(){
			this.mycanvas=document.getElementById('myCanvas');
			this.context=this.mycanvas.getContext('2d');
			this.context.fillStyle = "#000";
			var that = this;
		
			var bg=$('#hb')[0]
			bg.onload=function(){
				that.context2.save();
				that.context2.drawImage(bg,0,0);
				that.context2.restore();
			}
				

				
			
		},

		pingCard : function(){
			var self=this;
			this.context2.font="bold 30px 黑体";  
			this.context2.fillText(this.nikname,270-10*this.nikname.length,980);
			this.context2.font="bold 24px 黑体"; 
			this.context2.fillText(this.career,275-10*this.career.length,1020);
			
			if(!this.isWX){
				var pimage = self.mycanvas.toDataURL("image/png").replace("data:image/png;base64,", "");
					setTimeout(function(){
						self.changeImg(pimage)
					},1000)	
			}else{
				var bg=$('#hb')[0]
				
				var img = new Image(); 
				img.src =  this.images.localId; 	
				img.onload = function () { 
				//	self.context.drawImage(img,230,786,110,130);
					console.log('11')
					  var xpos = 56;
					  var ypos = 65;
					 // that.context2.drawImage(img,0,0);
					  self.context2.save();
					  self.context2.translate(xpos, ypos);
					  self.context2.rotate(1 * Math.PI / 180);//旋转47度
					  self.context2.translate(-xpos, -ypos);
					  self.context2.drawImage(img, 240,786);
					  self.context2.restore();
					  var pimage = self.mycanvas.toDataURL("image/png").replace("data:image/png;base64,", "");
					setTimeout(function(){
						self.changeImg(pimage)
					},1000)	
				}	
				
			}
			
			 
			
		},
		
		changeImg:function(imgurl){
			$.post('a.php', { act : 'upload_image' , img:imgurl}, function(a){
				
				if(!a.success)
				{
					$('.kv>img').attr('src',a.imgurl)
					$('.kv').show()
					$('.shadow,.photo').fadeOut(200);
				}
				else
				{
					console.log('出问题啦')
				}
				
			}, "json");
		},
		
		ajaxPic:function(serverId){
			var that = this; 
			$.post('a.php', { act : 'download' , media_id:serverId.toString()}, function(a){
				
				if(!a.success)
				{
					that.images.localId = a.imgurl2;
					$('.setphoto>img').attr('src',a.imgurl2);
					$('.setphoto>img').fadeIn();
				}
				else
				{
					alert(a.msg);
					}
				
			}, "json");
			
		},
		

	
    });
})(jQuery);



$(function() {
  window.alitrip = new Trip();
});


