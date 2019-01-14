<?php
session_start();
define('D_BUG',false);
define('PC_PATH', dirname(__FILE__).DIRECTORY_SEPARATOR);
define('in_hogaweb',1);
$mtime = explode(' ', microtime());//时间
define('timestamp', $mtime[1]);
defined('NOWTIME') or define('NOWTIME', date('Y-m-d H:i:s', time()));
define('CHECKMEMBER', true);
require_once(PC_PATH.'./cls/common.php');

$magic_quote = get_magic_quotes_gpc();//GPC过滤
if (empty($magic_quote))
{
    $_GET = saddslashes($_GET);
    $_POST = saddslashes($_POST);
}

global $_A;
$_A = array();
require_once(PC_PATH.'./cls/mysql.cls.php');
require_once(PC_PATH.'./cls/hogaSession.php');

$_A['session'] = new hogaSession();

//获取微信公从号ticket
function wx_get_jsapi_ticket() {

    $url = sprintf("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi", wx_get_token());
    $res = get_curl_contents($url);
    $res = json_decode($res, true);
    //这里应该把access_token缓存起来，至于要怎么缓存就看各位了，有效期是7200s

    if (isset($res['ticket']))
    {
        return $res['ticket'];
    }
    else
    {
        return '';
    }

}

?>