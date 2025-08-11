<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\ProductResource;

class ProductAdminController extends Controller
{
    public function index()
    {
        return Product::with('stocks', "category")->select('id', 'category_id', 'name', 'brand', 'description', 'details', 'price', 'photo')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required',
            'name' => 'required',
            'brand' => 'required',
            'description' => 'required',
            'details' => 'required',
            'photo' => 'required|photo',
            'price' => 'required',
            'size' => 'required',
            'color' => 'required',
            'quantity' => 'required',
        ]);

        try {
            $imageName = Str::random(10) . '.' . $request->photo->getClientOriginalExtension();
            Storage::disk('public')->putFileAs('product/photo', $request->photo, $imageName);

            $product = Product::create($request->except(['size', 'color', 'quantity']) + ['photo' => $imageName]);

            Stock::create([
                'product_id' => $product->id,
                'size' => $request->size,
                'color' => $request->color,
                'quantity' => $request->quantity
            ]);

            return response()->json([
                'message' => 'Product Created Successfully!!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Product creation failed!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Product $product)
    {
        return response()->json([
            'product' => $product->load('stocks')
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->only(['category_id', 'brand', 'name', 'description', 'details', 'price']);
        // Handle photo upload
        if ($request->hasFile('photo')) {
            try {
                $photo = $request->file('photo');
                $name = time() . '.' . $photo->getClientOriginalName();
                $photo->move('img', $name);


                if ($product->photo && file_exists(public_path('img/' . $product->photo))) {
                    unlink(public_path('img/' . $product->photo));
                }

                $data['photo'] = $name;
            } catch (\Exception $e) {
                \Log::error('Error uploading photo:', ['error' => $e->getMessage()]);
                return response()->json(['message' => 'Error uploading photo'], 500);
            }
        }

        try {
            $product->update($data);


            $updatedProduct = Product::with("category", "stocks")->findOrFail($id);


            $stock = $updatedProduct->stocks()->first(); // Assuming only one stock per product
            $stock->update([
                'size' => $request->size,
                'color' => $request->color,
                'quantity' => $request->quantity,
            ]);

            return response()->json(['product' => $updatedProduct, 'message' => 'Product updated successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Error updating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Internal Server Error'], 500);
        }


        return response()->json(['message' => 'Unauthorized'], 401);
    }


    public function destroy(Product $product)
    {
        try {
            if ($product->photo) {
                $exists = Storage::disk('public')->exists("img/{$product->photo}");
                if ($exists) {
                    Storage::disk('public')->delete("img/{$product->photo}");
                }
            }

            Stock::where('product_id', $product->id)->delete();
            $product->delete();

            return response()->json([
                'message' => 'Product deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Product deletion failed!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
