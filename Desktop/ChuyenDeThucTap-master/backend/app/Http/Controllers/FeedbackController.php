<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function show()
    {
        // $feedback = Feedback::orderBy('created_at', 'desc')->get();
        $feedback = Feedback::all();
        return response()->json($feedback);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'message' => 'required|string',
        ]);

        Feedback::create($request->all());

        return response()->json(['message' => 'Feedback submitted successfully']);
    }
}
