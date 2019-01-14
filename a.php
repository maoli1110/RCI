<?php
error_reporting(0);
header("Access-Control-Allow-Origin: *");
include_once('./init.php' );
require_once ("./common/AiApi.php");
$act = get_args('act');

global $appinfo;
global $model;
$appinfo = array();
$model = array();

$appinfo = [
            ['appid' => '1106549571','appkey' => '4TY8CkWu77f7NARd'] ,
            ['appid' => '1106626244','appkey' => 'GMHxyYvoAMlxdnVY'] ,
            ['appid' => '1106549647','appkey' => 'QpOxeuv63HZzN14b'] ,
            ['appid' => '1106549649','appkey' => 'rhshz7f7kMlvfyP2']
        ];
$model = [
            [3432 , 3430] ,
            [3437 , 3500] ,
            [3444 , 3502] ,
            [3507 , 3506]
        ];

$cosmetic = [20 , 13 , 17 , 7];

switch($act)
{
    case 'jsticket':
        $url = get_argg('strURL');
        if(!$url) return false;
        $timestamp = time();

        $shareurl = get_argg('strURL');
        if(!$shareurl) return false;
        $appid = 'wxa103200a9080de43';
        $token = md5($appid.'Neone872'.$timestamp);
        $url = "http://wechat.test.neone.com.cn/partner-api/getshare/1/?appid=$appid&token=$token&unixtime=$timestamp&shareurl=".urlencode($shareurl);

        try
        {
            $signPackage = json_decode(http($url), true);
            unset($signPackage['errcode'],$signPackage['errmsg'],$signPackage['errcode']);
            ajax_result(0, 'success', $signPackage);
        }
        catch(Exception $ex)
        {
            ajax_result(1, 'fail');
        }

        ajax_result(0, 'success', $signPackage);
        break;

    //下载图片
    case 'download':
    {
        $yearindex = get_argp('yindex');
        $modelindex = get_argp('sex');

        $MEDIA_ID = get_argp('media_id');

        if (!$MEDIA_ID)
            ajax_result(1, 'fail');
        $appid = 'wxa103200a9080de43';
        $timestamp = time();
        $token = md5($appid . 'Neone872' . $timestamp);
        $url = "http://wechat.test.neone.com.cn/partner-api/getaccesstoken/1/?appid=$appid&token=$token&unixtime=$timestamp";

        $result = [];
        try {
            $access_token = json_decode(http($url), true);
            unset($access_token['errcode'], $access_token['errmsg'], $access_token['errcode']);
            $url = "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" . $access_token['Token'] . "&media_id=$MEDIA_ID";
            $fileName = $timestamp . rand(1, 10000);
            $result['media_id'] = $MEDIA_ID;
            $result['filename'] = PC_PATH . '/photo/' . $fileName . ".jpg";
            file_put_contents($result['filename'], http($url), FILE_APPEND );
            $imgurl = 'http://' . $_SERVER['HTTP_HOST'] . '/photo/' . $fileName . ".jpg";

            //调用滤镜效果
            $type = 'jpg';
            $sp = $fileName.'_s';
            $save_path = $sp.".".$type;
            $tmplv = getLvImage($yearindex , $modelindex , base64_encode(file_get_contents($result['filename'])));
            if ($tmplv != null)
            {
                $imgurl = $tmplv;
            }
            ajax_result(0, $imgurl, ['base64data' => $imgurl]);
        } catch (Exception $ex) {
            ajax_result(1, 'fail');
        }

    }
    break;

    case 'test_wx_upload_img':
    {
        $tmp_path = 'test.png';
        $tmpfile = PC_PATH . 'photo/'.$tmp_path;
        $base64data = base64_encode(file_get_contents($tmpfile));
        $data = getLvImage(0,0 , $base64data);

        if ($data != null)
        {
            ajax_result(1, 'ok');
        }
        else
        {
            ajax_result(1, 'fail');
        }
    }
    break;

    //图片融合图片
    case 'wx_new_image':
    {
        //获取年代
        $yearindex = get_argp('yindex');
        $modelindex = get_argp('sex');

        $base64_image_content = get_argp('media_id');
        file_put_contents("imglog".timestamp.".txt" , "【原始】".PHP_EOL.PHP_EOL.$base64_image_content.PHP_EOL.PHP_EOL, FILE_APPEND );

//        $base64_image_content = str_ireplace("image/octet-stream", "image/jpeg", $base64_image_content);
        if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $base64_image_content, $result))
        {
            $type = $result[2];
            $type = ($type == "jpeg") ? "jpg" : $type;

            $save_image_name = 'photo/' . timestamp."".rand(10000, 99999) . ".{$type}";

            $base64_body = substr(strstr($base64_image_content,','),1);
            $base64data = getLvImage($yearindex, $modelindex , $base64_body);
            if ($base64data != null)
            {
                file_put_contents(PC_PATH . $save_image_name, base64_decode($base64data) );
                ajax_result(0, $imgurl, ['base64data' => $base64data, 'imgurl' => $save_image_name]);
            }
            else
            {
                ajax_result(1, 'fail');
            }
        }
        else
        {
            ajax_result(1, 'fail2');
        }
    }
    break;

    //微信上传
    case 'anroid_wx_upload_img':
    {
        $MEDIA_ID = get_argp('media_id');

        if (!$MEDIA_ID)
            ajax_result(1, 'fail');
        $appid = 'wxa103200a9080de43';
        $timestamp = time();
        $token = md5($appid . 'Neone872' . $timestamp);
        $url = "http://wechat.test.neone.com.cn/partner-api/getaccesstoken/1/?appid=$appid&token=$token&unixtime=$timestamp";

        $result = [];
        try {
            $access_token = json_decode(http($url), true);
            unset($access_token['errcode'], $access_token['errmsg'], $access_token['errcode']);
            $url = "http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=" . $access_token['Token'] . "&media_id=$MEDIA_ID";
            $fileName = $timestamp . rand(1, 10000);
            $result['media_id'] = $MEDIA_ID;
            $result['filename'] = PC_PATH . '/photo/' . $fileName . ".jpg";
            file_put_contents($result['filename'], http($url), FILE_APPEND );
            $imgurl = 'http://' . $_SERVER['HTTP_HOST'] . '/photo/' . $fileName . ".jpg";

            $base64_body = base64_encode(file_get_contents($result['filename']));

            ajax_result(0, $imgurl, ['base64data' => $base64_body]);
        } catch (Exception $ex) {
            ajax_result(1, 'fail');
        }
    }
    break;

    //浏览器直接上传图片
	case 'brower_upload_img':
    {
        $base64_image_content = get_argp('media_id');
        $timestamp = time();
        $fileName = $timestamp."".rand(1, 10000);

        $base64_image_content = str_ireplace("image/octet-stream", "image/jpeg", $base64_image_content);

        if (preg_match('/^(data:\s*image\/(\w+);base64,)/', $base64_image_content, $result))
        {
            $type = $result[2];
            $new_file = PC_PATH . 'photo/' . $fileName . ".{$type}";
            $base64_body = substr(strstr($base64_image_content,','),1);
            $data = base64_decode($base64_body);
            file_put_contents($new_file, $data, FILE_APPEND );
            //读取图片对象
            $imgdata = imagecreatefromstring($data);

            //旋转图片
            $tmp = $fileName.'_r';
            $des_file = PC_PATH . 'photo/' . $tmp.".".$type;
            $imgdata_tmp = orientedimg($new_file , $des_file , $type , $data);

            if ($imgdata_tmp != false)
            {
                //如果图片旋转了，则需要释放前个图片对象
                if($imgdata != null)
                {
                    imagedestroy($imgdata);
                }
                $imgdata = $imgdata_tmp;
            }

            //图片压缩
            $maxwidth="608";//设置图片的最大宽度
            $maxheight="978";//设置图片的最大高度
            $imgdata_resize = resizeImage($imgdata,$maxwidth,$maxheight,'','');//调用上面的函数

            //释放上个图片对象资源，用压缩后图片对象
            if ($imgdata_resize != null)
            {
                if($imgdata != null)
                {
                    imagedestroy($imgdata);
                }

                $imgdata = $imgdata_resize;
            }


            //调用滤镜效果
//            $sp = $fileName.'_s';
//            $save_path = $sp.".".$type;
//
//            $tmp = base64_encode($imgdata);
//
//            $sp = $fileName.'_t';
//            $tmp_path = $sp.".".$type;
//            $tmpfile = PC_PATH . 'photo/'.$tmp_path;
//            if ($type == 'png')
//            {
//                imagepng($imgdata , $tmpfile);
//            }
//            else
//            {
//                imagejpeg($imgdata , $tmpfile);
//            }
//
//            //生成图片后，释放压缩的图片对象
//            if($imgdata != null)
//            {
//                imagedestroy($imgdata);
//            }


            if ($imgurl != null)
            {
                ajax_result(0, $imgurl, ['base64data' => $imgdata]);
            }
            else
            {
                ajax_result(1, 'fail2');
            }

        }
        else
        {
            ajax_result(1, 'fail2');
        }
    }
    break;
}


