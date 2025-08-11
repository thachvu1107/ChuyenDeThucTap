<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProduct;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        // return Product::with("category", "stocks")->paginate(5);
        return Product::with("category", "stocks")->get();
        // return Product::with("category", "stocks")->paginate(12);
    }

    public function show($id)
    {
        $product = Product::with("category", "stocks")->findOrFail($id);
        if ($product->reviews()->exists()) {
            $product['review'] = $product->reviews()->avg('rating');
            $product['num_reviews'] = $product->reviews()->count();
        }
        return $product;
    }


    public function store(StoreProduct $request)
    {
        if ($user = JWTAuth::parseToken()->authenticate()) {
            $validator = $request->validated();

            // Kiểm tra xem có ảnh không
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $name = time() . '.' . $photo->getClientOriginalName();
                $photo->move('img', $name);
            } else {
                $name = null;
            }

            try {
                // Tạo sản phẩm mới
                $product = Product::create([
                    'user_id' => $user->id,
                    'category_id' => $request->category_id,
                    'photo' => $name,
                    'brand' => $request->brand,
                    'name' => $request->name,
                    'description' => $request->description,
                    'details' => $request->details,
                    'price' => $request->price,
                ]);

                // Tạo thông tin kho
                Stock::create([
                    'product_id' => $product->id,
                    'size' => $request->size,
                    'color' => $request->color,
                    'quantity' => $request->quantity,
                ]);

                return response()->json(['product' => $product, 'message' => 'Product created successfully'], 201);
            } catch (\Exception $e) {
                // \Log::error('Error creating product:', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Internal Server Error'], 500);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    public function destroy($id)
    {

        if ($user = JWTAuth::parseToken()->authenticate()) {
            $product = Product::findOrFail($id);

            // return $product->photo;
            if ($product) {
                if ($product->photo != null)
                    foreach (json_decode($product->photo) as $photo)
                        unlink(public_path() . '\\img\\' . $photo);

                $product->delete();
            }
        }
    }

    public function search(Request $request)
    {
        $searchTerm = $request->input('searchTerm');

        if (!empty($searchTerm)) {
            $product = Product::with("category", "stocks")
                ->where('name', 'like', '%' . $searchTerm . '%')
                ->paginate(12);
            return $product;
        } else {
            return response()->json(['message' => 'Search term is required.'], 400);
        }
    }

    public function searchChatBox(Request $request)
    {
        $searchTerm = $request->input('searchTerm');

        // Normalize: Nếu searchTerm là chuỗi 'null', thì gán về null
        if ($searchTerm === 'null' || $searchTerm === null || trim($searchTerm) === '') {
            $searchTerm = null;
        }

        $query = Product::with('category', 'stocks');

        if ($searchTerm !== null) {
            $query->where('name', 'like', '%' . $searchTerm . '%');
            $products = $query->paginate(12); // Có từ khóa tìm kiếm
        } else {
            $products = $query->paginate(12); // Không có tìm kiếm
        }

        return response()->json($products);
    }
}
