<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['authenticate'])->group(function(){
    // Route::post("/accounts/login");
    // Route::post("/accounts/register");
});

Route::middleware(['jwt'])->group(function(){
    Route::prefix("/accounts")->group(function(){

    });
    Route::prefix("/categories")->group(function(){

    });
    
});

// Anh An đẹp trai :)))