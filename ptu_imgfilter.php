<?php
require_once ("./common/AiApi.php");

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

$aiObj = new Ai([ 'appid'=>'1106527080', 'app_key'=>'NW40kzVqlFIlw8p2']);
$filter = get_args('filter');
$image = get_args('image');
if(!empty($image))
{
    $image = urldecode($image);
    $base64_image_content = base64_encode(file_get_contents($image));  //图片提交到接口需要base64编码

    $result = $aiObj->ptu_imgfilter($filter, $base64_image_content);
    //var_dump($result['data']['image']);

    if($result && $result['ret']=="0")
    {
        //header('Content-type: image/png');
        //echo "data:image/png;base64,".$result['data']['image'];
        echo "<img style='width:500px;' src='data:image/png;base64,".$result['data']['image']."'/>";
    }
}