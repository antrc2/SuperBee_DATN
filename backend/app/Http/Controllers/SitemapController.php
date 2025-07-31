<?php

namespace App\Http\Controllers;

use App\Http\Controllers\User\UserCategoryController;
use App\Models\Category;
use App\Models\Categorypost;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    public function index()
    {
        try {
            // 1. Lấy URL frontend và danh sách bài viết
            $frontend = env('FRONTEND_URL');

            $xml = "
<?xml version='1.0' encoding='UTF-8'?>
<sitemapindex xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
	<sitemap>
		<loc>{$frontend}/tin-tuc.xml</loc>
	</sitemap>
	<sitemap>
		<loc>{$frontend}/trang-khac.xml</loc>
	</sitemap>
    <sitemap>
		<loc>{$frontend}/san-pham.xml</loc>
	</sitemap>
        <sitemap>
		<loc>{$frontend}/danh-muc.xml</loc>
	</sitemap>
</sitemapindex>";

            // 6. Trả về response XML
            return response($xml, 200)
                ->header('Content-Type', 'application/xml; charset=UTF-8');
        } catch (\Throwable $th) {
            // Tuỳ chỉnh: log lỗi, abort 500, hoặc trả về view lỗi riêng
            // \Log::error('[Sitemap] ', ['err' => $th->getMessage()]);
            return response('Server Error', 500);
        }
    }
    public function category()
    {
        try {
            $categories = Category::all();
            $frontend = env('FRONTEND_URL');
            $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset'
                . ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
                . ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
                . ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'
                . ' xmlns:xhtml="http://www.w3.org/1999/xhtml">'
                . "\n";
            foreach ($categories as $category) {
                $link    = "{$frontend}/mua-acc/{$category->slug}";
                $lastmod = $category->updated_at->toAtomString(); // ISO 8601 format
                $img     = $category->image;

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

            $xml .= '</urlset>';

            // 6. Trả về response XML
            return response($xml, 200)
                ->header('Content-Type', 'application/xml; charset=UTF-8');
        } catch (\Throwable $th) {
            //throw $th;
        }
    }
    public function product()
    {
        try {
            $frontend = env('FRONTEND_URL', 'https://yourdomain.com');
            // $posts = Post::with("category")->get();
            $products = Product::with("category")->with('images')->get();
            $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
            $xml .= '<urlset'
                . ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
                . ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
                . ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'
                . ' xmlns:xhtml="http://www.w3.org/1999/xhtml">'
                . "\n";
            foreach ($products as $product) {
                $link    = "{$frontend}/acc/{$product->sku}";
                $lastmod = $product->updated_at->toAtomString(); // ISO 8601 format
                // $img     = $post->image_thumbnail_url;

                $xml .= "  <url>\n";
                $xml .= "    <loc>{$link}</loc>\n";
                $xml .= "    <lastmod>{$lastmod}</lastmod>\n";
                if (!empty($product->images)) {
                    foreach ($product->images as $img) {
                        $xml .= "    <image:image>\n";
                        $xml .= "      <image:loc>{$img->image_url}</image:loc>\n";
                        // Nếu cần, bạn có thể thêm caption/title:
                        // $xml .= "      <image:caption>Chú thích ảnh ở đây</image:caption>\n";
                        $xml .= "    </image:image>\n";
                    }
                }
                // if ($img) {
                //     $xml .= "    <image:image>\n";
                //     $xml .= "      <image:loc>{$img}</image:loc>\n";
                //     $xml .= "    </image:image>\n";
                // }

                // Ví dụ alternate cho tiếng Việt
                $xml .= "    <xhtml:link"
                    . " rel=\"alternate\""
                    . " hreflang=\"vi\""
                    . " href=\"{$link}\""
                    . " />\n";

                $xml .= "  </url>\n";
            }

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

    public function post()
    {
        try {
            // 1. Lấy URL frontend và danh sách bài viết
            $frontend = env('FRONTEND_URL', 'https://yourdomain.com');
            $posts = Post::with("category")->get();
            // return response()->json(['hehe' => $posts]);
            // 2. Khai báo XML + optional XSL stylesheet
            $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";

            // 3. Mở thẻ urlset với các namespace
            $xml .= '<urlset'
                . ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
                . ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
                . ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'
                . ' xmlns:xhtml="http://www.w3.org/1999/xhtml">'
                . "\n";
            foreach ($posts as $post) {
                $link    = "{$frontend}/tin-tuc/{$post->category->slug}/{$post->slug}";
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
            // foreach ($category_posts as $category_post) {
            //     foreach ($category_post->post as $post) {
            //         $link    = "{$frontend}/tin-tuc/{$post->category}/{$post->slug}";
            //         $lastmod = $post->updated_at->toAtomString(); // ISO 8601 format
            //         $img     = $post->image_thumbnail_url;

            //         $xml .= "  <url>\n";
            //         $xml .= "    <loc>{$link}</loc>\n";
            //         $xml .= "    <lastmod>{$lastmod}</lastmod>\n";

            //         if ($img) {
            //             $xml .= "    <image:image>\n";
            //             $xml .= "      <image:loc>{$img}</image:loc>\n";
            //             $xml .= "    </image:image>\n";
            //         }

            //         // Ví dụ alternate cho tiếng Việt
            //         $xml .= "    <xhtml:link"
            //             . " rel=\"alternate\""
            //             . " hreflang=\"vi\""
            //             . " href=\"{$link}\""
            //             . " />\n";

            //         $xml .= "  </url>\n";
            //     }
            // }

            // foreach ($posts as $post) {
            //     $link    = "{$frontend}/tin-tuc/{$post->category}/{$post->slug}";
            //     $lastmod = $post->updated_at->toAtomString(); // ISO 8601 format
            //     $img     = $post->image_thumbnail_url;

            //     $xml .= "  <url>\n";
            //     $xml .= "    <loc>{$link}</loc>\n";
            //     $xml .= "    <lastmod>{$lastmod}</lastmod>\n";

            //     if ($img) {
            //         $xml .= "    <image:image>\n";
            //         $xml .= "      <image:loc>{$img}</image:loc>\n";
            //         $xml .= "    </image:image>\n";
            //     }

            //     // Ví dụ alternate cho tiếng Việt
            //     $xml .= "    <xhtml:link"
            //         . " rel=\"alternate\""
            //         . " hreflang=\"vi\""
            //         . " href=\"{$link}\""
            //         . " />\n";

            //     $xml .= "  </url>\n";
            // }

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
    public function home()
    {
        $frontend_url = env("FRONTEND_URL");
        $xml =  "<?xml version='1.0' encoding='UTF-8'?>
<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>
  <url>
    <loc>{$frontend_url}/auth/login</loc>
    <lastmod>2025-07-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{$frontend_url}/auth/register</loc>
    <lastmod>2025-07-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
    <url>
    <loc>{$frontend_url}/forgot-password</loc>
    <lastmod>2025-07-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
";
        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}
