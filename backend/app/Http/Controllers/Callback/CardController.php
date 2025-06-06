<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function callback(Request $request){
        try {
            if ($request->token !== $_ENV['BANK_TOKEN']){
                return response()->json([
                    "status"=>False,
                    "message"=>"Can't access to here",
                ], 403);
            } 

        } catch (\Throwable $th) {
            //throw $th;
        }
    }
}
