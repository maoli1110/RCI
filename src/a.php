<?php
header('Access-Control-Allow-Origin:*');

include_once('./init.php' );
$act = get_args('act');


switch($act) {

    //获取已送优惠券次数
    case "get_yhq_count":
    {
        global $_A;
        $mobile = get_args("mobile");

        $sql = "select * from userinfo WHERE mobile='".$mobile."'";
        $result = $_A["db"]->getRs($sql);

        //如果有则返回数据
        if (count($result) > 0)
        {
            ajax_result(0, 'success' , ["count"=>$result[0]["count"]]);
        }
        else
        {
            ajax_result(0, 'success' , ["count"=>0]);
        }
    }
    break;

    //增加一次次数
    case "save_count":
    {
        global $_A;

        $mobile = get_args("mobile");

        $sql = "select * from userinfo WHERE mobile='".$mobile."'";
        $result = $_A["db"]->getRs($sql);

        //如果没有则插入
        if (count($result) <= 0)
        {
            inserttable("userinfo" , ["mobile"=>$mobile , "count"=>1,"create_at"=>time()]);
        }
        else
        {
            //更新投票数量
            $sql = "UPDATE userinfo SET	count = count + 1 WHERE mobile='".$mobile."'";
            $_A['db']->query($sql);
        }

        ajax_result(0, 'success');
    }
    break;

}

?>