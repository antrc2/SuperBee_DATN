<?php 
if (!function_exists('storage')) {
    function storage($fileImage){
        $scriptPath = str_replace(basename($_SERVER['SCRIPT_NAME']), '', $_SERVER['SCRIPT_NAME']);
        return empty($fileImage) ? '' : $scriptPath.'storage/uploads/'.$fileImage;
    }
}
?>