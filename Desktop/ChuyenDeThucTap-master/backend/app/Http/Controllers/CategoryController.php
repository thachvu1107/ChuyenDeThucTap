<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Review;

use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return Category::all();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function new($id)
    {
        $products = Product::with('category')->where('category_id', $id)->orderBy('id', 'desc')->paginate(24);

        foreach ($products as $product) {
            if ($product->reviews()->exists()) {
                $product['review'] = $product->reviews()->avg('rating');
            }
        }
        return $products;
    }


    public function topSelling($id)
    {
        $products = Product::with('category')->where('category_id', $id)->take(6)->get();

        foreach ($products as $product) {
            // Tính điểm đánh giá trung bình nếu có review
            if ($product->reviews()->exists()) {
                $product['review'] = $product->reviews()->avg('rating');
            } else {
                $product['review'] = null;
            }

            // Tính tổng số lượng bán dựa trên order_items
            // Đếm tổng quantity trong bảng order_items với product_id tương ứng
            $num_orders = \App\Models\OrderItem::where('product_id', $product->id)->sum('quantity');

            $product['num_orders'] = $num_orders;
        }

        // Sắp xếp giảm dần theo số lượng đã bán
        return $products->sortByDesc('num_orders')->values()->all();
    }




    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Create a new category using the validated data
        $category = Category::create([
            'name' => $validatedData['name'],
        ]);

        // Return a response indicating success
        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }


    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validateData = $request->validate(['name' => 'required|string|max:255']);
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->update($validateData);
        return response()->json(['message' => 'Category updated successfully'], 200);
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully'], 200);
    }
}
