<?php

namespace App\Http\Controllers;
use App\Models\Visitor; 
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    // Ghi log truy cập
    public function track(Request $request)
    {
        Visitor::create([
            'ip' => $request->ip(),
            'path' => $request->path,
            'user_agent' => $request->userAgent(),
            'visited_at' => now(),
        ]);
        return response()->json(['status' => 'ok']);
    }

    // Lấy thống kê realtime
    public function stats()
    {
        $now = now();

        return response()->json([
            // Người online trong 5 phút gần nhất
            'online_users' => Visitor::where('visited_at', '>=', $now->subMinutes(5))
                                     ->distinct('ip')
                                     ->count('ip'),

            // Lượt xem hôm nay
            'today_views' => Visitor::whereDate('visited_at', $now->toDateString())->count(),

            // Top trang nhiều view nhất hôm nay
            'top_pages' => Visitor::selectRaw('path, count(*) as views')
                                  ->whereDate('visited_at', $now->toDateString())
                                  ->groupBy('path')
                                  ->orderByDesc('views')
                                  ->limit(5)
                                  ->get(),
        ]);
    }
}
