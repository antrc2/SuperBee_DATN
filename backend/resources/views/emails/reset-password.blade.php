@component('mail::message')
# Xin chào {{ $username }},

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình tại {{ config('app.name') }}.

Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:

@component('mail::button', ['url' => $resetUrl])
Đặt lại mật khẩu
@endcomponent

Liên kết này sẽ hết hạn sau {{ env('PASSWORD_RESET_TTL', 3600)/60 }} phút.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ {{ config('app.name') }}
@endcomponent