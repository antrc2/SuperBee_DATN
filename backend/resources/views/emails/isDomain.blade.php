<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Email từ Laravel 12</title>
</head>

<body>
    <h2>Xin chào, {{ $data['name'] }}!</h2>
    <p>{{ $data['message'] }}</p>

    {{-- Thêm thẻ <a> với link truyền từ controller --}}
    @if(!empty($data['link']))
    <p>
        <a href="{{ $data['link'] }}" target="_blank">
            Nhấn vào đây để xem chi tiết
        </a>
    </p>
    @endif

    {{-- Hiển thị API key --}}
    @if(!empty($data['apiKey']))
    <p>API Key của bạn: <strong>{{ $data['apiKey'] }}</strong></p>
    @endif

    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
</body>

</html>