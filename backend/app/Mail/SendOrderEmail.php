<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class SendOrderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
        Log::info('Khởi tạo SendOrderEmail', [
            'order_id' => $order->id
        ]);
    }

    public function build()
    {
        try {
            Log::info('Bắt đầu xây dựng email xác nhận đơn hàng', [
                'order_id' => $this->order->id
            ]);

            $email = $this->markdown('emails.send-order-email')
                ->subject('THẾ GIỚI XE ĐẠP Cảm ơn bạn đã đặt - Đơn hàng #' . $this->order->id)
                ->with([
                    'order' => $this->order,
                ]);

            Log::info('Xây dựng email xác nhận đơn hàng thành công', [
                'order_id' => $this->order->id
            ]);

            return $email;
        } catch (\Exception $e) {
            Log::error('Lỗi khi xây dựng email xác nhận đơn hàng', [
                'order_id' => $this->order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Ném lại ngoại lệ để xử lý ở cấp cao hơn
        }
    }
}
