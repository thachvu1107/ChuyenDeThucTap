<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Address;
use App\Models\ShoppingCart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UserAddressController extends Controller
{
    public function createUser(Request $request)
    {
        $user = User::create([
            'name' => $request->firstName . ' ' . $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $address = Address::create([
            'user_id' => $user->id,
            'firstname' => $request->firstName,
            'lastname' => $request->lastName,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'zip' => $request->zip,
            'telephone' => $request->telephone
        ]);
        $cartList = json_decode($request->localCartList, true);
        if ($cartList) {
            foreach ($cartList as $cartArrayList) {
                foreach ($cartArrayList as $cartItem) {
                    $item = ShoppingCart::where('user_id', $user->id)
                        ->where('stock_id', $cartItem['stock_id'])
                        ->first();
                    if (!$item) {
                        ShoppingCart::create([
                            'user_id' => $user->id,
                            'stock_id' => $cartItem['stock_id'],
                            'quantity' => $cartItem['quantity']
                        ]);
                    }
                }
            }
        }
        $user->update(['address_id' => $address->id]);
        $token = JWTAuth::fromUser($user);
        return response()->json(compact('user', 'token'), 201);
    }

    public function show($userId = null)
    {
        $user = User::with('addresses')->where('id', $userId)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json(['user' => $user], 200);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $address = Address::create([
            'user_id' => $request->userId,
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'zip' => $request->zip,
            'telephone' => $request->telephone,
        ]);
        $user->update(['address_id' => $address->id]);
        return response()->json(['message' => 'Address created successfully'], 201);
    }



    public function getUsersByNewest(Request $request)
    {
        // Validate admin privileges

        $users = User::with('addresses')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(compact('users'), 200);
    }


    public function getUserDetails(Request $request, $userId)
    {

        $user = User::with('addresses')->findOrFail($userId);
        return response()->json(['user' => $user], 200);
    }


    public function changePassword(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Đổi mật khẩu thành công'], 200);
    }

    public function changeName(Request $request)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update([
            'name' => $request->name,
        ]);

        return response()->json(['message' => 'Đổi tên thành công'], 200);
    }
    public function updateAddress(Request $request, $addressId)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'zip' => 'required|string',
            'telephone' => 'required|string',
        ]);

        $address = Address::where('id', $addressId)->where('user_id', $user->id)->firstOrFail();

        $address->update([
            'firstname' => $request->firstname,
            'lastname' => $request->lastname,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'zip' => $request->zip,
            'telephone' => $request->telephone,
        ]);

        // Optionally update the user's default address_id
        if ($user->address_id == $addressId) {
            $user->update(['address_id' => $addressId]);
        }

        return response()->json(['message' => 'Address updated successfully'], 200);
    }


    public function getAllUsersWithOrderTotal(Request $request)
    {
        $users = User::with('addresses')
            ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
            ->leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
            ->groupBy(
                'users.id',
                'users.name',
                'users.email',
                'users.address_id',
                'users.created_at',
                'users.updated_at'
            )
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.created_at',
                'users.updated_at',
                'users.address_id',
                \DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as total_order_amount')
            )
            ->orderBy('users.created_at', 'desc')
            ->get();

        return response()->json(compact('users'), 200);
    }


    public function createUserByAdmin(Request $request)
    {

        // Validate request data
        $validated = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'zip' => 'required|string',
            'telephone' => 'required|string',
        ]);

        // Create user
        $user = User::create([
            'name' => $request->firstName . ' ' . $request->lastName,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'is_admin' => $request->is_admin ?? false, // Optional: allow admin to set user as admin
        ]);

        // Create address
        $address = Address::create([
            'user_id' => $user->id,
            'firstname' => $request->firstName,
            'lastname' => $request->lastName,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'zip' => $request->zip,
            'telephone' => $request->telephone,
        ]);

        // Update user's address_id
        $user->update(['address_id' => $address->id]);

        // Generate JWT token for the new user
        $token = JWTAuth::fromUser($user);

        return response()->json(compact('user', 'token'), 201);
    }
}
