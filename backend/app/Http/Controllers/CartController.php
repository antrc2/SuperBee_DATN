<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartDetail;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Xem giỏ hàng của người dùng
     * - Chỉ cho phép xem giỏ hàng của chính mình
     * - Trả về thông tin chi tiết sản phẩm trong giỏ hàng
     */
    public function index()
    {
        try {
            // Lấy thông tin user đang đăng nhập
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Người dùng chưa đăng nhập'
                ], 401);
            }
            // Tìm giỏ hàng của user với web_id tương ứng
            $cart = Cart::with([
                'cartDetails.productDetail.product'
            ])
            ->where('user_id', $user->id)
            ->where('web_id', $user->web_id)
            ->first();

            // Nếu không có giỏ hàng
            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Chưa có sản phẩm nào trong giỏ hàng'
                ], 200);
            }

            // Trả về thông tin giỏ hàng
            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách sản phẩm trong giỏ hàng thành công',
                'data' => $cart
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_detail_id' => 'required|exists:product_details,id'
            ]);
    
            $user = Auth::user();
    
            $productDetail = ProductDetail::with('product')
                ->where([
                    ['id', $request->product_detail_id],
                    ['web_id', $user->web_id]
                ])
                ->first();
    
            if (!$productDetail || $productDetail->product->status !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không hợp lệ hoặc không khả dụng'
                ], 400);
            }
    
            DB::beginTransaction();
    
            $cart = Cart::firstOrCreate([
                'user_id' => $user->id,
                'web_id' => $user->web_id
            ]);
    
            $cartDetail = $cart->cartDetails()->create([
                'product_detail_id' => $productDetail->id,
                'price' => $productDetail->price
            ]);
    
            DB::commit();
    
            return response()->json([
                'status' => true,
                'message' => 'Thêm sản phẩm vào giỏ hàng thành công',
                'data' => $cartDetail
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
    

    /**
     * Xóa sản phẩm khỏi giỏ hàng
     * - Xóa cứng sản phẩm khỏi giỏ hàng
     * - Nếu giỏ hàng trống thì xóa luôn giỏ hàng
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            // Tìm chi tiết giỏ hàng cần xóa
            $cartDetail = CartDetail::whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->where('web_id', $user->web_id);
            })->findOrFail($id);

            // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
            DB::beginTransaction();
            try {
                // Lưu cart_id trước khi xóa
                $cartId = $cartDetail->cart_id;
                
                // Xóa chi tiết giỏ hàng
                $cartDetail->delete();

                // Kiểm tra nếu giỏ hàng trống thì xóa luôn
                $cart = Cart::find($cartId);
                if ($cart && $cart->cartDetails()->count() === 0) {
                    $cart->delete();
                }

                DB::commit();

                return response()->json([
                    'status' => true,
                    'message' => 'Xóa sản phẩm khỏi giỏ hàng thành công'
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
} 