<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\Withdraw;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class UserWithdrawController extends Controller
{
    public function balance(Request $request)
    {
        try {
            $wallet = Wallet::where("user_id", $request->user_id)->get();
            return response()->json(
                [
                    "status" => True,
                    "message" => "Lấy số dư thành công",
                    "data" => $wallet->balance
                ]
            );
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                'status' => false,
                "message" => "Đã xảy ra lỗi",
            ], 500);
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
    private function getAllowedBanks()
    {
        $python_url = env('PYTHON_API');
        try {
            $responses = Http::get("{$python_url}/transaction/bank_list")->json();
            // $responses = json_encode($responses);
            // var_dump($responses);
            $allowedBanks = [];
            foreach($responses['data'] as $response){
                $allowedBanks[] = $response['name'];
            }
            return $allowedBanks;
        } catch (\Throwable $th) {
            //throw $th;
            return [];
        }
        // return [
        //     'Nông nghiệp và Phát triển nông thôn (VBA)',
        //     'Ngoại thương Việt Nam (VCB)',
        //     'Đầu tư và phát triển (BIDV)',
        //     'Công Thương Việt Nam (VIETINBANK)',
        //     'Việt Nam Thịnh Vượng (VPB)',
        //     'Quốc tế (VIB)',
        //     'Xuất nhập khẩu (EIB)',
        //     'Sài Gòn Hà Nội (SHB)',
        //     'Tiên Phong (TPB)',
        //     'Kỹ Thương (TCB)',
        //     'Hàng hải (MSB)',
        //     'Ngân hàng Thương mại Cổ phần Lộc Phát Việt Nam',
        //     'Đông Á (DAB)',
        //     'Bắc Á (NASB)',
        //     'Sài Gòn Công thương (SGB)',
        //     'Việt Nam Thương tín (VIETBANK)',
        //     'BVBank – Ngân hàng TMCP Bản Việt',
        //     'Kiên Long (KLB)',
        //     'Ngân hàng TMCP Thịnh vượng và Phát triển (PGBank)',
        //     'Đại chúng Việt Nam (PVC)',
        //     'Á Châu (ACB)',
        //     'Nam Á (NAMABANK)',
        //     'Sài Gòn (SCB)',
        //     'Đông Nam Á (SEAB)',
        //     'Phương Đông (OCB)',
        //     'Việt Á (VAB)',
        //     'Quốc Dân (NCB)',
        //     'Liên doanh VID Public Bank (VID)',
        //     'Bảo Việt (BVB)',
        //     'Ngân hàng TNHH MTV Việt Nam Hiện Đại (MBV)',
        //     'Phát triển nhà TP HCM (HDB)',
        //     'Dầu khí toàn cầu (GPB)',
        //     'Sacombank (STB)',
        //     'An Bình (ABBANK)',
        //     'TNHH MTV Hong Leong VN (HLB)',
        //     'MTV Shinhan Việt Nam (SHBVN)',
        //     'Liên Doanh Việt Nga (VRB)',
        //     'Xây dựng Việt Nam (CBB)',
        //     'United Overseas Bank Việt Nam (UOB)',
        //     'Woori Việt Nam (Woori)',
        //     'Indovina (IVB)',
        //     'Việt Nam Thịnh Vượng CAKE BANK(VPB)',
        //     'Việt Nam Thịnh Vượng UBANK(VPB)',
        //     'Quân đội (MB)'
        // ];
    }
    public function allowBanks(){
        try {
            $allowedBanks = $this->getAllowedBanks();
            return response()->json([
                "status"=>True,
                "message"=>"Lấy danh sách ngân hàng thành công",
                "data"=>$allowedBanks
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status"=>False,
                'message'=>"Đã xảy ra lỗi",
                "data"=>[]
            ],500);
        }
    }


    public function store(Request $request)
    {
        $allowedBanks = $this->getAllowedBanks();

        $request->validate([
            'user_id' => 'required|exists:wallets,user_id',
            'amount' => 'required|numeric|min:10000',
            'bank_account_number' => 'required|string|max:50',
            'bank_name' => [
                'required',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($allowedBanks) {
                    if (!in_array($value, $allowedBanks)) {
                        $fail("Trường {$attribute} không hợp lệ. Vui lòng chọn từ danh sách ngân hàng được phép.");
                    }
                }
            ],
            'account_holder_name' => 'required|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $wallet = Wallet::where('user_id', $request->user_id)->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $request->amount) {
                return response()->json([
                    "status" => false,
                    'message' => 'Số dư không đủ để rút.',
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
                "status" => false,
                'message' => 'Lỗi khi tạo yêu cầu rút tiền.',
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $allowedBanks = $this->getAllowedBanks();

        $request->validate([
            'user_id' => 'required|exists:withdraws,user_id',
            'amount' => 'nullable|numeric|min:10000',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_name' => [
                'nullable',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($allowedBanks) {
                    if ($value && !in_array($value, $allowedBanks)) {
                        $fail("Trường {$attribute} không hợp lệ. Vui lòng chọn từ danh sách ngân hàng được phép.");
                    }
                }
            ],
            'account_holder_name' => 'nullable|string|max:255',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $withdraw = Withdraw::where('id', $id)
                ->where('user_id', $request->user_id)
                ->where('status', 0)
                ->first();

            if (!$withdraw) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể cập nhật. Yêu cầu không tồn tại hoặc đã được xử lý.',
                ], 400);
            }

            if ($request->has('amount')) {
                $withdraw->amount = $request->amount;
            }
            if ($request->has('bank_account_number')) {
                $withdraw->bank_account_number = $request->bank_account_number;
            }
            if ($request->has('bank_name')) {
                $withdraw->bank_name = $request->bank_name;
            }
            if ($request->has('account_holder_name')) {
                $withdraw->account_holder_name = $request->account_holder_name;
            }
            if ($request->has('note')) {
                $withdraw->note = $request->note;
            }

            $withdraw->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật yêu cầu rút tiền thành công.',
                'data' => $withdraw
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật yêu cầu rút tiền.',
            ], 500);
        }
    }


    public function getAllowedBanksList()
    {
        return response()->json([
            'status' => true,
            'message' => 'Danh sách ngân hàng được phép',
            'data' => $this->getAllowedBanks()
        ]);
    }


    public function index(Request $request)
    {
        try {
            $withdraws = Withdraw::where("user_id", $request->user_id)
                ->get();
            return response()->json([
                "status" => True,
                "message" => "Lấy danh sách rút tiền thành công",
                "data" => $withdraws
            ]);
        } catch (\Throwable $th) {
            //throw $th;
            return response()->json([
                "status" => False,
                "message" => "Đã xảy ra lỗi"
            ], 500);
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


    public function cancel(Request $request, $id)
    {

        DB::beginTransaction();
        try {
            $withdraw = Withdraw::where('id', $id)
                ->where('user_id', $request->user_id)
                ->where('status', 0) // chỉ hủy khi đang chờ
                ->first();

            if (!$withdraw) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể hủy. Yêu cầu không tồn tại hoặc đã được xử lý.',
                ], 400);
            }


            Wallet::where('user_id', $request->user_id)->increment('balance', $withdraw->amount);


            $withdraw->update(['status' => 2]); // đã huỷ

            DB::commit();

            return response()->json([
                "status" => true,
                'message' => 'Đã hủy yêu cầu rút và hoàn tiền thành công.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status" => False,
                'message' => 'Lỗi khi hủy yêu cầu rút.',
            ], 500);
        }
    }
}
