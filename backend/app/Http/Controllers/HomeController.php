<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    //
    public function domain(Request $request)
    {
        $a =   $request->header('authorization');

        return response()->json([$a]);
    }
}
