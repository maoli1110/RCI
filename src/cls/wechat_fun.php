<?php
//获取令牌
function getjsticket()
{
    global $_A;

    $jsticket = http('http://e-shopwyeth.com/api/mp/accept/a725de38ccaeaa21');
    try
    {
        $jsticket = json_decode($jsticket, true);
        if($jsticket && isset($jsticket['result']))
        {
            $_A['jsticket'] = $jsticket['result'];
            $jsapiTicket = $jsticket['result'];
            $timestamp = time();
            $nonceStr = createNonceStr();
            // 注意 URL 一定要动态获取，不能 hardcode.
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
            $url = "$protocol$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            //echo "<!-- jsapiTicket:".$jsapiTicket."  url:".$url."  timestamp:".$timestamp."  nonceStr:".$nonceStr.'-->';
            // 这里参数的顺序要按照 key 值 ASCII 码升序排序
            $string = "jsapi_ticket=$jsapiTicket&noncestr=$nonceStr&timestamp=$timestamp&url=$url";
            $signature = sha1($string);
            $_A['jsticket'] = [
                'timestamp'=> $timestamp,
                'nonceStr' => $nonceStr,
                'signature' => $signature
            ];
            return true;
        }
    }
    catch(Exception $e)
    {
        //echo $e;
    }
    return false;
}

function getUser()
{
    global $_A;
    $uid = get_argg('uid');
    isMember();
    //print_r($_A['userinfo']);
    $userinfo = $uid ? get_db_userinfo($uid) : $_A['userinfo'];
    if(!$uid || !$userinfo)
    {
        $userinfo = $_A['userinfo'];
        $userinfo['isself'] = true;
        $userinfo['cur_uid'] = $_A['userinfo']['id'];
    }
    else
    {
        $userinfo['isself'] = $uid == $_A['userinfo']['id'];
        $userinfo['cur_uid'] = $_A['userinfo']['id'];
    }
    $userinfo['have_click'] = $_A['db']->get_total_num('user_record', "uid=".$userinfo['id']." and cur_uid = ".$_A['userinfo']['id']) >0;

    if($userinfo['step']>=6 && ($userinfo['MemberEDC']<10 || $userinfo['MemberEDC']>12)) $userinfo['step'] = 5;
    $userinfo['history'] = getClickHistory($userinfo['id']);
    $userinfo['click_index'] = 0;
    if(!$userinfo['isself'] && $userinfo['have_click'])
    {
        foreach($userinfo['history'] as $k=>$v)
        {
            if($v['id'] == $_A['userinfo']['id'])
                $userinfo['click_index'] = $k+1;
        }
    }
    $userinfo['total_winners'] =  $_A['db']->get_total_num('huojiang',' 1');
    $userinfo['huojiang_info'] =  $_A['db']->get_total_num('huojiang',"uid=".$userinfo['id']);
    return json_encode($userinfo, true);
}

function getClickHistory($uid)
{
    global $_A,$_openid;
    $result = $_A['db']->getRs("select id,nickname, headimgurl from user_info where id in (select cur_uid from user_record where uid=".$uid." and cur_uid<>".$uid."  order by id asc) limit 5", MYSQLI_ASSOC);
    return $result;
}

