"use strict";
$(function () {
    canvas.init()
})
var canvas = (function () {
    var year_id,c_sex='1',isiOS,isAndroid,imgbase64,mycanvas,canvas_context,imgfm,allMetaData,imgorgin,canvas_context2,is_first = '1';
    var kvtxt = ['<span>摩登与优雅，至美尽繁华</span>','<span>热血付荏苒，青春吐芳华</span>','<span>闪亮日子里，诗是必需品</span>','<span>左右潮流的方向那些钟爱的偶像</span>']
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

            $('#rightcmr,.step2 #rightcmr').show();

            setTimeout(function () {
                $('.page_des ').slideDown(4000);
            },1000)

            clickfun()
        }

    };

    function clickfun() {
        $('.p0').on('touchstart',function () {
            $('#bgMusic')[0].play();
            $('.music').hide()
            $(this).fadeOut(1000)
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
            $('.p3').css('background','url(./images/'+year_id+'.png?dfs) no-repeat center')
            $('.p3').css('background-size','cover')
            $('.p3 a').removeClass().addClass('btn'+year_id )
            $('.p3 p').removeClass().addClass('t'+year_id);
            $('.p3 p').empty().html(kvtxt[year_id])
            $('.p3').show();
           setTimeout(function () {
               $('.p2').fadeOut()
           },300)
            setTimeout(function () {
                $('.p3 p').slideDown(3000);
            },1000)
            $('.p3 a').delay(2000).fadeIn()
            $('.ping').attr('src','images/k'+year_id+'.png')
        })

        $('.p3 a,.btn_start').on('touchstart',function () {
            $(this).parent().next().show();
            $(this).parent().fadeOut()
        })

        $('.p4 .c-sex span').on('touchstart',function (e) {
            $('.p4 span').removeClass('on')
            $(this).addClass('on')
            c_sex = $(this).attr('data-id')

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
            $('.p5,.p3 p').hide();
            $('.p2').show()
        })
        $('.btn_share').off().on('touchstart',function () {
            $('.sharetips').show()
        })
        $('.sharetips').off().on('touchstart',function () {
            $(this).hide()
        })
    }

    function PreviewImage(fileObj) {
        $('.tips').fadeIn()

        var allowExtention = ".jpg,.jpeg,.png"; //允许上传文件的后缀名document.getElementById("hfAllowPicSuffix").value;
        var extention = fileObj.value.substring(fileObj.value.lastIndexOf(".") + 1).toLowerCase();
        var browserVersion = window.navigator.userAgent.toUpperCase();
        var file = fileObj.files['0'];

        EXIF.getData(file, function() {
            allMetaData = EXIF.getAllTags(this);
            imgorgin = allMetaData.Orientation
        });

        if (allowExtention.indexOf(extention) > -1) {
            if (fileObj.files) {//HTML5实现预览，兼容chrome、火狐7+等
                if (window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var url = e.target.result;
                       var imgurl = url.replace("image/jpeg;", "image/png;");
                      //   console.log(e)
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
                    //  inputimgeurl =fileObj.files[0].getAsDataURL();
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

        $.post('a.php', { act : 'wx_new_image' , media_id:serverId.toString(), yindex:my_year, sex : my_sex }, function(a){
            if(!a.success)
            {
                $('.pin').attr('src',a.imgurl);
                setcanvas()
            }
            else
            {
                alert(a.msg == 'fail' ? '无法识别照片中的人脸，换一张试试？': '合成失败，换一张试试？');
                $('.tips').hide()
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
            canvas_context.drawImage(img2,0,0);
        
        canvas_context.clearRect(0,0,mycanvas.width,mycanvas.height);
        var img = new Image();
        var img2 = new Image();
        img2.src=$('.ping').attr('src');
     //   img.setAttribute('crossOrigin', 'anonymous');
        img.addEventListener("load",function(){
            canvas_context.drawImage(img, 39, 39,530,758);
            setTimeout(function () {
                var pimage = mycanvas.toDataURL("image/jpeg")
                $('.ping').attr('src',pimage);
                $('.tips').hide()
                $('.p4').fadeOut()
                $('.p5').show()
            },1000)
        },false);
        img.src = $('.pin').attr('src');
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
        $('.uploadimg').remove()
        $('.mypic').css('background','url('+pimg+') no-repeat center')
        $('.mypic').css('background-size','94%')
        $('.mypic').attr('data-id','1')
        $('.tips').hide()
    }



})();