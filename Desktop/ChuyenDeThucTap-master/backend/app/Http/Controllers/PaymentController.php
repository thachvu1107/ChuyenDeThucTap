<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function online_checkout(Request $request)
    {
        // Validate incoming request
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:1000', // Minimum amount in VND
            'orderId' => 'required|string|max:34',
            'returnUrl' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'code' => '99',
                'message' => 'Invalid input',
                'errors' => $validator->errors(),
            ], 400);
        }

        $vnp_Url = env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        $vnp_TmnCode = env('VNPAY_TMN_CODE');
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $vnp_Returnurl = $request->input('returnUrl');
        $vnp_TxnRef = $request->input('orderId'); // Use orderId from frontend
        $vnp_OrderInfo = "Thanh toan don hang {$vnp_TxnRef}";
        $vnp_OrderType = "billpayment";
        $vnp_Amount = $request->input('amount') * 100; // Convert to VNPay format (VND * 100)
        $vnp_Locale = "vn";
        $vnp_BankCode = "NCB";
        $vnp_IpAddr = $request->ip();
        $vnp_CreateDate = date('YmdHis');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $vnp_CreateDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        if ($vnp_BankCode) {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

        ksort($inputData);
        $query = "";
        $hashdata = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            $hashdata .= ($i == 0 ? '' : '&') . urlencode($key) . "=" . urlencode($value);
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
            $i = 1;
        }
        $query = rtrim($query, '&'); // Remove trailing '&'

        $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
        $vnp_Url .= '?' . $query . '&vnp_SecureHash=' . $vnpSecureHash;

        return response()->json([
            'code' => '00',
            'message' => 'success',
            'data' => $vnp_Url,
        ]);
    }

    public function vnpay_return(Request $request)
    {
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $vnp_SecureHash = $request->query('vnp_SecureHash');

        $inputData = $request->query(); // dùng query() cho GET

        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = http_build_query($inputData, '', '&', PHP_QUERY_RFC3986);
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash === $vnp_SecureHash) {
            if ($request->query('vnp_ResponseCode') === '00') {
                // Đơn hàng thanh toán thành công
                return response()->json(['RspCode' => '00', 'Message' => 'Payment confirmed']);
            } else {
                // Thanh toán thất bại từ phía VNPay
                return response()->json(['RspCode' => '01', 'Message' => 'Payment failed']);
            }
        } else {
            // Chữ ký không hợp lệ
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
        }
    }
}
