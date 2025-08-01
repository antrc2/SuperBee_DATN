<?php

use Bramus\Router\Router;

require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
$router = new Router();

$router->get("/", function () {
  $title = "SuperBee Gaming Store – Bán Tài Khoản Game Cao Cấp, Giao Dịch Nhanh & An Toàn";
  $description = "SuperBee – Nơi mua bán tài khoản game Liên Quân, Free Fire, Roblox… chất lượng Premium, giá tốt nhất, bảo hành 24h và hỗ trợ 24/7 qua Zalo/Facebook. Giao dịch an toàn, nhận nick ngay!";
  require_once "view/index.php";
});

$router->get("/report", function(){
  header("Location: https://docs.google.com/document/d/1w9tniY8r37U8pjsciLXoY8W_W_yPNk9b/edit");
});
$router->get("/slide", function(){
  header("Location: https://www.canva.com/design/DAGusz3n0T4/9IIU6q1FjM-huH2hbXZwHw/edit");
});
$router->get("/drawio", function(){
  header("Location: https://drive.google.com/file/d/1CR9pdi29sZV84zawVRByBtsp_C-6eFbG/view?usp=sharing");
});

$router->get("/acc/{sku}", function ($sku) {
  $apiUrl = $_ENV['BACKEND_API'] . "/products/acc/{$sku}";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);

  // Thực thi request
  $response = curl_exec($ch);
  curl_close($ch);
  $data = json_decode($response, true);
  if ($data['status']) {
    $result = $data['data'];
    $title = $result[0]['category']['name'] . " - " . $result[0]['sku'];
    $description = $result[0]['description'];
  }
  require_once "view/index.php";
});

$router->get("/forgot-password", function () {
  $title = "Quên Mật Khẩu | SuperBee Gaming Store – Phục Hồi Nhanh Chóng";
  $description = "Nhập email để nhận liên kết đặt lại mật khẩu cho tài khoản SuperBee. Phục hồi nhanh, an toàn và được hỗ trợ 24/7.";
  require_once "view/index.php";
});

$router->get("/auth/register", function () {
  $title = "Đăng Ký | SuperBee Gaming Store – Tạo Tài Khoản Miễn Phí";
  $description = "Tạo tài khoản miễn phí trên SuperBee để truy cập dịch vụ mua bán tài khoản game chất lượng Premium: Liên Quân, Free Fire, Roblox… Giao dịch an toàn, bảo hành 24h.";
  require_once "view/index.php";
});

$router->get("/auth/login", function () {
  $title = "Đăng Nhập | SuperBee Gaming Store – Mua Bán Tài Khoản Game";
  $description = "Đăng nhập vào SuperBee để mua bán tài khoản game Liên Quân, Free Fire, Roblox… nhanh chóng và an toàn. Hỗ trợ 24/7, bảo mật cao, nhận nick ngay tức thì.";
  require_once "view/index.php";
});
$router->get("/mua-acc/{slug}", function ($slug) {
  $apiUrl = $_ENV['BACKEND_API'] . "/products/{$slug}";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  $data = json_decode($response, true);
  if ($data['status']) {
    $result = $data['data'];
    $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
    $description = $result['category']['description'];
  }
  require_once "view/index.php";
});
$router->mount('/tin-tuc', function () use ($router) {
  $router->get('/', function () {
    // Nếu có API list, bạn có thể gọi tương tự curl như bên dưới
    // $apiUrl     = $_ENV['BACKEND_API'] . '/post';
    // $token      = $_ENV['WEB_TOKEN'];
    // $ch         = curl_init();
    // curl_setopt($ch, CURLOPT_URL, $apiUrl);
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    // curl_setopt($ch, CURLOPT_HTTPHEADER, [
    //     'Accept: application/json',
    //     "X-API-KEY: {$token}",
    // ]);
    // $resp = curl_exec($ch);
    // curl_close($ch);
    // $list = json_decode($resp, true)['data'] ?? [];

    // SEO
    $title       = 'Tin Tức | SuperBee Gaming Store – Cập Nhật Tin Tức Mới Nhất';
    $description = 'Theo dõi tin tức game Liên Quân, Free Fire, Roblox… nóng hổi mỗi ngày tại SuperBee. Mẹo chơi, khuyến mãi & tài khoản hot nhất.';
    // Hiển thị view danh sách
    require_once "view/index.php";
    // require_once __DIR__ . '/view/tintuc/index.php';
  });
  $router->get('/{category}/{post_slug}', function ($category, $slug) {
    $apiUrl = sprintf(
      '%s/post/%s',
      rtrim($_ENV['BACKEND_API'], '/'),
      // urlencode($category),
      urlencode($slug)
    );
    $token = $_ENV['WEB_TOKEN'];

    // gọi cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Accept: application/json',
      "X-API-KEY: {$token}",
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    // echo $response;
    $data = json_decode($response, true);
    if ($data['status']) {
      $result = $data['data'];
      $title = $result['title'] . " - Cập Nhật Tin Tức Mới Nhất";
      $description = $result['description'];
    }
    // if (!empty($data['status']) && $data['status']) {
    //     $post = $data['data'];
    //     // SEO title / description động
    //     $title       = $post['title'] . ' | SuperBee Gaming Store';
    //     // lấy đoạn mô tả ngắn (excerpt hoặc cắt 160 ký tự)
    //     $description = isset($post['excerpt'])
    //         ? $post['excerpt']
    //         : mb_substr(strip_tags($post['content']), 0, 160, 'UTF-8') . '…';
    // } else {
    //     // fallback nếu lỗi hoặc không tìm thấy
    //     $title       = 'Không tìm thấy bài viết | SuperBee';
    //     $description = 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.';
    //     $post        = null;
    // }

    // Hiển thị view chi tiết
    // require_once __DIR__ . '/view/detail.php';
    require_once "view/index.php";
  });
  $router->get('/{category}', function ($category) {
    $apiUrl = sprintf(
      '%s/post/getcategory/%s',
      rtrim($_ENV['BACKEND_API'], '/'),
      // urlencode($category),
      urlencode($category)
    );
    $token = $_ENV['WEB_TOKEN'];

    // gọi cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Accept: application/json',
      "X-API-KEY: {$token}",
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    // echo $response;
    $data = json_decode($response, true);
    if ($data['status']) {
      $result = $data['data'];
      // echo $result;
      // var_dump($result);
      $data2 = $result['data'];
      if (count($data) == 0) {
      } else {
        $description = $data2[0]['description'];
        $title = $data2[0]['title'] . " - SuperBee Gaming Store – Cập Nhật Tin Tức Mới Nhất";
      }
    }
    // if (!empty($data['status']) && $data['status']) {
    //     $post = $data['data'];
    //     // SEO title / description động
    //     $title       = $post['title'] . ' | SuperBee Gaming Store';
    //     // lấy đoạn mô tả ngắn (excerpt hoặc cắt 160 ký tự)
    //     $description = isset($post['excerpt'])
    //         ? $post['excerpt']
    //         : mb_substr(strip_tags($post['content']), 0, 160, 'UTF-8') . '…';
    // } else {
    //     // fallback nếu lỗi hoặc không tìm thấy
    //     $title       = 'Không tìm thấy bài viết | SuperBee';
    //     $description = 'Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.';
    //     $post        = null;
    // }

    // Hiển thị view chi tiết
    // require_once __DIR__ . '/view/detail.php';
    require_once "view/index.php";
  });
});

