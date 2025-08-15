<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hóa đơn #{{ $order->order_code }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        h1 { text-align: center; }
    </style>
</head>
<body>
    <h1>HÓA ĐƠN #{{ $order->code }}</h1>
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
            @foreach ($order->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->sku }}</td>
                    <td>{{ number_format($item->price, 0, ',', '.') }} ₫</td>
                    {{-- <td>{{ $item->status }}</td> --}}
                    <td>{{ $item->credentials->username }} / {{ $item->credentials->password }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
