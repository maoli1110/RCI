<?php

class dbmysql {

    var $sqlnum = 0;
    var $link;
    var $charset;
    var $rowCount;
    var $perPage;
    var $currPage;
    var $totalPage;
    var $querynum;

    function connect($dbhost, $dbuser, $dbpw, $dbname = '', $pconnect = 0, $halt = TRUE) {
        if ($pconnect) {
            if (!$this->link = @mysqli_connect($dbhost, $dbuser, $dbpw))
                $halt && $this->halt('Can not connect to MySQL server');
        }

        else
        {
            if (!$this->link = @mysqli_connect($dbhost, $dbuser, $dbpw, $dbname))
                $halt && $this->halt('Can not connect to MySQL server2');
        }


        if ($this->version() > '4.1') {
            if ($this->charset) {
                @mysqli_query("SET character_set_connection=$this->charset, character_set_results=$this->charset, character_set_client=binary", $this->link);
            }
            if ($this->version() > '5.0.1') {
                @mysqli_query("SET sql_mode=''", $this->link);
            }
        }
        if ($dbname) {
            @mysqli_select_db($dbname, $this->link);
        }
        $this->querynum=0;
    }

    function setPages($perPage, $currPage=1) {
        if (empty($currPage)) {
            $currPage = 1;
        }
        $this->perPage = $perPage;
        $this->currPage = $currPage;
    }

    function setnopage() {
        $this->perPage = '';
    }

    function select_db($dbname) {
        return mysqli_select_db($dbname, $this->link);
    }

    function resultType($type) {
        switch ($type) {
            case 1: return MYSQLI_NUM;
            case 2: return MYSQLI_ASSOC;
            default:return MYSQLI_BOTH;
        }
    }

    function getRs($sql, $type = MYSQLI_BOTH, $countsql='') {
        return $this->getAll($sql, $type, $countsql);
    }

    function getRow($sql, $type = MYSQLI_BOTH) {
        $result = mysqli_query($this->link, $sql) or die("error by mysql "); //or die('<script type="text/javascript">location.href="servtools/error.php?error_type=dberr";</script>');
        return mysqli_fetch_array($result, $type);
    }

    function result($sql, $row) {
        $query = @mysqli_query($this->link, $sql);
        if($query)
        {
            $res =  mysqli_fetch_array($query, MYSQLI_BOTH) or $this->halt('error','');
            return $res[$row];
        }
        else
        {
            return null;
        }
    }

    function result1($sql) {
        //$query = mysqli_query($sql);
        return $this->result($sql, 0);
    }

    function get_total_num($db, $where) {
        $sql = "select count(*) from  $db where $where ";
        $data = $this->result1($sql);
        //var_dump($data);
        return $data ? $data : 0;
    }

//	function fetch_array($sql, $result_type = MYSQL_ASSOC) 
//	{
//		return mysql_fetch_array($sql, $result_type);
//	}

    function query($sql, $type = '') {
        $thissql = $sql;
        if (D_BUG) {
            global $_A;
            $sqlstarttime = $sqlendttime = 0;
            $mtime = explode(' ', microtime());
            $sqlstarttime = number_format(($mtime[1] + $mtime[0] - $_A['supe_starttime']), 6) * 1000;
        }
        $func = $type == 'UNBUFFERED' && @function_exists('mysqli_unbuffered_query') ? 'mysqli_unbuffered_query' : 'mysqli_query';

        if (!($sql = $func($this->link, $sql)) && $type != 'SILENT')
            $this->halt('MySQL Query Error', $thissql);
        if (D_BUG) {
            $mtime = explode(' ', microtime());
            $sqlendttime = number_format(($mtime[1] + $mtime[0] - $_A['supe_starttime']), 6) * 1000;
            $sqltime = round(($sqlendttime - $sqlstarttime), 3);
            $explain = array();
            $info = mysqli_info();
            if ($sql && preg_match("/^(select )/i", $thissql))
                $explain = mysqli_fetch_assoc(mysqli_query('EXPLAIN ' . $thissql, $this->link));
            $_A['debug_query'][] = array('sql' => $thissql, 'time' => $sqltime, 'info' => $info, 'explain' => $explain);
        }
        $this->querynum++;
        return $sql;
    }

    function affected_rows() {
        return mysqli_affected_rows($this->link);
    }

    function error() {
        return (($this->link) ? mysqli_error($this->link) : "");
    }

    function errno() {
        return intval(($this->link) ? mysqli_errno($this->link) : "");
    }