$router->get("/sitemap.xml", function () {
  $apiUrl = $_ENV['BACKEND_API'] . "/sitemap.xml";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  echo $response;
  // $data = json_decode($response, true);
  // if ($data['status']) {
  //   $result = $data['data'];
  //   $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
  //   $description = $result['category']['description'];
  // }
  // require_once "view/index.php";
});
$router->get("/trang-khac.xml", function () {
  $apiUrl = $_ENV['BACKEND_API'] . "/trang-khac.xml";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  echo $response;
  // $data = json_decode($response, true);
  // if ($data['status']) {
  //   $result = $data['data'];
  //   $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
  //   $description = $result['category']['description'];
  // }
  // require_once "view/index.php";
});
$router->get("/tin-tuc.xml", function () {
  $apiUrl = $_ENV['BACKEND_API'] . "/tin-tuc.xml";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  echo $response;
  // $data = json_decode($response, true);
  // if ($data['status']) {
  //   $result = $data['data'];
  //   $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
  //   $description = $result['category']['description'];
  // }
  // require_once "view/index.php";
});
$router->get("/danh-muc.xml", function () {
  $apiUrl = $_ENV['BACKEND_API'] . "/danh-muc.xml";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  echo $response;
  // $data = json_decode($response, true);
  // if ($data['status']) {
  //   $result = $data['data'];
  //   $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
  //   $description = $result['category']['description'];
  // }
  // require_once "view/index.php";
});
$router->get("/san-pham.xml", function () {
  $apiUrl = $_ENV['BACKEND_API'] . "/san-pham.xml";
  $token = $_ENV['WEB_TOKEN'];
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $apiUrl);            // URL cần request
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);    // Trả về kết quả dưới dạng string
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);             // timeout (giây)
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    "X-API-KEY: {$token}",
  ]);
  $response = curl_exec($ch);
  $err      = curl_errno($ch) ? curl_error($ch) : null;
  curl_close($ch);
  echo $response;
  // $data = json_decode($response, true);
  // if ($data['status']) {
  //   $result = $data['data'];
  //   $title = $result['category']['name'] . " - Mua ngay tại SuperBee";
  //   $description = $result['category']['description'];
  // }
  // require_once "view/index.php";
});
$router->get("/robots.txt", function(){
  echo 'User-agent: *
# Chặn truy cập các trang không cần index
Disallow: /admin/
Disallow: /partner/
Disallow: /reseller/
Disallow: /vendor/
Disallow: /api/
Disallow: /
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml';
});
$router->set404(function () {
  // Gửi header 404
  http_response_code(404);

  // SEO cho trang 404
  $title       = '404 – Trang không tồn tại | SuperBee Gaming Store';
  $description = 'Rất tiếc, trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Quay về Trang chủ để tiếp tục khám phá tài khoản game tại SuperBee.';

  // Hiển thị view 404
  require_once "view/index.php";
  // require_once __DIR__ . '/view/404.php';
});
$router->run();
