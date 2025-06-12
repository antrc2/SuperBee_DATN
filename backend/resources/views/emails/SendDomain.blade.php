<!DOCTYPE html>
<html>

<head>
    <title>{{ $data['subject'] }}</title>
</head>

<body>
    <p>{{ $data['greeting'] }}</p>
    <p>{!! nl2br(e($data['message'])) !!}</p> {{-- Use {!! !!} for HTML content if needed, and nl2br/e for line breaks/escaping --}}
    <p>{{ $data['closing'] }}</p>
    <p>{{ $data['app_name'] }}</p>

</html>
{{-- Hiển thị API key --}}
@if(!empty($data['apiKey']))
<p>API Key của bạn: <strong>{{ $data['apiKey'] }}</strong></p>
@endif
<p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
</body>

</html>