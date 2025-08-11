<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Xác Nhận Đơn Hàng - {{ config('app.name') }}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.5;
            color: #1a1a1a;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 640px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: #fef2ee;
            padding: 32px 24px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
        }

        .header img {
            max-width: 120px;
            margin-bottom: 16px;
        }

        .order-info,
        .product-details {
            padding: 24px;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px;
        }

        h2 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 24px 0 16px;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 14px;
        }

        th,
        td {
            padding: 12px;
            text-align: left;
        }

        th {
            background-color: #fef2ee;
            font-weight: 600;
            color: #374151;
        }

        td {
            border-bottom: 1px solid #e5e7eb;
        }

        .price {
            color: #DB4916;
            font-weight: 600;
            text-align: right;
        }

        .bold {
            font-weight: 600;
            color: #1f2937;
        }

        .quantity {
            text-align: center;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #DB4916;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 24px auto;
            text-align: center;
            transition: background-color 0.2s;
        }

        .button:hover {
            background-color: #b73d12;
        }

        .footer {
            text-align: center;
            padding: 24px;
            background-color: #fef2ee;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }

        .footer p {
            margin: 8px 0;
        }

        @media (max-width: 600px) {
            body {
                padding: 12px;
            }

            .container {
                margin: 0;
            }

            .header,
            .order-info,
            .product-details,
            .footer {
                padding: 16px;
            }

            h1 {
                font-size: 20px;
            }

            h2 {
                font-size: 16px;
            }

            table {
                font-size: 13px;
            }

            th,
            td {
                padding: 8px;
            }

            .button {
                display: block;
                padding: 10px;
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Cảm ơn bạn đã đặt hàng!</h1>
            <p style="font-size: 15px; color: #4b5563; margin: 0;">
                Đơn hàng của bạn tại <strong>THẾ GIỚI XE ĐẠP</strong> đã được tiếp nhận. Dưới đây là chi tiết:
            </p>
        </div>

        <div class="order-info">
            <h2>Thông tin đơn hàng</h2>
            <table>
                <tr>
                    <td class="bold">Mã đơn hàng:</td>
                    <td>{{ $order->id }}</td>
                </tr>
                <tr>
                    <td class="bold">Tổng tiền:</td>
                    <td class="price">
                        {{ number_format($order->orderItems->sum('price'), 0, ',', '.') }}
                        VNĐ
                    </td>
                </tr>
                <tr>
                    <td class="bold">Phương thức thanh toán:</td>
                    <td>{{ ucfirst($order->method) }}</td>
                </tr>
                <tr>
                    <td class="bold">Trạng thái:</td>
                    <td>{{ ucfirst($order->status == 'pending' ? 'Đang chờ xử lý' : $order->status) }}</td>
                </tr>
                <tr>
                    <td class="bold">Ngày đặt hàng:</td>
                    <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                </tr>
            </table>
        </div>

        <div class="product-details">
            <h2>Chi tiết sản phẩm</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th class="quantity">Số lượng</th>
                        <th>Giá</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($order->orderItems as $item)
                        <tr>
                            <td>{{ $item->name ?? 'N/A' }}</td>
                            <td class="quantity">{{ $item->quantity }}</td>
                            <td class="price"> {{ number_format($item->price / $item->quantity, 0, ',', '.') }} VNĐ
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- <a href="{{ url('/orders/' . $order->id) }}" class="button">Xem đơn hàng của bạn</a> --}}

        <div class="footer">
            <p>Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!</p>
            <p>Trân trọng,<br><strong>{{ config('app.name') }}</strong></p>
        </div>
    </div>
</body>

</html>
