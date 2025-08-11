<?php

namespace App\Http\Controllers;



use Illuminate\Http\Request;
use Spatie\Newsletter\NewsletterFacade as Newsletter;

class NewsLetterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        if (!Newsletter::isSubscribed($email)) {
            Newsletter::subscribe($email);
            return response()->json('Thanks for subscribing!');
        }

        return response()->json('You are already subscribed.');
    }

    public function unsubscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = $request->input('email');

        if (Newsletter::isSubscribed($email)) {
            Newsletter::unsubscribe($email);
            return response()->json('You have been unsubscribed.');
        }

        return response()->json('You are not subscribed.');
    }
}