    function getAll($sql, $resultType, $countsql='') {
        $arr = array();
        if ($this->perPage) {
            //"select count(*) as total_count ".strstr($sql,"from");//查询总数
            //$sql_count= $countsql ? $countsql : "select count(*) as total_count ".substr($sql, strrpos($sql,"from"));//查询总数
            $sql_count = $countsql ? $countsql : "select count(*) as total_count " . strrchr($sql, "from"); //查询总数

            $result_count = mysqli_query($sql_count) or die("error3 " . $sql);
            $data_count = mysqli_fetch_array($result_count) or die("error 4" . $sql);
            $this->rowCount = $data_count['total_count'];
            $sql.=" limit " . ($this->currPage - 1) * $this->perPage . "," . $this->perPage;
        }

        $sql = $this->query($sql) or die("error 5" . $sql);

        if ($this->perPage) {
            $total_rs = $this->rowCount;
            $per_page = $this->perPage;
            $curr_page = $this->currPage;
            $total_page = floor(abs($total_rs - 1) / $per_page) + 1; //总页数
            $this->totalPage = $total_page;
            //限制超页错误
            if ($curr_page > $total_page) {
                //echo '<script type="text/javascript">history.go(-1);</script>';
                //exit;
                $curr_page = $total_page;
                $this->currPage = $total_page;
                exit;
            }
        }
        //echo($sql);

        while ($data = mysqli_fetch_array($sql, $resultType)) {
            $arr[] = $data;
        }
        return $arr;
    }

    function num_rows($sql) {
        $sql = mysql_num_rows($sql);
        return $sql;
    }

    function num_fields($sql) {
        return mysqli_num_fields($sql);
    }

    function free_result($sql) {
        return mysqli_free_result($sql);
    }

    function insert_id() {
        return ($id = mysqli_insert_id($this->link)) >= 0 ? $id : $this->result($this->query("SELECT last_insert_id()"), 0);
    }

    function fetch_row($sql) {
        $result = mysqli_fetch_row($sql) or die("error6 " . $sql);
        return $result;
    }

    function fetch_fields($sql) {
        return mysqli_fetch_field($sql);
    }

    function version() {
        return mysqli_get_server_info($this->link);
    }

    function close() {
        return mysqli_close($this->link);
    }

    function halt($message = '', $sql = '') {
        $dberror = $this->error();
        $dberrno = $this->errno();
        $help_link = "http://faq.comsenz.com/?type=mysql&dberrno=" . rawurlencode($dberrno) . "&dberror=" . rawurlencode($dberror);
        echo "<div style=\"position:absolute;font-size:11px;font-family:verdana,arial;background:#EBEBEB;padding:0.5em;\">
				<b>MySQL Error</b><br>
				<b>Message</b>: $message<br>
				<b>SQL</b>: $sql<br>
				<b>Error</b>: $dberror<br>
				<b>Errno.</b>: $dberrno<br>
				<!--<a href=\"$help_link\" target=\"_blank\">Click here to seek help.</a>-->
				</div>";
        exit();
    }

}

//获取到表名
function tname($name) {
    global $_AC;
    return $_AC['tablepre'] . $name;
}

//添加数据
function inserttable($tablename, $insertsqlarr, $returnid=0, $replace = false, $silent=0) {
    global $_A;

    $insertkeysql = $insertvaluesql = $comma = '';
    foreach ($insertsqlarr as $insert_key => $insert_value) {
        $insertkeysql .= $comma . '`' . $insert_key . '`';
        $insertvaluesql .= $comma . '\'' . $insert_value . '\'';
        $comma = ', ';
    }
    $method = $replace ? 'REPLACE' : 'INSERT';

    $_A['db']->query($method . ' INTO ' . tname($tablename) . ' (' . $insertkeysql . ') VALUES (' . $insertvaluesql . ')', $silent ? 'SILENT' : '');

    if ($returnid && !$replace) {
        return $_A['db']->insert_id();
    }
}

//更新数据
function updatetable($tablename, $setsqlarr, $wheresqlarr, $silent=0) {
    global $_A;
    $setsql = $comma = '';
    foreach ($setsqlarr as $set_key => $set_value) {//fix
        $setsql .= $comma . '`' . $set_key . '`' . '=\'' . $set_value . '\'';
        $comma = ', ';
    }

    $where = $comma = '';
    if (empty($wheresqlarr))
        $where = '1';
    elseif (is_array($wheresqlarr)) {
        foreach ($wheresqlarr as $key => $value) {
            $where .= $comma . '`' . $key . '`' . '=\'' . $value . '\'';
            $comma = ' AND ';
        }
    }
    else
        $where = $wheresqlarr;

    $_A['db']->query('UPDATE ' . tname($tablename) . ' SET ' . $setsql . ' WHERE ' . $where, $silent ? 'SILENT' : '');
}


?>