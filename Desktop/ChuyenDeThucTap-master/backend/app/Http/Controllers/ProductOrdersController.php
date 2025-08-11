<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Stock;
use App\Models\Order;
use App\Mail\OrderConfirmation;
use Illuminate\Support\Facades\Mail;

class ProductOrdersController extends Controller
{
    public function store(Request $request)
    {
        Log::info('Request received at /product/orders: ', $request->all());

        $request->validate([
            'items' => 'required|array',
            'items.*.stock_id' => 'required|exists:stocks,id',
            'items.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string',
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        $note = $request->note;
        $orderItems = [];
        $total = 0;

        foreach ($request->items as $item) {
            $stock = Stock::findOrFail($item['stock_id']);
            $product = $stock->product;

            $order = Order::create([
                'user_id' => $user->id,
                'stock_id' => $item['stock_id'],
                'quantity' => $item['quantity'],
                'note' => $note,
                'status' => 'pending'
            ]);

            $orderItems[] = [
                'name' => $product->name,
                'quantity' => $item['quantity'],
                'size' => $stock->size,
                'color' => $stock->color,
                'price' => $product->price * $item['quantity'],
            ];

            $total += $product->price * $item['quantity'];

            $stock->decrement('quantity', $item['quantity']);
            $user->cartItems()->where('stock_id', $item['stock_id'])->delete();
        }

        $orderDetails = [
            'order_items' => $orderItems,
            'note' => $note,
            'total' => $total,
        ];

        try {
            if ($user->email) {
                Mail::to($user->email)->send(new OrderConfirmation((object) $orderDetails));
            } else {
                Log::warning('Không tìm thấy email người dùng cho user ID: ' . $user->id);
            }
        } catch (\Exception $e) {
            Log::error('Lỗi gửi email xác nhận đơn hàng: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Order processed successfully'], 201);
    }
}
