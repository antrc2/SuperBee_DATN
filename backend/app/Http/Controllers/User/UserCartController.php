<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpParser\Node\Stmt\TryCatch;

class UserCartController extends Controller
{

    public function index()
    {
        try {
            $userId =  request()->user_id;
            $webId = request()->web_id;

            $cart = Cart::with([
                'cartDetails.products.product'
            ])
                ->where('user_id', $userId)
                ->where('web_id', $webId)
                ->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng trống'
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Lấy giỏ hàng thành công',
                'data' => $cart
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi không xác định',
            ], 500);
        }
    }


    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id'
            ]);

            $userId = $request->user_id;
            $webId = $request->web_id;


            // Lấy sản phẩm từ DB
            $product = Product::where([
                ['id', $request->product_id],
                ['web_id', $webId],
                ['status', 1]
            ])->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.'
                ], 404);
            }

            DB::beginTransaction();

            // Tìm hoặc tạo cart
            $cart = Cart::firstOrCreate([
                'user_id' => $userId,
                'web_id' => $webId
            ]);

            // Kiểm tra sản phẩm đã có trong giỏ chưa
            $existingItem = $cart->cartItems()
                ->where('product_id', $product->id)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm đã có trong giỏ hàng của bạn.'
                ], 400);
            }

            // Thêm vào giỏ hàng
            $cartItem = $cart->cartItems()->create([
                'product_id' => $product->id
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Đã thêm sản phẩm vào giỏ hàng',
                'data' => $cartItem
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'đã xảy ra lỗi',
            ], 500);
        }
    }



    public function destroy(Request $request, string $id)
    {
        try {
            $userId = $request->user_id;
            $webId = $request->web_id;

            $cart = Cart::where([
                ['user_id', $userId],
                ['web_id', $webId]
            ])->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng không tồn tại'
                ], 404);
            }

            // Tìm sản phẩm trong giỏ để xoá (theo id sản phẩm truyền lên)
            $cartItem = $cart->cartItems()->where('id', $id)->first();

            if (!$cartItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại trong giỏ'
                ], 404);
            }

            DB::beginTransaction();

            // Xoá sản phẩm khỏi giỏ
            $cartItem->delete();

            // Nếu sau khi xoá mà giỏ hàng rỗng thì xoá luôn giỏ
            if ($cart->cartItems()->count() === 0) {
                $cart->delete();
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Đã xoá sản phẩm khỏi giỏ hàng'
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}
