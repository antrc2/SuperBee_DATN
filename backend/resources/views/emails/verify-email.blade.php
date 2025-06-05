@component('mail::message')
# Xin chào {{ $username }},

Cảm ơn bạn đã đăng ký tài khoản tại {{ config('app.name') }}.

Để kích hoạt tài khoản của bạn, vui lòng nhấp vào nút bên dưới:

@component('mail::button', ['url' => $verificationUrl])
Kích hoạt tài khoản
@endcomponent

Liên kết này sẽ hết hạn sau {{ env('EMAIL_VERIFICATION_TTL', 3600)/60 }} phút.

Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ {{ config('app.name') }}
@endcomponent