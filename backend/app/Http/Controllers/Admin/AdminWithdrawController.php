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
    public function index(Request $request)
    {
        try {
            $withdraws = Withdraw::with('user')->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách yêu cầu rút tiền thành công',
                'data' => $withdraws
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi khi truy vấn rút tiền',
                'data' => []
                // 'error' => $e->getMessage()
            ], 500);
        }
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
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
                        "status"=>False,
                        "message"=>"Không tìm thấy yêu cầu rút tiền"
                    ],400);
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
                $data[] = [$index, $withdraw->bank_account_number, $withdraw->account_holder_name, $withdraw->bank_name, $withdraw->withdraw_code];
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
