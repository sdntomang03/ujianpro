<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Cek email dan password
        $request->authenticate();

        // 2. Buat sesi baru
        $request->session()->regenerate();

        // 🌟 3. KUNCI UTAMANYA DI SINI!
        // Baris ini akan menghancurkan (menendang) semua sesi lain milik user ini
        // dari browser/perangkat manapun yang sedang aktif.
        Auth::logoutOtherDevices($request->password);

        // Jika user adalah admin, arahkan ke admin.dashboard
        if ($request->user()->hasRole('admin')) {
            return redirect()->intended(route('admin.dashboard'));
        }

        // Jika user adalah siswa, arahkan ke dashboard siswa
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
