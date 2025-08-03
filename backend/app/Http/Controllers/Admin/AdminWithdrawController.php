<?php

namespace App\Http\Controllers\Admin;

use App\Models\Withdraw;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AdminWithdrawController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // app/Http/Controllers/Admin/AdminWithdrawController.php

    public function index(Request $request)
    {
        try {
            // Bắt đầu xây dựng query, luôn kèm theo thông tin user
            $query = Withdraw::with('user');
// $data= Withdraw::all();
// dd($data);
            // 1. Lọc theo trạng thái (status)
            // Kiểm tra nếu có filter 'status' và giá trị khác 'all'
            if ($request->has('status') && $request->input('status') !== 'all') {
                $query->where('status', $request->input('status'));
            }

            // 2. Lọc theo từ khóa tìm kiếm (search)
            // Kiểm tra nếu có filter 'search'
            if ($request->has('search') && $request->input('search')) {
                $searchTerm = $request->input('search');

                // Tìm kiếm trên nhiều trường của bảng 'withdraws' và bảng 'users' liên quan
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('withdraw_code', 'like', "%{$searchTerm}%")
                        ->orWhere('account_holder_name', 'like', "%{$searchTerm}%")
                        ->orWhere('bank_account_number', 'like', "%{$searchTerm}%")
                        // Tìm kiếm trong bảng 'users' thông qua quan hệ
                        ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                            $userQuery->where('username', 'like', "%{$searchTerm}%")
                                ->orWhere('email', 'like', "%{$searchTerm}%");
                        });
                });
            }

            // Sắp xếp mặc định: mới nhất lên đầu
            $query->latest(); // Tương đương orderBy('created_at', 'desc')

            // 3. Phân trang
            // Lấy số lượng item mỗi trang từ request, mặc định là 15
            $perPage = $request->input('per_page', 15);
            $withdraws = $query->paginate($perPage);

            // Laravel tự động trả về cấu trúc JSON với thông tin phân trang
            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách yêu cầu rút tiền thành công',
                'data' => $withdraws // Dữ liệu trả về đã bao gồm metadata phân trang
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi truy vấn rút tiền',
                'error' => $e->getMessage() // Thêm message lỗi để debug
            ], 500);
        }
    }
    // Ví dụ cho hàm update trong AdminWithdrawController.php
    public function update(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|integer|in:3', // Chỉ cho phép cập nhật status thành 3 (Thất bại)
            'note' => 'required|string|max:500',
        ]);

        // Chỉ tìm yêu cầu có status = 0 (Chờ xử lý) để cập nhật
        $withdraw = Withdraw::where('id', $id)->where('status', 0)->firstOrFail();

        $withdraw->status = $request->status;
        $withdraw->note = $request->note;
        $withdraw->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật yêu cầu thành công',
            'data' => $withdraw
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function export(Request $request)
    {
        try {
            $withdraw_ids = $request->withdraw_ids;
            $data = [];
            $index = 1;
            foreach ($withdraw_ids as $withdraw_id) {
                $withdraw = Withdraw::where('id', $withdraw_id)->first();
                if ($withdraw == null) {
                    return response()->json([
                        "status" => False,
                        "message" => "Không tìm thấy yêu cầu rút tiền"
                    ], 400);
                }
                if ($withdraw->status == 1) {
                    return response()->json([
                        'status' => False,
                        'message' => "Yêu cầu {$withdraw->withdraw_code} đã thực hiện thành công",
                    ], 400);
                } elseif ($withdraw->status == 2) {
                    return response()->json([
                        'status' => False,
                        'message' => "Yêu cầu {$withdraw->withdraw_code} đã bị hủy",
                    ], 400);
                } elseif ($withdraw->status == 3) {
                    return response()->json([
                        'status' => False,
                        'message' => "Yêu cầu {$withdraw->withdraw_code} đã thất bại: {$withdraw->note}",
                    ], 400);
                }
                // return response()->json([
                //     "hehe"=>$withdraw
                // ]);
                $data[] = [$index, $withdraw->bank_account_number, $withdraw->account_holder_name, $withdraw->bank_name, $withdraw->amount, $withdraw->withdraw_code];
                $index++;
            }
            // Đường dẫn file mẫu
            $filePath = public_path('Chuyenkhoantheobangke.xlsx');
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getSheetByName('eMB_BulkPayment');

            // Dữ liệu ghi (bắt đầu từ dòng 3)
            // $data = [
            //     [1, '123456789', 'Nguyen Van A', 'Vietcombank - CN Hanoi', 1500000, 'Thanh toan hoa don 123'],
            //     [2, '987654321', 'Tran Thi B', 'Techcombank - CN HCM', 2000000, 'Thanh toan hop dong ABC'],
            // ];
            $startRow = 3;
            foreach ($data as $index => $row) {
                $sheet->fromArray($row, null, 'A' . ($startRow + $index));
            }

            // Ghi file tạm thời ra đĩa
            $tempFilename = 'Chuyenkhoan_output_' . time() . '.xlsx';
            $savePath = storage_path($tempFilename);
            (new Xlsx($spreadsheet))->save($savePath);

            // Tạo đối tượng UploadedFile từ file đã lưu
            $file = new UploadedFile(
                $savePath,
                $tempFilename,
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                null,
                true // $test mode = true vì đây không phải file upload thực từ HTTP request
            );

            // Gọi hàm uploadFile
            $url = $this->uploadFile($file, 'Transaction');
            // Xoá file tạm
            if (file_exists($savePath)) {
                unlink($savePath);
            }

            return response()->json([
                'message' => 'Xuất và upload thành công',
                'url' => $url
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "error" => $th->getMessage()
            ]);
        }
    }
}
