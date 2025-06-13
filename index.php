<?php

// đây là tài liệu đẩy thẻ mẫu theo phương thức POST ace nhé! | DOITHE1S CHẤP NHẬN CẢ GET VÀ POST KHI GỬI THẺ
//nếu có lỗi vui lòng liên hệ tele @doithe1s
        if (isset($_POST['submit'])) {
        if (empty($_POST['telco']) || empty($_POST['amount']) || empty($_POST['serial']) || empty($_POST['code'])) 
        {
        echo ('Bạn cần nhập đầy đủ thông tin');
        } else {
            
        $partner_id = '58373898386'; // TẠO Ở DOITHE1S
        $partner_key = '3b7108c709c078131879100a9b59e7df';  // TẠO Ở DOITHE1S
        $dataPost = array();
        $dataPost['request_id'] = rand(100000000, 999999999); //Mã đơn hàng của bạn
        $dataPost['code'] = $_POST['code'];
        $dataPost['partner_id'] = $partner_id;
        $dataPost['serial'] = $_POST['serial'];
        $dataPost['telco'] = $_POST['telco'];
        $dataPost['amount'] = $_POST['amount'];
        $dataPost['command'] = 'charging';  // NẠP THẺ
        $dataPost['sign'] = md5($partner_key.$_POST['code'].$_POST['serial']); //mã hóa chữ ký :md5(partner_key + code + serial)
        $data = http_build_query($dataPost);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://doithe1s.vn/chargingws/v2');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        $actual_link = (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
        curl_setopt($ch, CURLOPT_REFERER, $actual_link);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        $obj = json_decode($result);
        if ($obj->status == 99) {
            //Gửi thẻ thành công, đợi duyệt.
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        } elseif ($obj->status == 1) {
            //Thẻ đúng
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        } elseif ($obj->status == 2) {
            //Thẻ đúng nhưng sai mệnh giá
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        } elseif ($obj->status == 3) {
            //Thẻ lỗi
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        } elseif ($obj->status == 4) {
            //Bảo trì
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        } else {
            //Lỗi khác
            echo '<pre>';
            print_r($obj);
            echo '</pre>';
        }


    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>DOITHE1S.VN - API</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css"
          integrity="sha384-WskhaSGFgHYWDcbwN70/dfYBj47jz9qbsMId/iRN3ewGhXQFZCSftd1LZCfmhktB" crossorigin="anonymous">
</head>
<body>
<div class="container">
    <div class="row" style="margin-top: 50px;">
        <div class="col-md-8" style="float:none;margin:0 auto;">
            <form method="POST" action="">
                <div class="form-group">
                    <label>Loại thẻ:</label>
                    <select class="form-control" name="telco">
                        <option value="">Chọn loại thẻ</option>
                        <option value="VIETTEL">Viettel</option>
                        <option value="MOBIFONE">Mobifone</option>
                        <option value="VINAPHONE">Vinaphone</option>
                        <option value="GATE">Gate</option>
                        <option value="ZING">Zing</option>
                        <option value="GARENA">Garena</option>
                        <option value="VCOIN">VCOIN</option>
                        <option value="VNMOBI">VNMOBI</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mệnh giá:</label>
                    <select class="form-control" name="amount">
                        <option value="">Chọn mệnh giá</option>
                        <option value="10000">10.000</option>
                        <option value="20000">20.000</option>
                        <option value="30000">30.000</option>
                        <option value="50000">50.000</option>
                        <option value="100000">100.000</option>
                        <option value="200000">200.000</option>
                        <option value="300000">300.000</option>
                        <option value="500000">500.000</option>
                        <option value="1000000">1.000.000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Số seri:</label>
                    <input type="text" class="form-control" name="serial"/>
                </div>
                <div class="form-group">
                    <label>Mã thẻ:</label>
                    <input type="text" class="form-control" name="code"/>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-success btn-block" name="submit">NẠP NGAY</button>
                </div>
            </form>
        </div>
    </div>
</div>
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"
        integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
        crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"
        integrity="sha384-smHYKdLADwkXOn1EmN1qk/HfnUcbVRZyYmZ4qpPea6sjB/pTJ0euyQp0Mk8ck+5T"
        crossorigin="anonymous"></script>
</body>
</html>