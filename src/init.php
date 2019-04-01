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
    case 'rcclchina-newship.test.gamesoul.com.cn'://本地
        $sqlpwd = 'gamesoul@2014';
        break;
    default://正式
        $sqlpwd = '123456';
        break;
}

$dbconfig = [
    'hostname' => 'localhost',
    'username' => 'root',
    'password' => $sqlpwd,
    'database' => 'rcclchina-newship',
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
        $userinfo = $_A['db']->getRow("select * from zpq_user_info where id=$uid", MYSQLI_ASSOC);

        $_A['session']->set('openid', $userinfo['zpq_openid']);
        $_A['session']->set('headimgurl', $userinfo['zpq_headurl']);
        $_A['session']->set('nickname', $userinfo['zpq_nickname']);
        return true;
    }

    $openid = get_argg('openid');
    $headurl = get_argg('headimgurl');
    $nickname = get_argg('nickname');

    if(!$openid)
    {
        $openid = $_A['session']->get('openid', '');
//        $_A['headimgurl']  = $_A['session']->get('headimgurl', '');
//        $_A['nickname'] = $_A['session']->get('nickname', '');
        //$_A['userinfo'] = $_A['db']->getRow("select * from user_info where openid='".$_A['userinfo']['openid']."'", MYSQLI_ASSOC);
    }
    else
    {
        if( $_A['db']->get_total_num('zpq_user_info', "zpq_openid='".$openid."'")<=0)
        {
            $sql = "insert into zpq_user_info(zpq_openid , zpq_nickname, zpq_headurl, zpq_time , zpq_ip) values('". $openid."', '".$nickname."', '".$headurl."', ".timestamp.", '".ip()."')";
            $_A['db']->query($sql);
        }


        $_A['session']->set('openid', $openid);
        $_A['session']->set('headimgurl', $headurl);
        $_A['session']->set('nickname', $nickname);
        header('location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME'], true);
    }

    if(!$openid)
    {
        header('location:http://wechat.test.neone.com.cn/partner-api/link/1/?scope=snsapi_userinfo&url='.urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']), true);
    }
    return true;
}

?>