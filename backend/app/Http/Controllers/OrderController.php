<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

namespace App\Http\Controllers;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Models\Order;

use Illuminate\Support\Facades\Log;
use App\Mail\SendOrderEmail;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    // Phương thức để tạo đơn hàng mới

    public function store(Request $request)
    {
        try {
            Log::info('Bắt đầu tạo đơn hàng mới', [
                'user_id' => $request->user_id,
                'amount' => $request->amount,
                'method' => $request->method,
                'order_items' => $request->order_items
            ]);

            $order = Order::create([
                'user_id' => $request->user_id,
                'amount' => $request->amount,
                'method' => $request->method,
                'status' => 'pending',
            ]);

            foreach ($request->order_items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'name'       => $item['name'],
                    'size'       => $item['size'],
                    'color'      => $item['color'],
                    'image'      => $item['image'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
            try {
                $user = $order->user;
                Log::info('Chuẩn bị gửi email xác nhận đơn hàng', [
                    'order_id' => $order->id,
                    'user_email' => $user->email
                ]);

                Mail::to($user->email)->send(new SendOrderEmail($order));
                Log::info('Gửi email xác nhận đơn hàng thành công', [
                    'order_id' => $order->id,
                    'user_email' => $user->email
                ]);
            } catch (\Exception $e) {
                Log::error('Lỗi gửi email xác nhận đơn hàng: ' . $e->getMessage());
            }


            return response()->json(['message' => 'Order created successfully!', 'data' => $order], 201);
        } catch (\Exception $e) {
            // Ghi log lỗi chi tiết
            Log::error('Lỗi tạo đơn hàng: ' . $e->getMessage());
            Log::error($e->getTraceAsString());



            return response()->json(['error' => 'Đã xảy ra lỗi khi tạo đơn hàng.'], 500);
        }
    }




    public function statisticsAdmin()
    {
        $orders = Order::with('orderItems.product')->get();

        $stats = [];

        foreach ($orders as $order) {
            foreach ($order->orderItems as $item) {
                $name = $item->product->name;
                $qty = $item->quantity;
                $price = $item->price;

                if (!isset($stats[$name])) {
                    $stats[$name] = [
                        'product' => $name,
                        'quantity' => 0,
                        'revenue' => 0,
                    ];
                }

                $stats[$name]['quantity'] += $qty;
                $stats[$name]['revenue'] += $qty * $price;
            }
        }

        return response()->json(array_values($stats));
    }





    // Phương thức để lấy thông tin đơn hàng theo ID
    public function show($id)
    {
        $order = Order::with('orderItems.product')->find($id); // Gọi chi tiết đơn hàng cùng với sản phẩm

        if (!$order) {
            return response()->json(['message' => 'Order not found!'], 404);
        }

        return response()->json($order, 200);
    }

    // Phương thức để hủy đơn hàng
    public function cancel($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found!'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order cannot be cancelled!'], 400);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json(['message' => 'Order cancelled successfully!'], 200);
    }
    public function storeOrderItems(Request $request)
    {
        // Kiểm tra xem trường 'order_items' có tồn tại hay không
        if (!$request->has('order_items')) {
            return response()->json(['message' => 'The order items field is required.'], 400);
        }

        // Xác thực dữ liệu đầu vào
        $validatedData = $request->validate([
            'order_items' => 'required|array',
            'order_items.*.order_id' => 'required|integer|exists:orders,id',
            'order_items.*.product_id' => 'required|integer|exists:products,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.price' => 'required|numeric|min:0',
        ]);

        // Lưu order items vào database
        OrderItem::insert($validatedData['order_items']);

        return response()->json(['message' => 'Order items created successfully'], 201);
    }
    public function checkout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'user_id' => 'required|exists:users,id', // Kiểm tra user_id có tồn tại trong bảng users không
        ]);
    }


    public function getPaymentHistory()
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $paymentHistory = Order::with('orderItems.product')
                ->where('user_id', auth()->id())
                ->get();

            return response()->json($paymentHistory, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Có lỗi xảy ra. Vui lòng thử lại sau!'], 500);
        }
    }


    // Phương thức để lấy tất cả đơn hàng của người dùng
    public function index(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $orders = Order::with('orderItems.product')
            ->where('user_id', $validatedData['user_id'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($orders, 200);
    }
    // Phương thức để admin lấy tất cả đơn hàng
    public function indexAdmin()
    {
        // Lấy tất cả đơn hàng với thông tin người dùng và orderItems, sắp xếp theo id mới nhất
        $orders = Order::with(['user', 'orderItems.product'])->orderBy('id', 'desc')->get();

        return response()->json($orders, 200);
    }
    // Phương thức để xem chi tiết đơn hàng

    public function updateStatus(Request $request, $id)
    {
        // Validate dữ liệu
        $validatedData = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);

        // Tìm đơn hàng
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        // Cập nhật trạng thái
        $order->status = $validatedData['status'];
        $order->save();

        return response()->json(['message' => 'Order status updated successfully', 'order' => $order], 200);
    }
}
