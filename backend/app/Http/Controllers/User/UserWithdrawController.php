<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Withdraw;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserWithdrawController extends Controller
{
    public function balance(Request $request){
        try {
            $wallet = Wallet::where("user_id",$request->user_id)->get();
                    return response()->json(
            [
                "status" => True,
                "message" => "Lấy số dư thành công",
                "data" => $wallet->balance
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status'=>false,
                "message"=>"Đã xảy ra lỗi",
            ],500);
        }
    }
    // public function showBalance(Request $request)
    // {
    //     $request->validate([
    //         'user_id' => 'required|exists:wallets,user_id',
    //     ]);

    //     $wallet = Wallet::where('user_id', $request->user_id)->first();

    //     return response()->json(
    //         [
    //             "status" => True,
    //             "message" => "Lấy số dư thành công",
    //             "data" => $wallet
    //         ]
    //         //     [
    //         //     'user_id' => $request->user_id,
    //         //     'balance' => $wallet->balance,
    //         //     'currency' => $wallet->currency,
    //         // ]
    //     );
    // }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:wallets,user_id',
            'amount' => 'required|numeric|min:10000',
            'bank_account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:100',
            'account_holder_name' => 'required|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $wallet = Wallet::where('user_id', $request->user_id)->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $request->amount) {
                return response()->json([
                    "status"=>False,
                    'message' => 'Số dư không đủ để rút.',
                    // 'current_balance' => $wallet?->balance ?? 0,
                    // 'errorCode' => 'INSUFFICIENT_FUNDS'
                ], 400);
            }


            $wallet->balance -= $request->amount;
            $wallet->save();

            // Tạo mã rút tiền
            $withdrawCode = 'WD' . $this->generateCode(14);

            $withdraw = Withdraw::create([
                'user_id' => $request->user_id,
                'amount' => $request->amount,
                'bank_account_number' => $request->bank_account_number,
                'bank_name' => $request->bank_name,
                'account_holder_name' => $request->account_holder_name,
                'withdraw_code' => $withdrawCode,
                'note' => $request->note,
                'status' => 0,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Tạo yêu cầu rút tiền thành công.',
                'withdraw' => $withdraw,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status"=>False,
                'message' => 'Lỗi khi tạo yêu cầu rút tiền.',
                // 'error' => $e->getMessage(),
                // 'errorCode' => 'WITHDRAW_FAILED'
            ], 500);
        }
    }

    public function update(Request $request,$id){
        try {
            //code...
        } catch (\Throwable $th) {
            //throw $th;
        }
    }


    public function index(Request $request)
    {
        try {
            $withdraws = Withdraw::where("user_id");
            return response()->json([
                "status"=>True,
                "message"=>"Lấy danh sách rút tiền thành công",
                "data"=>$withdraws
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                "message"=>"Đã xảy ra lỗi"
            ],500);
        }
        // $request->validate([
        //     'user_id' => 'required|exists:withdraws,user_id',
        //     'limit' => 'nullable|integer|min:1|max:100',
        //     'offset' => 'nullable|integer|min:0',
        // ]);


        // $withdraws = Withdraw::where('user_id', $request->user_id)
        //     ->get();

        // return response()->json([
            
        //     'withdraws' => $withdraws,
        //     'total' => Withdraw::where('user_id', $request->user_id)->count(),
        // ]);
    }


    public function cancel(Request $request,$id)
    {

        DB::beginTransaction();
        try {
            $withdraw = Withdraw::where('id', $id)
                ->where('user_id', $request->user_id)
                ->where('status', 0) // chỉ hủy khi đang chờ
                ->first();

            if (!$withdraw) {
                return response()->json([
                    'message' => 'Không thể hủy. Yêu cầu không tồn tại hoặc đã xử lý.',
                    'errorCode' => 'CANNOT_CANCEL'
                ], 400);
            }


            Wallet::where('user_id', $request->user_id)->increment('balance', $withdraw->amount);


            $withdraw->update(['status' => 2]); // đã huỷ

            DB::commit();

            return response()->json([
                "status"=>true,
                'message' => 'Đã hủy yêu cầu rút và hoàn tiền thành công.',
                // 'withdraw' => $withdraw->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status"=>False,
                'message' => 'Lỗi khi hủy yêu cầu rút.',
                // 'error' => $e->getMessage(),
                // 'errorCode' => 'CANCEL_WITHDRAW_FAILED'
            ], 500);
        }
    }
}
