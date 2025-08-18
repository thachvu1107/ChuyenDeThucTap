<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request) {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('captures', 'public');
            return response()->json([
                'success' => true,
                'path' => asset('storage/' . $path)
            ]);
        }
        return response()->json(['success' => false], 400);
    }
}
