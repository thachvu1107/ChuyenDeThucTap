<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use Notifiable;
    protected $fillable = [
        'name',
        'email',
        'password',
        'address_id',

    ];
    protected $hidden = [
        'password',
        'remember_token',
    ];
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return [];
    }
    public function products()
    {
        return $this->hasMany('App\Models\Product');
    }
    public function cartItems()
    {
        return $this->hasMany('App\Models\ShoppingCart');
    }
    public function wishlistProducts()
    {
        return $this->hasMany('App\Models\Wishlist');
    }
    public function addresses()
    {
        return $this->hasMany('App\Models\Address');
    }
}
