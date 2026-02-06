<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Response;

class LogController extends Controller
{
    public function mailFailures(Request $request)
    {
        if (! Gate::allows('access-pages')) {
            return Response::json(['error' => 'unauthorized'], 403);
        }

        $path = storage_path('logs/mail-failures.log');
        if (! file_exists($path)) {
            return Response::json(['lines' => []]);
        }

        $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $last = array_slice($lines, -200);

        return Response::json(['lines' => array_values($last)]);
    }
}
