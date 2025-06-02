<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartDetail;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Xem giỏ hàng của người dùng
     * - Chỉ cho phép xem giỏ hàng của chính mình
     * - Trả về thông tin chi tiết sản phẩm trong giỏ hàng
     */
    public function index(Request $request)
    {
        try {
            // Lấy thông tin user từ JWT token
            $userId = $request->user_id;
            $webId = $request->web_id;

            if (!$userId || !$webId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Thông tin người dùng không hợp lệ'
                ], 401);
            }
            // Tìm giỏ hàng của user với web_id tương ứng
            $cart = Cart::with([
                'cartDetails.productDetail.product'
            ])
            ->where('user_id', $userId)
            ->where('web_id', $webId)
            ->first();

            // Nếu không có giỏ hàng
            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng của bạn đang trống.'
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
    
            $userId = $request->user_id;
            $webId = $request->web_id;
    
            if (!$userId || !$webId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Thông tin người dùng không hợp lệ'
                ], 401);
            }
    
            $productDetail = ProductDetail::with('product')
                ->where([
                    ['id', $request->product_detail_id],
                    ['web_id', $webId]
                ])
                ->first();
    
            if (!$productDetail || !$productDetail->product || $productDetail->product->status !== 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.'
                ], 400);
            }
    
            DB::beginTransaction();
    
            $cart = Cart::firstOrCreate([
                'user_id' => $userId,
                'web_id' => $webId
            ]);

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            $existingCartDetail = $cart->cartDetails()
                ->where('product_detail_id', $productDetail->id)
                ->first();

            if ($existingCartDetail) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm đã có trong giỏ hàng của bạn.'
                ], 400);
            }
    
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
    public function destroy(Request $request, $id)
    {
        try {
            $userId = $request->user_id;
            $webId = $request->web_id;

            if (!$userId || !$webId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Thông tin người dùng không hợp lệ'
                ], 401);
            }

            // Tìm chi tiết giỏ hàng cần xóa
            $cartDetail = CartDetail::whereHas('cart', function ($query) use ($userId, $webId) {
                $query->where('user_id', $userId)
                    ->where('web_id', $webId);
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
                    'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.'
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