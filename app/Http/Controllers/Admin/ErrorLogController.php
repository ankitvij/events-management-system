<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ErrorLogController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        return Inertia::render('Admin/ErrorLogs', [
            'errorLines' => $this->readLogLines('laravel.log'),
            'accessLines' => $this->readAccessLogLines(),
            'emailLines' => $this->readLogLines('mail-failures.log'),
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        return Response::json([
            'errorLines' => $this->readLogLines('laravel.log'),
            'accessLines' => $this->readAccessLogLines(),
            'emailLines' => $this->readLogLines('mail-failures.log'),
        ]);
    }

    protected function readLogLines(string $filename): array
    {
        $path = storage_path('logs/'.$filename);
        if (! file_exists($path)) {
            return [];
        }

        $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

        return array_values(array_slice($lines, -300));
    }

    protected function readAccessLogLines(): array
    {
        $candidates = [
            'access.log',
            'laravel-access.log',
        ];

        foreach ($candidates as $filename) {
            $lines = $this->readLogLines($filename);
            if (count($lines) > 0) {
                return $lines;
            }
        }

        return [];
    }
}