/**
 * 获取滤镜图片
 * @param $filter
 * @param $base64_image_content
 *
 * @return null|string
 */
function getLvImage($yindex ,  $sex , $base64_image_content)
{
    global $appinfo;
    global $model;
    global $cosmetic;
    $aiObj = new Ai([ 'appid' => $appinfo[$yindex]['appid'], 'app_key'=> $appinfo[$yindex]['appkey']]);
    $filter = $model[$yindex][$sex];
    if(!empty($base64_image_content))
    {
        $result = $aiObj->ptu_facemerge($filter, $base64_image_content);
        file_put_contents("imglog".timestamp.".txt" , "【合成后】".PHP_EOL.PHP_EOL.json_encode($result).PHP_EOL.PHP_EOL, FILE_APPEND );
        if($result && $result['ret']=="0")
        {
            //如果是女生则美妆
            if ($sex == 0)
            {
                $aiObj_meizhuang =
                $new_result = $aiObj->ptu_facecosmetic($cosmetic[$yindex] , $result['data']['image']);
                file_put_contents("imglog".timestamp.".txt" , "【美妆接口返回】".PHP_EOL.PHP_EOL.json_encode($new_result).PHP_EOL.PHP_EOL, FILE_APPEND );
                if ($new_result && $new_result['ret']=="0")
                {
                    file_put_contents("imglog".timestamp.".txt" , "【女生美妆】".PHP_EOL.PHP_EOL.json_encode($result).PHP_EOL.PHP_EOL, FILE_APPEND );
                    return $new_result['data']['image'];
                }
                else
                {
                    file_put_contents("imglog".timestamp.".txt" , "【女生美妆失败返回】".PHP_EOL.PHP_EOL.json_encode($result).PHP_EOL.PHP_EOL, FILE_APPEND );
                    return $result['data']['image'];
                }
            }
            else
            {
                file_put_contents("imglog".timestamp.".txt" , "【男生返回】".PHP_EOL.PHP_EOL.json_encode($result).PHP_EOL.PHP_EOL, FILE_APPEND );
                return $result['data']['image'];
            }
        }
        return null;
    }
    return null;
}

