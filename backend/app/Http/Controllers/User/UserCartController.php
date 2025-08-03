<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Stmt\TryCatch;

class UserCartController extends Controller
{

    public function index()
    {
        try {
            $userId =  request()->user_id;
            $cart = Cart::where('user_id', $userId)->first();

            if (!$cart) {
                $cart = Cart::create([
                    'user_id' => $userId,
                ]);
                $cart->setRelation('items', collect());
            }
            $products = CartItem::with(['product', 'product.images', 'product.category'])
                ->where('cart_id', $cart->id)
                ->get();
            return response()->json([
                'status' => true,
                'message' => 'Lấy giỏ hàng thành công',
                'data' => $products
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi không xác định',
            ], 500);
        }
    }


    public function save(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'cart_item_id' => 'required|array|min:1',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Dữ liệu không hợp lệ',
                ], 422);
            }
            $user_id = $request->user_id;
            $cart_item_id = $request->cart_item_id;
            $cart = Cart::where("user_id", $user_id)->first();
            DB::beginTransaction();
            if ($cart == null) {
                return response()->json([
                    "status" => False,
                    "message" => "Không tìm thấy giỏ hàng",

                ], 404);
            } else {
                CartItem::where('cart_id', $cart->id)->update([
                    'status' => 0
                ]);
                // $order_code = "";
                // do {
                //     $order_code = $this->generateCode(16);
                // } while (Order::where("order_code", $order_code)->exists());
                // $wallet = Wallet::where("user_id",$user_id)->first();
                // $wallet_transaction = WalletTransaction::create([
                //     "wallet_id"=>$wallet->id,
                //     "type"=>"purchase",
                //     "amount"=>0,
                //     "status"=>0
                // ]);
                // $order = Order::create([
                //     "user_id"=>$user_id,
                //     "order_code"=>$order_code,
                //     "wallet_transaction_id"=>$wallet_transaction->id,
                //     "total_amount"=>0,

                // ]);
                foreach ($cart_item_id as $item) {
                    $cart_item = CartItem::where("cart_id", $cart->id)->where("id", $item)->with('product')->first();
                    if ($cart_item == null) {
                        DB::rollBack();
                        return response()->json([
                            "status" => False,
                            "message" => "Một sản phẩm không tồn tại"
                        ], 404);
                    } else {
                        // $price = $cart_item->product->sale ?? $cart_item->product->price;
                        // $order_item = OrderItem::create([
                        //     "order_id"=>$order->id,
                        //     "product_id"=>$item,
                        //     "unit_price"=>$price
                        // ]);

                        // WalletTransaction::where("id",$wallet_transaction->id)->update([
                        //     "related_id"=>$order->id,
                        //     "related_type"=>"App\Models\Order"
                        // ]);
                        $cart_item->status = 1;
                        $cart_item->save();
                    }
                }
                DB::commit();
            }

            return response()->json([
                "status" => True,
                "message" => "Thành công"
            ], 200);
        } catch (\Throwable $th) {
            // DB::rollBack();
            return response()->json([
                "status" => False,
                "message" => "Đã xảy ra lỗi",
                "error" => $th->getMessage(),
                "line" => $th->getLine()
            ], 500);
            //throw $th;
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
                'product_id' => $product->id,
                'status'=>1
            ]);

            $cart = Cart::with([
                'items.product'
            ])
                ->where('user_id', $userId)
                ->first();


            DB::commit();
            $response = [];

            foreach ($cart->items as $item) {
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
