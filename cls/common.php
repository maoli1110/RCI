<?php

//SQL ADDSLASHES
function saddslashes($string)
{
    if (is_array($string))
    {
        foreach ($string as $key => $val)
            $string[$key] = saddslashes($val);
    }
    else
        $string = addslashes($string);
    return $string;
}

//对表单的统一处理
function get_args($name)
{
    if(isset($_POST[$name]))return $_POST[$name];
    if(isset($_GET[$name]))return $_GET[$name];
    return null;
}

//get参数处理
function get_argg($name)
{
    if(isset($_GET[$name]))return $_GET[$name];
    return null;
}

//post参数处理
function get_argp($name)
{
    if(isset($_POST[$name]))return $_POST[$name];
    return null;
}

/**
 * 获取请求ip
 * @return ip地址
 */
function ip()
{
    if(getenv('HTTP_CLIENT_IP') && strcasecmp(getenv('HTTP_CLIENT_IP'), 'unknown')) {
        $ip = getenv('HTTP_CLIENT_IP');
    } elseif(getenv('HTTP_X_FORWARDED_FOR') && strcasecmp(getenv('HTTP_X_FORWARDED_FOR'), 'unknown')) {
        $ip = getenv('HTTP_X_FORWARDED_FOR');
    } elseif(getenv('REMOTE_ADDR') && strcasecmp(getenv('REMOTE_ADDR'), 'unknown')) {
        $ip = getenv('REMOTE_ADDR');
    } elseif(isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], 'unknown')) {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return preg_match ( '/[\d\.]{7,15}/', $ip, $matches ) ? $matches [0] : '';
}

/*
 * http请求
 */
function http($url, $params = null, $type = 'get')
{
    $curl = curl_init();
    switch ($type) {
        case 'get':
            is_array($params) && $params = http_build_query($params);
            !empty($params) && $url .= (stripos($url, '?') === false ? '?' : '&') . $params;
            break;
        case 'post':
            curl_setopt($curl, CURLOPT_POST, true);
//                if (!is_array($params)) {
//                    throw new InvalidParamException("Post data must be an array.");
//                }
            curl_setopt($curl, CURLOPT_POSTFIELDS, $params);
            break;
        case 'raw':
            curl_setopt($curl, CURLOPT_POST, true);
            if (is_array($params)) {
                throw new InvalidParamException("Post raw data must not be an array.");
            }
            curl_setopt($curl, CURLOPT_POSTFIELDS, $params);
            break;
        default:
            throw new InvalidParamException("Invalid http type '{$type}.' called.");
    }
    if (stripos($url, "https://") !== false) {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($curl, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($curl, CURLOPT_SSLVERSION, 1); // 微信官方屏蔽了ssl2和ssl3, 启用更高级的ssl
        if (defined('CURL_SSLVERSION_TLSv1')) {
            curl_setopt($curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1);
        }
    }
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $content = curl_exec($curl);
    $status = curl_getinfo($curl);
    curl_close($curl);
    if (isset($status['http_code']) && intval($status['http_code']) == 200) {
        return $content;
    }
    return false;
}

//创建 NonceStr
function createNonceStr($length = 16) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $str = "";
    for ($i = 0; $i < $length; $i++) {
        $str .= substr($chars, mt_rand(0, strlen($chars) - 1), 1);
    }
    return $str;
}


function remove_qs_key($url, $key) {
    if(is_array($key))
    {
        foreach($key as $k=>$v)
            $url = preg_replace('/(?:&|(\?))' . $v . '=[^&]*(?(1)&|)?/i', "$1", $url);
    }
    else
        $url = preg_replace('/(?:&|(\?))' . $key . '=[^&]*(?(1)&|)?/i', "$1", $url);

    if(strrchr($url,"?")=="?") $url = rtrim($url, "?");
    return $url;
}

function removeEmoji($text)
{
    $clean_text = "";
    // Match Emoticons
    $regexEmoticons = '/[\x{1F600}-\x{1F64F}]/u';
    $clean_text = preg_replace($regexEmoticons, '', $text);
    // Match Miscellaneous Symbols and Pictographs
    $regexSymbols = '/[\x{1F300}-\x{1F5FF}]/u';
    $clean_text = preg_replace($regexSymbols, '', $clean_text);
    // Match Transport And Map Symbols
    $regexTransport = '/[\x{1F680}-\x{1F6FF}]/u';
    $clean_text = preg_replace($regexTransport, '', $clean_text);
    return $clean_text;
}

function ajax_result($a, $b, $c=null)
{
    $result = array('success'=>$a ? 1 : 0, 'msg'=>$b);
    if($c && is_array($c))
        $result = array_merge($result, $c);
    die(json_encode($result));
}

/**
 * 获取签名
 * @param array $arrdata 签名数组
 * @param string $method 签名方法
 * @return boolean|string 签名值
 */
function getSignature($arrdata,$method="sha1")
{
    if (!function_exists($method)) return false;
    ksort($arrdata);
    $paramstring = "";
    foreach ($arrdata as $key => $value) {
        if (strlen($paramstring) == 0)
            $paramstring .= $key . "=" . $value;
        else
            $paramstring .= "&" . $key . "=" . $value;
    }
    $Sign = $method($paramstring);
    return $Sign;
}
/**
 * 生成随机字串
 * @param number $length 长度，默认为16，最长为32字节
 * @return string
 */
function generateNonceStr($length=16){
    // 密码字符集，可任意添加你需要的字符
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    $str = "";
    for($i = 0; $i < $length; $i++)
    {
        $str .= $chars[mt_rand(0, strlen($chars) - 1)];
    }
    return $str;
}

function echo_debug($result)
{
    echo('<!--');
    var_dump($result);
    echo('-->');
}