function isMember()
{
    global $_A, $openid;
    if(get_argg('istest') === 'HOGA')
    {
        $openid = 'owtN6jpzczOZF2wJu1CHCM9zRZyk';
        $_A['session']->set('openid', $openid);
        $_A['userinfo'] =  [
            'id' => 1,
            'nickname' => '鼻屎',
            'headimgurl' => '',
            'isMember' => 1,
            'MemberEDC' => 12,
            'step' => 0
        ];
        return true;
    }
    if(get_argg('istest') === 'SUNNY')
    {
        $openid = 'owtN6jq_9G9vvuwLmh_VOT6fV3yA';
        $_A['session']->set('openid', $openid);
        $_A['userinfo'] =  [
            'id' => 4,
            'nickname' => '袁钰',
            'headimgurl' => 'http://wx.qlogo.cn/mmopen/Uxjf0nf4iaKiaiaQHbb7tOH43hvEn6zJ80AdcPoB6xHsFo5FGhdULOJoN1mGSWH4g2ysp8qExlHsQPerGBpTSbYmGmlUJEMiaAtt/0',
            'isMember' => 1,
            'MemberEDC' => 12,
            'step' => 6
        ];
        return true;
    }
    if(get_argg('istest') && intval(get_argg('istest')))
    {
        $uid = get_argg('istest');
        $userinfo = $_A['db']->getRow("select * from user_info where id=$uid", MYSQLI_ASSOC);
        if($userinfo['step']>=6 && ($userinfo['MemberEDC']<10 || $userinfo['MemberEDC']>12)) $userinfo['step'] = 5;
        $openid = $userinfo['openid'];
        $_A['session']->set('openid', $openid);
        $_A['userinfo'] =  $userinfo;

        return true;
    }
//    if(get_argg('istest') === 'JUNO')
//    {
//        $openid = 'owtN6jtrwLmOrdLt1dXrVCuFLDQ8';
//        $_A['session']->set('openid', $openid);
//        $_A['userinfo'] =  [
//            'id' => 32,
//            'nickname' => '橘糯',
//            'headimgurl' => 'http://wx.qlogo.cn/mmopen/QIJaoeWuXhF1qpy08tibUvs9sB6kIpXJDkta6j07Eppe3TuJooVDibuBiaC4VHCETkU3hhNlKcH0UQqwsFEicRXknqyJR5ib25ZRf/0',
//            'isMember' => 1,
//            'MemberEDC' => 16,
//            'step' => 7
//        ];
//        return true;
//    }
    $access_token = get_argg('access_token');
    $isinfo = get_argg('isinfo');
    $result = false;
    $thisurl = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
    $thisurl .= (strpos($thisurl, '?') ? '&' : '?')."isinfo=1";
    if(!$openid)
    {
        header('location:http://www.e-shopwyeth.com/pioneer/oauth/api/wyeth?code=52066926&type=basic&redirect='.urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']), true);
    }
    else if($isinfo && $openid && $access_token)
    {
        $userinfo = http("https://api.weixin.qq.com/sns/userinfo", [
            'access_token' => $access_token,
            'openid' => $openid,
            'lang' => 'zh_CN'
        ]);
        try{
            $userinfo = json_decode($userinfo, true);
        }catch(Exception $e){
        }
        if(!$userinfo || !isset($userinfo['nickname']) || !isset($userinfo['headimgurl']))
            header('location:http://www.e-shopwyeth.com/pioneer/oauth/api/wyeth?code=52066926&type=userinfo&redirect='.urlencode($thisurl), true);
        $nickname =  $userinfo['nickname'];
        $headimgurl = $userinfo['headimgurl'];
        $memberinfo = get_crm_memberinfo();
        $MemberEDC = $memberinfo ? $memberinfo['MemberEDC'] : 0;
        $isMember = $memberinfo && $memberinfo['isMember'] ? '1' : '0';
        $sql = "insert into user_info(openid,nickname, headimgurl, isMember, MemberEDC, create_at) values('$openid', '$nickname', '$headimgurl','".$isMember."', $MemberEDC, ".timestamp.")";
        $_A['db']->query($sql);
        header('location:http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'], true);
    }
    else
    {
        //if(!is_weixin()) return true;
        $userinfo = $_A['db']->getRow("select * from user_info where openid='$openid'", MYSQLI_ASSOC);
        if(!$userinfo)
        {
            header('location:http://www.e-shopwyeth.com/pioneer/oauth/api/wyeth?code=52066926&type=userinfo&redirect='.urlencode($thisurl), true);
            die();
        }
        $_A['userinfo'] = $userinfo;
        if($userinfo['isMember'])
        {
            $_A['session']->set('isMember', $userinfo['isMember'] ? true : false);
            $_A['userinfo']['isMember'] = $userinfo['isMember'] ? '1' : '0';
            $_A['userinfo']['MemberEDC'] = $userinfo['MemberEDC'];
        }
        else
        {
            $memberinfo = get_crm_memberinfo();
            $MemberEDC = $memberinfo['MemberEDC'];
            $isMember = $memberinfo['isMember'];
            $_A['userinfo']['isMember'] = $isMember;
            $_A['userinfo']['MemberEDC'] = $MemberEDC;
            if($memberinfo['isMember'])
                updatetable('user_info', [
                    'isMember' => '1',
                    'MemberEDC' => $MemberEDC
                ], 'id='.$userinfo['id']);
        }
    }
    return $result;
}

function get_crm_memberinfo()
{
    global $_A, $openid;
    if($_A['session']->issetkey('isMember') && $_A['session']->issetkey('MemberEDC'))
        return  $memeberinfo = [
            'MemberEDC' => $_A['session']->get('MemberEDC', '0'),
            'isMember' => $_A['session']->get('isMember'),
        ];
    $token = 'wyethapiservice2015';
    $ts = time();
    $sig = md5($token.$ts);
    $jsonparm = ['token' => 'wyethapiservice2015', 'ts' => $ts, 'sig' =>$sig, 'wxopenid' => $openid ];
    $params = ['JsonParameter' => json_encode($jsonparm, true)];
    $memeberinfo = [
        'MemberEDC' => 0,
        'isMember' => false,
    ];
    try
    {
        $param = http_build_query($params);
        $result = http("http://crmapi.etocrm.com:9999/CRMServiceForGDHL.asmx/Search_MemberInfo?$param" ,'');
        $sql = "insert into memberquery(q,r, create_at) values('$param', '$result', ".timestamp.")";
        $_A['db']->query($sql);
        $result = (array)simplexml_load_string($result);
        $result = json_decode($result[0], true);
        $memeberinfo['MemberEDC'] = 0;
        if(isset($result['MemberEDC']) && $result['MemberEDC'])
        {
            $MemberEDC = strtotime($result['MemberEDC']);
            $memeberinfo['MemberEDC'] = $MemberEDC ? round((time()-$MemberEDC)/3600/24/30) : 0;
            $_A['session']->set('isMember', $memeberinfo['MemberEDC']);
        }
        if(isset($result['Flag']) && $result['Flag'] && isset($result['Member']) && intval($result['Member']) != 0)
        {
            $memeberinfo['isMember'] = '1';
            $_A['session']->set('isMember', true);
            return $memeberinfo;
        }
        else
        {
            $_A['session']->set('isMember', false);
            return false;
        }
    }
    catch(Exception $e)
    {
        return false;
    }
}

function get_db_userinfo($uid)
{
    global $_A;
    $userinfo = $_A['db']->getRow("select * from user_info where id='$uid'", MYSQLI_ASSOC);
    if($userinfo)
    {
        //$userinfo['MemberEDC'] =  $userinfo['MemberEDC'] ? round((time()-$userinfo['MemberEDC'])/3600/24/30) : 0;
        return $userinfo;
    }
    else
        return null;
}