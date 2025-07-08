<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\OrderQueue;
use Illuminate\Http\Request;

class PartnerOrderController extends Controller
{
    public function queue_money(Request $request){
        if (!$request->hasHeader('Authorization')) {
            return response()->json([
                "status" => false,
                "message" => "Authorization header is missing",
            ], 401);
        }
        $authHeader = $request->header('Authorization');
        if ($authHeader !== "Bearer " . env('PYTHON_TOKEN')) {
            return response()->json([
                "status" => false,
                "message" => "Unauthorized",
            ], 401);
        }
        try {
            $order_queues = OrderQueue::where("status",0)->get();
            return response()->json([
                "status"=>True,
                "message"=>"",
                "data"=>$order_queues
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                "message"=>"",
                'data'=>[]
            ],500);
        }
    }
}
