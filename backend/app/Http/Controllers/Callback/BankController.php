<?php

namespace App\Http\Controllers\Callback;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function index(Request $request)
    {
        if ($request->token !== env("BANK_TOKEN")) {
            return response()->json([
                "status" => False,
                "message" => "Can't access to here",
            ], 403);
        }
    }
}
