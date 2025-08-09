<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Callback\BankController;
use App\Http\Controllers\Callback\CardController;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Models\Wallet;
use App\Models\Category;
use App\Models\Message;
use App\Models\Post;
use App\Models\RechargeBank;
use App\Models\RechargeCard;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function donate_history(Request $request){
        try {
            $cards = RechargeCard::where("status",1)->with(['walletTransaction.wallet.user'])->limit(5)->get();
            $banks = RechargeBank::where("status",1)->with(['walletTransaction.wallet.user'])->limit(5)->get();
            return response()->json([
                'status'=>True,
                'message'=>"Lấy lịch sử nạp thẻ thành công",
                'data'=> [
                    "cards"=>$cards,
                    "banks"=>$banks
                ]
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>False,
                'message'=>"Lấy lịch sử nạp thẻ thất bại",
                'data'=> [
                    "cards"=>[],
                    "banks"=>[]
                ]
            ],500);
            //throw $th;
        }
    }
    /**
     * Lấy dữ liệu chính cho trang chủ.
     * Dữ liệu sản phẩm ở đây đã được giới hạn sẵn (limit 8).
     */
    public function index(Request $request)
    {
        // ... (Giữ nguyên logic của hàm index đã tối ưu ở lần trước)
        $banners = Banner::where('web_id', $request->web_id)->where('status', 1)->orderBy('id', 'asc')->get();
        $category = new UserCategoryController();
        $categories = $category->index()->getData();
        // $topNap = Wallet::with(['user' => fn($q) => $q->select('id', 'username')])

        //     // Tôi muốn cộng thêm dữ liệu ở cột promotion_balance vào cột balance
        //     ->selectRaw('balance + promotion_balance as balance, user_id')
        //     ->orderBy('balance', 'desc')->limit(5)->get();
        $topWallets = DB::table('wallet_transactions')
            ->select('wallet_id', DB::raw('SUM(amount) as total_amount'))
            ->where('type', 'like', 'recharge_%')
            ->groupBy('wallet_id')
            ->orderByDesc('total_amount')
            ->limit(5)
            ->get();
        $topNap = [];
        foreach ($topWallets as $topWallet) {
            $wallet = Wallet::where("id",$topWallet->wallet_id)->with("user")->first();
            $topNap[] = [
                "wallet_id"=>$topWallet->wallet_id,
                "balance"=>$topWallet->total_amount,
                "user_id"=>$wallet->user_id,
                'user'=>[
                    "id"=>$wallet->user->id,
                    "username"=>$wallet->user->username
                ]
                ];
        }
        
        // $topNap = [];
        // Lấy 8 sản phẩm nổi bật
        $featuredProducts = Product::with("images", "category", "gameAttributes")
            ->where('status', 1)->where('category_id','!=',1)->whereNotNull('sale')->orderBy('price', 'desc')->limit(8)->get();

        // Lấy 8 sản phẩm mới nhất
        $newestProducts = Product::with("images", "category", "gameAttributes")
            ->where('status', 1)->where('category_id','!=',1)->latest()->limit(8)->get();

        return response()->json([
            'status' => 200,
            'message' => 'Lấy dữ liệu trang chủ thành công',
            'data' => [
                'banners' => $banners,
                'categories' => $categories->data,
                'top_users' => $topNap,
                'featured_products' => $featuredProducts,
                'newest_products' => $newestProducts,
                'topwallet'=>$topWallets
            ]
        ], 200);
    }

    /**
     * API chuyên dụng cho trang tìm kiếm và lọc sản phẩm.
     * Hỗ trợ phân trang, sắp xếp, lọc theo danh mục, SKU, và khoảng giá.
     */
    public function products(Request $request)
    {
        // Validate tất cả các tham số có thể có
        $request->validate([
            'key' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'categoryId' => 'nullable|integer|exists:categories,id',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|gte:min_price',
            'sortBy' => 'nullable|in:featured,newest,price_asc,price_desc',
            'limit' => 'integer|min:1|max:50',
            'page' => 'integer|min:1',
        ]);

        $limit = $request->query('limit', 12);

        // Bắt đầu xây dựng câu truy vấn
        $query = Product::with(['category', 'gameAttributes', 'images'])->where('status', 1);

        // 1. Lọc theo TỪ KHÓA CHUNG (key) - tìm trong SKU hoặc tên danh mục
        if ($request->filled('key')) {
            $searchKey = $request->query('key');
            $query->where(function ($q) use ($searchKey) {
                $q->where('sku', 'like', '%' . $searchKey . '%')
                    ->orWhereHas('category', function ($catQuery) use ($searchKey) {
                        $catQuery->where('name', 'like', '%' . $searchKey . '%');
                    });
            });
        }

        // 2. Lọc theo SKU (từ ô input trong bộ lọc)
        if ($request->filled('sku')) {
            $query->where('sku', 'like', '%' . $request->query('sku') . '%');
        }

        // 3. Lọc theo DANH MỤC (từ dropdown trong bộ lọc)
        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->query('categoryId'));
        }

        // 4. Lọc theo KHOẢNG GIÁ
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->query('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->query('max_price'));
        }

        // 5. SẮP XẾP
        $sortBy = $request->query('sortBy', 'newest'); // Mặc định là mới nhất
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'featured':
                $query->whereNotNull('sale')->orderBy('price', 'desc');
                break;
            case 'newest':
            default:
                $query->latest();
                break;
        }

        // Phân trang và trả về kết quả
        $products = $query->paginate($limit);
        return response()->json($products);
    }
    // app/Http/Controllers/YourController.php

    public function messages(Request $request)
    {
        try {
            $userId = $request->user_id;

            // Tối ưu eager loading: chỉ chọn các cột cần thiết từ bảng user
            $chatRoom = ChatRoom::whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId)->where('role', 'customer');
            })
                ->with([
                    'messages' => function ($query) {
                        $query->orderBy('created_at', 'asc');
                    },
                    // Chỉ lấy các trường id, username, avatar_url từ user của participant
                    'participants.user:id,username,avatar_url'
                ])
                ->first();

            if (!$chatRoom) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy phòng chat.',
                ], 200); // 200 OK vẫn hợp lý vì đây là trường hợp nghiệp vụ, không phải lỗi server
            }

            $agent = null;
            $customer = null;
            $customerParticipant = null;

            foreach ($chatRoom->participants as $participant) {
                if ($participant->role === 'agent' && $participant->user) {
                    $agent = $participant->user;
                }
                if ($participant->role === 'customer' && $participant->user) {
                    $customer = $participant->user;
                    $customerParticipant = $participant; // Lưu lại thông tin participant của customer
                }
            }

            // Tính số tin nhắn chưa đọc
            $lastReadMessageId = $customerParticipant ? $customerParticipant->last_read_message_id : 0;
            $unreadCount = $chatRoom->messages->where('id', '>', $lastReadMessageId)->count();


            // Dữ liệu trả về đã gọn hơn
            $responseData = [
                'roomInfo' => $chatRoom, // roomInfo đã chứa messages và participants
                'messages' => $chatRoom->messages, // Vẫn giữ lại để FE không cần đổi logic (res.data.data.messages)
                'agentDetails' => $agent,
                'customerDetails' => $customer,
                'unreadCount' => $unreadCount, // Thêm số tin nhắn chưa đọc
            ];

            return response()->json([
                'status' => true,
                'message' => 'Lấy thông tin chat thành công.',
                'data' => $responseData
            ]);
        } catch (\Throwable $e) {
            // Log lỗi để debug
            return response()->json([
                'status' => false,
                'message' => "Lỗi hệ thống khi lấy thông tin chat.",
            ], 500);
        }
    }
    public function post_sitemap()
    {
        try {
            // 1. Lấy URL frontend và danh sách bài viết
            $frontend = env('FRONTEND_URL', 'https://yourdomain.com');
            $posts    = Post::all();

            // 2. Khai báo XML + optional XSL stylesheet
            $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";

            // 3. Mở thẻ urlset với các namespace
            $xml .= '<urlset'
                . ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
                . ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
                . ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'
                . ' xmlns:xhtml="http://www.w3.org/1999/xhtml">'
                . "\n";

            // 4. Loop từng bài và build <url>…</url>
            foreach ($posts as $post) {
                $link    = "{$frontend}/news/{$post->slug}";
                $lastmod = $post->updated_at->toAtomString(); // ISO 8601 format
                $img     = $post->image_thumbnail_url;

                $xml .= "  <url>\n";
                $xml .= "    <loc>{$link}</loc>\n";
                $xml .= "    <lastmod>{$lastmod}</lastmod>\n";

                if ($img) {
                    $xml .= "    <image:image>\n";
                    $xml .= "      <image:loc>{$img}</image:loc>\n";
                    $xml .= "    </image:image>\n";
                }

                // Ví dụ alternate cho tiếng Việt
                $xml .= "    <xhtml:link"
                    . " rel=\"alternate\""
                    . " hreflang=\"vi\""
                    . " href=\"{$link}\""
                    . " />\n";

                $xml .= "  </url>\n";
            }

            // 5. Đóng thẻ urlset
            $xml .= '</urlset>';

            // 6. Trả về response XML
            return response($xml, 200)
                ->header('Content-Type', 'application/xml; charset=UTF-8');
        } catch (\Throwable $th) {
            // Tuỳ chỉnh: log lỗi, abort 500, hoặc trả về view lỗi riêng
            // \Log::error('[Sitemap] ', ['err' => $th->getMessage()]);
            return response('Server Error', 500);
        }
    }
}
