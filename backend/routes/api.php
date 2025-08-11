<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductAdminController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Dashboard
Route::get('/dashboard', 'App\Http\Controllers\DashboardController@index');

// JWT Authentication
Route::get('/auth', 'App\Http\Controllers\UserController@getAuthenticatedUser');
Route::post('/register', 'App\Http\Controllers\UserController@register');
Route::post('/login', 'App\Http\Controllers\UserController@login');

// Address


Route::get('/user/default-address/{userId}', 'App\Http\Controllers\UserAddressController@show');
Route::post('/user/create-user-address', 'App\Http\Controllers\UserAddressController@createUser');
Route::post('/user/address', 'App\Http\Controllers\UserAddressController@store');
Route::post('/user/change-password', 'App\Http\Controllers\UserAddressController@changePassword');
Route::post('/user/change-name', 'App\Http\Controllers\UserAddressController@changeName');
Route::put('/user/address/{id}', 'App\Http\Controllers\UserAddressController@updateAddress'); // New route

//Admin User
Route::get('/admin/users-with-order-total', 'App\Http\Controllers\UserAddressController@getAllUsersWithOrderTotal');
Route::post('/admin/create-user', 'App\Http\Controllers\UserAddressController@createUserByAdmin');
Route::get('/admin/users-newest', 'App\Http\Controllers\UserAddressController@getUsersByNewest');
Route::get('/admin/user/{userId}', 'App\Http\Controllers\UserAddressController@getUserDetails');

// Product
Route::get('/products', 'App\Http\Controllers\ProductController@index');
Route::get('/products/{id}', 'App\Http\Controllers\ProductController@show');
Route::get('/product/hot-deal', 'App\Http\Controllers\ProductDealsController@hotDeals');
Route::post('/products', 'App\Http\Controllers\ProductController@store');
Route::delete('/products/{id}', 'App\Http\Controllers\ProductController@destroy');
// Tim kiem
Route::get('/search', 'App\Http\Controllers\ProductController@search');
Route::post('/search/chatbox', 'App\Http\Controllers\ProductController@searchChatBox');


// Product Orders
Route::post('/stripe', 'App\Http\Controllers\ProductOrdersController@stripePost');
// Route::post('/product/orders', 'App\Http\Controllers\ProductOrdersController@store');
Route::post('/product/orders', 'App\Http\Controllers\ProductOrdersController@store')->middleware('auth:api');

// Product Categories
Route::get('/product/categories', 'App\Http\Controllers\CategoryController@index');
Route::get('/product/categories/{id}/top-selling', 'App\Http\Controllers\CategoryController@topSelling');
Route::get('/product/categories/{id}/new', 'App\Http\Controllers\CategoryController@new');
Route::post('/product/categories', 'App\Http\Controllers\CategoryController@store');
Route::post('/product/categories/{id}', 'App\Http\Controllers\CategoryController@update');
Route::delete('/product/categories/{id}', 'App\Http\Controllers\CategoryController@destroy');


// Product Shopping Cart
Route::get('/product/cart-list/count', 'App\Http\Controllers\ProductShoppingCartController@cartCount');
Route::get('/product/cart-list/', 'App\Http\Controllers\ProductShoppingCartController@index');
Route::post('/product/cart-list', 'App\Http\Controllers\ProductShoppingCartController@store');
Route::post('/product/cart-list/guest', 'App\Http\Controllers\ProductShoppingCartController@guestCart');
Route::put('/product/cart-list/{id}', 'App\Http\Controllers\ProductShoppingCartController@update');
Route::delete('/product/cart-list/{id}', 'App\Http\Controllers\ProductShoppingCartController@destroy');
Route::delete('/cart/clear', 'App\Http\Controllers\ProductShoppingCartController@clearCart');


// Product Wishlist
Route::get('/product/wishlist/count', 'App\Http\Controllers\ProductWishlistController@count');
Route::get('/product/wishlist', 'App\Http\Controllers\ProductWishlistController@index');
Route::post('/product/wishlist', 'App\Http\Controllers\ProductWishlistController@store');
Route::delete('/product/wishlist/{id}', 'App\Http\Controllers\ProductWishlistController@destroy');

// Product Stocks
Route::get('/product/stocks/{id}', 'App\Http\Controllers\StockController@show');

// Newsletter
Route::post('/newsletter', 'App\Http\Controllers\NewsLetterController@store');
// Route::get('/newsletter/send', 'App\Http\Controllers\NewsLetterController@send');
Route::post('/subscribe', 'App\Http\Controllers\NewsLetterController@subscribe');
Route::post('/unsubscribe', 'App\Http\Controllers\NewsLetterController@unsubscribe');


// Product Admin delete, update
Route::resource('product', ProductAdminController::class);

Route::post('/vnpay', 'App\Http\Controllers\PaymentController@online_checkout');
Route::get('/vnpay-return', 'App\Http\Controllers\PaymentController@vnpay_return');


// Feedback
Route::get('/feedback', 'App\Http\Controllers\FeedbackController@show');
Route::post('/feedback', 'App\Http\Controllers\FeedbackController@store');

// Revieww
Route::get('/reviews', 'App\Http\Controllers\ReviewController@index');

Route::get('/reviews/{product_id}', 'App\Http\Controllers\ReviewController@show');
Route::post('/reviews', 'App\Http\Controllers\ReviewController@store');


//Ordẻr
Route::post('/checkout', [OrderController::class, 'store']);
Route::post('/order', [OrderController::class, 'store']);  // Tạo đơn hàng mới
Route::get('/order/{id}', [OrderController::class, 'show']);  // Lấy thông tin đơn hàng theo ID
Route::post('/order/{id}/cancel', [OrderController::class, 'cancel']);  // Hủy đơn hàng theo ID
Route::post('/order_items', [OrderController::class, 'storeOrderItems']);
Route::get('/orders', [OrderController::class, 'index']); // User-specific orders
Route::get('/admin/orders', [OrderController::class, 'indexAdmin']); // All orders for admin
Route::put('/order/{id}/status', [OrderController::class, 'updateStatus']);



// routes/api.php
Route::get('/admin/statistics', [OrderController::class, 'statisticsAdmin']);
