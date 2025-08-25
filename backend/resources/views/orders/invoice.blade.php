<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hóa đơn #{{ $new_order->order_code }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 14px; margin: 0; padding: 0; }

        /* Định nghĩa header & footer */
        @page {
            margin: 100px 25px 80px 25px; /* top, right, bottom, left */
        }

        header {
            position: fixed;
            top: -80px;
            left: 0;
            right: 0;
            height: 80px;
            text-align: center;
            line-height: 20px;
            border-bottom: 1px solid #ccc;
        }

        footer {
            position: fixed;
            bottom: -60px;
            left: 0;
            right: 0;
            height: 50px;
            text-align: center;
            line-height: 20px;
            border-top: 1px solid #ccc;
            font-size: 12px;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        h1 { text-align: center; }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <h2>Cửa hàng {{$web_info->shop_name}}</h2>
        <p>Website: {{env('FRONTEND_URL')}} | Hotline: {{$web_info->phone_number}}</p>
    </header>

    <!-- Footer -->
    <footer>
        <p>Cảm ơn quý khách đã mua hàng tại {{$web_info->shop_name}}</p>
        <p>Trang <span class="page"></span></p>
    </footer>

    <!-- Nội dung chính -->
    <main>
        <h1>HÓA ĐƠN #{{ $new_order->order_code }}</h1>
        <p><strong>Khách hàng:</strong> {{ $new_order->user->username }}</p>
        <p><strong>Ngày:</strong> {{ now()->format('d/m/Y') }}</p>

        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>SKU</th>
                    <th>Giá</th>
                    {{-- <th>Trạng thái</th> --}}
                    <th>Tài khoản</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($new_order->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>#{{ $item->product->sku }}</td>
                        <td>{{ number_format($item->unit_price, 0, ',', '.') }} ₫</td>
                        {{-- <td>{{ $item->status }}</td> --}}
                        <td>{{ $item->product->credentials[0]->username }} | {{ $item->product->credentials[0]->password }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </main>
</body>
</html>
