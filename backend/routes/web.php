<?php

use App\Events\NewMessage;
use Illuminate\Support\Facades\Route;
use Predis\Client;
Route::get('/', function () {
    $r = new Client([
        'scheme' => 'tcp',
        'host'   => '127.0.0.1',
        'port'   => 6379,
        'password' => null,
        'database' => 0,
    ]);
    
    $r->set('foo', 'bar');
    echo $r->get('foo'); // bar
    
});
Route::get('/test', function () {
    $message ="hello";
    $user = [
        "id"=>1,
        "name"=>"HaiTran"
    ];
   $a = event(new NewMessage($message, $user));
   var_dump($a);

});
