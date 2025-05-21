<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Email từ Anh Hải</title>
</head>

<body>
    <h2>Xin chào, {{ $data['name'] }}!</h2>
    <p>{{ $data['message'] }}</p>

    {{-- Hiển thị API key --}}
    @if(!empty($data['apiKey']))
    <p>API Key của bạn: <strong>{{ $data['apiKey'] }}</strong></p>
    @endif

    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
</body>

</html>