/**
 * 等比例压缩
 * @param $im
 * @param $maxwidth
 * @param $maxheight
 * @param $name
 * @param $filetype
 */
function resizeImage($im,$maxwidth,$maxheight,$name,$filetype)
{
    $pic_width = imagesx($im);
    $pic_height = imagesy($im);

    $value = $maxheight / $maxwidth;

    $tmpV = $pic_height / $pic_width;

    //如果高大于宽 ， 则以宽为基准
    if($tmpV > $value)
    {
        $tp = $maxwidth / $pic_width;
        $newwidth = $pic_width * $tp;
        $newheight = $pic_height * $newwidth / $pic_width;

        if(function_exists("imagecopyresampled"))
        {
            $newim = imagecreatetruecolor($newwidth,$newheight);//PHP系统函数
            imagecopyresampled($newim,$im,0,0,0,0,$newwidth,$newheight,$pic_width,$pic_height);//PHP系统函数
        }
        else
        {
            $newim = imagecreate($newwidth,$newheight);
            imagecopyresized($newim,$im,0,0,0,0,$newwidth,$newheight,$pic_width,$pic_height);
        }

    }
    //否则就以高为基准
    else
    {
        $tp = $maxheight / $pic_height;
        $newheight = $pic_height * $tp;
        $newwidth = $pic_width * $newheight / $pic_height;

        if(function_exists("imagecopyresampled"))
        {
            $newim = imagecreatetruecolor($newwidth,$newheight);//PHP系统函数
            imagecopyresampled($newim,$im,0,0,0,0,$newwidth,$newheight,$pic_width,$pic_height);//PHP系统函数
        }
        else
        {
            $newim = imagecreate($newwidth,$newheight);
            imagecopyresized($newim,$im,0,0,0,0,$newwidth,$newheight,$pic_width,$pic_height);
        }
    }
    return $newim;
}

function orientedimg($filepath , $newfile , $filetype , $imgdata)
{
    $image = imagecreatefromstring($imgdata);
    try{
        $exif = exif_read_data($filepath);
        if(!empty($exif['Orientation'])) {
            switch($exif['Orientation']) {
                case 8:
                    $image = imagerotate($image,90,0);
                    break;
                case 3:
                    $image = imagerotate($image,180,0);
                    break;
                case 6:
                    $image = imagerotate($image,-90,0);
                    break;
            }

            return $image;
        }
    }
    catch(Exception $exp){
        return false;
    }

    return false;
}

function request_post($url = '', $post_data = array()) {
        if (empty($url) || empty($post_data)) {
            return false;
        }
        
        $o = "";
        foreach ( $post_data as $k => $v ) 
        { 
            $o.= "$k=" . urlencode( $v ). "&" ;
        }
        $post_data = substr($o,0,-1);

        $postUrl = $url;
        $curlPost = $post_data;

        $ch = curl_init();//初始化curl
        curl_setopt($ch, CURLOPT_URL,$postUrl);//抓取指定网页
        curl_setopt($ch, CURLOPT_HEADER, 0);//设置header
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);//要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_POST, 1);//post提交方式
        curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);

        $data = curl_exec($ch);//运行curl
        curl_close($ch);

        return $data;
    }

?>