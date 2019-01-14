"use strict";
$(function () {
    canvas.init()
})
var canvas = (function () {
    var year_id,c_sex='1',isiOS,isAndroid,imgbase64,mycanvas,canvas_context,imgfm,allMetaData,imgorgin,canvas_context2;

    return {
        init: function () {
            $(window).on('touchmove.prevent', function(e) {
                e.preventDefault();
            });

            var u = navigator.userAgent, app = navigator.appVersion;
            isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
            isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

            mycanvas = document.getElementById('myCanvas');
            canvas_context = mycanvas.getContext('2d');
            canvas_context2 = mycanvas.getContext('2d');

            if(is_weixn()){
                $('#rightcmr,.step2 #rightcmr').hide();
            }else{
                $('#rightcmr,.step2 #rightcmr').show();
            }

            clickfun()
        }

    };

    function clickfun() {
        $('.p0').on('touchstart',function () {
            $('#bgMusic')[0].play();
            $('.music').hide()
            $(this).hide().next().fadeIn()
        })

        $('.music').on('touchstart',function () {
           var cls =  $(this).attr('class');
           if(cls == 'music off'){
               $('#bgMusic')[0].play();
               $(this).removeClass('off')
           }else{
               $('#bgMusic')[0].pause();
               $(this).addClass('off')
           }
        })

        $('.p2 a').off().on('touchstart',function (e) {
            year_id = $(this).index();
            $('.p3').css('background','url(./images/'+year_id+'.png) no-repeat center')
            $(this).parent().hide().next().show();
            $('.p3 a').removeClass().addClass('btn'+year_id )
            $('.ping').attr('src','images/k'+year_id+'.png')
        })

        $('.p3 a,.btn_start').on('touchstart',function () {
            $(this).parent().hide().next().show();
        })

        $('.p4 .c-sex span').on('touchstart',function (e) {
            $('.p4 span').removeClass('on')
            $(this).addClass('on')
            c_sex = $(this).attr('data-id')
            console.log(c_sex)
        })

        $('.mypic').on('touchstart',function () {
            usechooseimg();
        })

        $('.rightcamera').change(function () {
            PreviewImage(this);
        });

        $('.btn_pic').on('touchstart',function () {
            var img_did = $('.mypic').attr('data-id')
            if(img_did == '0'){
                alert('请上传个人照片！')
                return;
            }else{
                $('.tips').fadeIn()
                ajaxpinImg(imgbase64,c_sex,year_id)
            }
        })

        $('.btn_back').on('touchstart',function () {
            $('.p5').hide();
            $('.p2').show()
        })
        $('.btn_share').off().on('touchstart',function () {
            $('.sharetips').show()
        })
        $('.sharetips').off().on('touchstart',function () {
            $(this).hide()
        })
    }

    function usechooseimg(){

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                var localIds = res.localIds;
                var sId = '';
                var dataid = localIds.toString();
                $('.tips').fadeIn()
                if(isiOS == true){
                    wx.getLocalImgData({
                        localId: dataid, // 图片的localID
                        success: function (res) {
                            var localData = res.localData; // localData是图片的base64数据，可以用img标签显示
                            imgbase64 = localData;
                            $('.pin').attr('src',localData)
                            setpicimg(localData)
                        }
                    });
                }else{
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
    };

    function PreviewImage(fileObj) {
        $('.tips').fadeIn()
        var Orientation = null;
        var allowExtention = ".jpg,.jpeg,.png"; //允许上传文件的后缀名document.getElementById("hfAllowPicSuffix").value;
        var extention = fileObj.value.substring(fileObj.value.lastIndexOf(".") + 1).toLowerCase();
        var browserVersion = window.navigator.userAgent.toUpperCase();
        var file = fileObj.files['0'];
        console.log(file)
        EXIF.getData(file, function() {
            allMetaData = EXIF.getAllTags(this);
            imgorgin = allMetaData.Orientation
        });

        if (allowExtention.indexOf(extention) > -1) {
            if (fileObj.files) {//HTML5实现预览，兼容chrome、火狐7+等
                if (window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {

                        var url = e.target.result
                      //  var imgurl = url.replace("image/jpeg;", "image/png;");
                        console.log(e)
                        $('.pin').attr('src',url)

                     setTimeout(function () {
                            canvasResize()
                        },500)


                    }
                    reader.readAsDataURL(fileObj.files[0]);
                } else if (browserVersion.indexOf("SAFARI") > -1) {
                    alert("不支持Safari6.0以下浏览器的图片预览!");
                }
            } else if (browserVersion.indexOf("MSIE") > -1) {

            } else if (browserVersion.indexOf("FIREFOX") > -1) {//firefox
                var firefoxVersion = parseFloat(browserVersion.toLowerCase().match(/firefox\/([\d.]+)/)[1]);
                if (firefoxVersion < 7) {//firefox7以下版本
                    //	inputimgeurl =fileObj.files[0].getAsDataURL();
                    var url = fileObj.files[0].getAsDataURL()
                //    var imgurl = url.replace("image/png;", "image/png;");
                    $('.pin').attr('src',url)
                    setTimeout(function () {
                        canvasResize()
                    },500)

                } else {//firefox7.0+
                    //inputimgeurl =fileObj.files[0].getAsDataURL();
                    var url = fileObj.files[0].getAsDataURL()
                //    var imgurl = url.replace("image/jpeg;", "image/png;");
                    $('.pin').attr('src',url)
                    setTimeout(function () {
                        canvasResize()
                    },500)

                }
            } else {
                var url = fileObj.value
             //   var imgurl = url.replace("image/jpeg;", "image/png;");
                $('.pin').attr('src',url)
                setTimeout(function () {
                    canvasResize()
                },500)
            }
        } else {
            alert("仅支持" + allowExtention + "为后缀名的文件!");
            fileObj.value = ""; //清空选中文件
            if (browserVersion.indexOf("MSIE") > -1) {
                fileObj.select();
                document.selection.clear();
            }
            fileObj.outerHTML = fileObj.outerHTML;
        }

        $('.loadtip').hide();
        return fileObj.value;    //返回路径

    };

    function ajaxpinImg(serverId,my_sex,my_year){
        console.log(serverId)
        alert('test');
        var image = new Image();
        image.onload = function() {
            EXIF.getData(image, function() {
                alert(EXIF.getTag(this, 'Orientation'));

                var canvas = document.createElement(‘canvas‘);
                var ctx = canvas.getContext("2d");
                //旋转图片
                if (Orientation == 6) {
                    ctx.save();
                    ctx.translate(height / 2, width / 2);
                    ctx.rotate(90 * Math.PI / 180.0);
                    ctx.drawImage(image, -width / 2, -height / 2, width, height);

                    var base64data = canvas.toDataURL("image/jpeg");

                    $.post('a.php', { act : 'wx_new_image' , media_id:base64data, yindex:0, sex : 0 }, function(a){

                        if(!a.success)
                        {
                            $('.pin').attr('src',"data:image/png;base64,"+a.base64data);
                            setcanvas()
                        }
                        else
                        {
                            alert(a.msg);
                            $('.tips').hide()
                        }

                    }, "json");

                } else {
                    ctx.drawImage(image, 0, 0, width, height);
                }


            });
        };
        image.src = serverId.toString();

    };

    function ajaxandrowPic(serverId){



        $.post('a.php', { act : 'anroid_wx_upload_img' , media_id:serverId.toString()}, function(a){

            if(!a.success)
            {
                imgbase64 = "data:image/png;base64,"+a.base64data;
                $('.pin').attr('src',imgbase64)
                setpicimg(imgbase64)
            }
            else
            {
                alert(a.msg);
            }

        }, "json");

    };

    function canvasResize() {
        canvas_context.clearRect(0,0,mycanvas.width,mycanvas.height);
        canvas_context.fillStyle="#fff";
        canvas_context.fillRect(0,0,602,842);
        var img1 = new Image();
        img1.src=$('.pin').attr('src');
        img1.setAttribute('crossOrigin', 'anonymous');
        var imgw = 602/$('.pin').width();

        img1.onload = function () {
            var xpos = mycanvas.width/2;
            var ypos = mycanvas.height/2;
            if(imgorgin == '6'){
                canvas_context.save();
                canvas_context.translate(xpos, ypos);
                canvas_context.rotate(90 * Math.PI / 180);//旋转90度
                canvas_context.translate(-xpos, -ypos);
                canvas_context.drawImage(img1,xpos - 602 / 2, ypos - $('.pin').width()* 602/$('.pin').height() / 2,602,$('.pin').width()* 602/$('.pin').height());
                canvas_context.restore();
            }else{
                canvas_context.drawImage(img1,0, (842-$('.pin').height()*imgw)/2,602,$('.pin').height()*imgw);
            }


            setTimeout(function () {
                var pimage = mycanvas.toDataURL('image/jpeg')
                imgbase64 = pimage;
                setpicimg(pimage)
            },1000)
        }

    }

    function setcanvas() {
        canvas_context.clearRect(0,0,mycanvas.width,mycanvas.height);
        var img = new Image();
        var img2 = new Image();
        img2.src=$('.ping').attr('src');
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = $('.pin').attr('src');
        var imgw = 530/$('.pin').width();
        img.onload = function () {
            canvas_context.drawImage(img, 39, 39,530,758);
            canvas_context.drawImage(img2,0,0)
            setTimeout(function () {
                var pimage = mycanvas.toDataURL("image/png")
                $('.ping').attr('src',pimage);
                $('.tips').hide()
                $('.p4').hide()
                $('.p5').show()
            },1000)
        };

    };


    function is_weixn(){
        var ua = navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i)=="micromessenger") {
            return true;
        } else {
            return false;
        }
    }
    
    function setpicimg(pimg) {
        $('.mypic').css('background','url('+pimg+') no-repeat center')
        $('.mypic').css('background-size','94%')
        $('.mypic').attr('data-id','1')
        $('.tips').hide()
    }



})();