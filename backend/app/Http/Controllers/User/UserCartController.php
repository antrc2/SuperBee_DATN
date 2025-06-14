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

            $cart = Cart::with([
                'items.product','items.product','items.product.category', 'items.product.images'
            ])
                ->where('user_id', $userId)
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $userId,
                ]);
                $cart->setRelation('items', collect());
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
            $userId = $request->user_id;
            $product = Product::where([
                ['id', $request->product_id],
                ['status', 1]
            ])->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.'
                ], 404);
            }

            DB::beginTransaction();

            $cart = Cart::firstOrCreate([
                'user_id' => $userId
            ]);

            // Kiểm tra trùng sản phẩm 
            $existingItem = $cart->items()
                ->where('product_id', $product->id)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm đã có trong giỏ hàng của bạn.'
                ], 400);
            }

            // Thêm sản phẩm vào giỏ
            $cartItem = $cart->items()->create([
                'product_id' => $product->id
            ]);

            $cart = Cart::with([
                'items.product'
            ])
                ->where('user_id', $userId)
                ->first();


            DB::commit();
            $response = [];

            foreach ($cart->items as $item){
                $response[] = $item->product;
            }

            return response()->json([
                'status' => true,
                'message' => 'Đã thêm sản phẩm vào giỏ hàng',
                'data' => $response
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi',
                // 'error' => $e->getMessage()
            ], 500);
        }
    }




    public function destroy(Request $request, string $id)
    {
        try {
            $userId = $request->user_id;
            $cart = Cart::where([
                ['user_id', $userId],
            ])->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng không tồn tại'
                ], 404);
            }

            // Tìm sản phẩm trong giỏ để xoá (theo id sản phẩm truyền lên)
            $cartItem = $cart->items()->where('id', $id)->first();

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
            if ($cart->items()->count() === 0) {
                $cart->delete();
            }

            DB::commit();
            $cart = Cart::with([
                'items.product'
            ])
                ->where('user_id', $userId)
                ->first();

            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $userId,
                ]);
                $cart->setRelation('items', collect());
            }

            return response()->json([
                'status' => true,
                'message' => 'Đã xoá sản phẩm khỏi giỏ hàng',
                'data' => $cart
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Đã xảy ra lỗi: '
            ], 500);
        }
    }
}
