<?php

namespace App\Http\Controllers;

use App\Deal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ProductDealsController extends Controller
{
    public function hotDeals()
    {
        $now = Carbon::now();
        $endDate = $now->addDays(5);

        $hotDeal = Deal::where('starts', '<=', $now)
            ->where('ends', '>=', $endDate)
            ->orderBy('sale', 'desc')
            ->first();

        return response()->json([
            'ends' => $endDate,
        ]);
    }
}
