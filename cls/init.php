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
$_A = [];
require_once(PC_PATH.'./cls/mysql.cls.php');
require_once(PC_PATH.'./cls/hogaSession.php');
require_once(PC_PATH.'./cls/wechat_fun.php');

$_A['session'] = new hogaSession();
$_A['jsticket'] = [
    'timestamp'=> '',
    'nonceStr' => '',
    'signature' => ''
];


switch($_SERVER['HTTP_HOST'])
{
    case 'ali-meizhuang.test.neone.com.cn'://测试
        $localhost = '127.0.0.1';
        $username = 'root';
        $sqlpwd = '123456';
        break;
    case 'ali-meizhuang.h5.neone.com.cn'://正式
        $sqlpwd = '123456';
        $username = 'root';
        break;
    case 'jzj.xianyingxiao.com'://正式
        //$sqlpwd = 'aomenlu@872';
        //$username = 'ali_meizhuang';
        //$localhost = 'rm-uf6pql96p5672i0m5o.mysql.rds.aliyuncs.com';
		$localhost = '127.0.0.1';
        $username = 'root';
        $sqlpwd = '123456';
        break;
    default://本地
        $username = 'root';
        $sqlpwd = '111111';
        break;
}

$dbconfig = [
    'hostname' => $localhost,
    'username' => $username,
    'password' => $sqlpwd,
    'database' => 'ali_meizhuang',
    'dbport' => '3306',
    'autoconnect' => '0',
    'debug' => D_BUG,
    'charset' => 'utf8mb4'
];
$_A['db'] = new dbmysql();
$_A['db']->connect($dbconfig['hostname'],$dbconfig['username'],$dbconfig['password'],$dbconfig['database']);


//概率数组的总概率精度
function pro_rand( $proArr )
{
    $result = 99;
    $proSum = array_sum($proArr);
    if($proSum > 0)
    {
        foreach ( $proArr as $key => $proCur )
        {
            $randNum = mt_rand(1, $proSum);
            if( $randNum <= $proCur )
            {
                $result = $key;
                break;
            }
            else
            {
                $proSum -= $proCur;
            }
        }
    }
    return $result;
}


/**
 * 判断是否是手机端
 * @return bool
 */
function isMobile()
{
    // 如果有HTTP_X_WAP_PROFILE则一定是移动设备
    if (isset ($_SERVER['HTTP_X_WAP_PROFILE']))
    {
        return true;
    }
    // 如果via信息含有wap则一定是移动设备,部分服务商会屏蔽该信息
    if (isset ($_SERVER['HTTP_VIA']))
    {
        // 找不到为flase,否则为true
        return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
    }
    // 脑残法，判断手机发送的客户端标志,兼容性有待提高
    if (isset ($_SERVER['HTTP_USER_AGENT']))
    {
        $clientkeywords = array ('nokia',
            'sony',
            'ericsson',
            'mot',
            'samsung',
            'htc',
            'sgh',
            'lg',
            'sharp',
            'sie-',
            'philips',
            'panasonic',
            'alcatel',
            'lenovo',
            'iphone',
            'ipod',
            'blackberry',
            'meizu',
            'android',
            'netfront',
            'symbian',
            'ucweb',
            'windowsce',
            'palm',
            'operamini',
            'operamobi',
            'openwave',
            'nexusone',
            'cldc',
            'midp',
            'wap',
            'mobile'
        );
        // 从HTTP_USER_AGENT中查找手机浏览器的关键字
        if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT'])))
        {
            return true;
        }
    }
    // 协议法，因为有可能不准确，放到最后判断
    if (isset ($_SERVER['HTTP_ACCEPT']))
    {
        // 如果只支持wml并且不支持html那一定是移动设备
        // 如果支持wml和html但是wml在html之前则是移动设备
        if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') === false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html'))))
        {
            return true;
        }
    }
    return false;
}

/**
 * 是否记录登入过
 * @return array|bool|mixed
 * @throws InvalidParamException
 */
function get_openid()
{
    global $_A;
    if(get_argg('istest') && intval(get_argg('istest')))
    {
        $uid = get_argg('istest');
        $userinfo = $_A['db']->getRow("select * from user_info where id=$uid", MYSQLI_ASSOC);

        $_A['session']->set('openid', $userinfo['openid']);
        return true;
    }

    $openid = get_argg('openid');

    if(!$openid)
    {
        $openid = $_A['session']->get('openid', '');

        //如果当前session openid 有，但是 user 表中不存在用户则插入数据库
//        if(!$openid){
//            if( $_A['db']->get_total_num('xyx_user', "openid='".$openid."'")<=0)
//            {
//                $sql = "insert into xyx_user(xyx_openid , xyx_create_at , xyx_ip) values('". $openid."',  ".timestamp.", '".ip()."')";
//                $_A['db']->query($sql);
//            }
//        }

    }
    else
    {

        $_A['session']->set('openid', $openid);

        $url='http://'.$_SERVER['SERVER_NAME'].$_SERVER["REQUEST_URI"];
        $tempUrl = dirname($url);
        header('location:'.$tempUrl, true);

        return true;
    }

    if(!$openid)
    {
        header('location:http://wechat.test.neone.com.cn/partner-api/link/1/?scope=snsapi_base&url='.urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']), true);
    }
    return true;
}

?>