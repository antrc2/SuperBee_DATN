<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <title>Gửi Email Xác Thực</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }

        .container {
            max-width: 400px;
            margin: auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 20px;
        }

        button {
            background-color: #28a745;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        button:hover {
            background-color: #218838;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Xác thực tài khoản</h2>

        @if(!empty($data['url']))
        <form method="POST" action={{ $data['url'] }}>
            <button type="submit">xác thực</button>
            <input type="hidden" name="email" value="{{ $data['email'] }}" id="">
        </form>
        @endif
    </div>
</body>

</html>