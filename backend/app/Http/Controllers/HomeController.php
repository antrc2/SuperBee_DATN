<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    //
    public function domain(Request $request)
    {
        $a =   $request->header('authorization');
        dd($request->web_id, $request->user_id);
        return response()->json([$a]);
    }
}
