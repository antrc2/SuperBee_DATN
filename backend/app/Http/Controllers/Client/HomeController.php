<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Mail\SendEmailCheckDomain;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Env;
use Illuminate\Support\Facades\Mail;

class HomeController extends Controller
{
    //
    public function index(Request $request)
    {
        $request->validate([
            "name" => ["required"],
            "email" => ["required", "email"],
        ]);
        $email = $request->email;
        $user = User::where("email", $email)->first();
        if (empty($user)) {
            return response()->json([
                "status" => false,
                "message" => "Tài khoản chưa xác thực",
                "data" => []
            ]);
        }
        // nếu tồn tại thì tạo Key và lưu vào DB
        // xong gửi về cho người đăng ký
        $link = Env("URL_FRONTEND") . "/domain?token=123";
        $key = "D9BD170B6093FF737C754C8A5070FC97";
        $data = [
            'name'   => $request->name,
            'message' => 'Đây là email kích hoạt trang web',
            'link'   => $link,
            'apiKey' => $key,
        ];

        Mail::to($request->email)
            ->send(new SendEmailCheckDomain($data));

        return response()->json([
            'message' => "Vui lòng kiểm tra email để kích hoạt",
            "data" => [],
            "status" => true
        ], 200);
    }
}
