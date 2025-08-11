<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\OrderItem;

class Order extends Model
{
    protected $fillable = ['user_id', 'note', 'status', "method"];
    public function user()
    {
        return $this->belongsTo('App\Models\User');
    }

    public function stock()
    {
        return $this->belongsTo('App\Models\Stock');
    }

    public function product()
    {
        return $this->hasOneThrough('App\Models\Product', 'App\Models\Stock');
    }
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
