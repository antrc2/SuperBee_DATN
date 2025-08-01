<?php 
function route($name, $params = [])
{
    // Kiểm tra xem có param truyền và hay không
    if (count($params) > 0) {
        // Thay thế các tham số động trong URL
        foreach ($params as $key => $value) {
            $path = str_replace("{" . $key . "}", $value, $name);
        }  
    }else{
        $path = $name;
    }
    $scriptPath = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
    return $_SERVER['REQUEST_SCHEME'].'://' . $_SERVER['HTTP_HOST'] .$scriptPath. $path;

}

?>