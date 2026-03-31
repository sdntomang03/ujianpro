import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function AuthenticatedLayout({ header, children }) {
  const { auth, flash } = usePage().props;
    const user = auth.user;
    const [showToast, setShowToast] = useState(false);

    // Efek untuk menghilangkan Toast otomatis setelah 5 detik
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // State Navigasi
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Referensi untuk mendeteksi klik di luar Dropdown Profil
    const dropdownRef = useRef(null);

    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    // 🌟 KEAJAIBAN UX: Click-Outside Listener (Standar Industri)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Jika dropdown sedang terbuka DAN klik terjadi BUKAN di dalam area dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false); // Tutup dropdown!
            }
        };

        // Pasang pendeteksi klik ke seluruh dokumen (layar)
        document.addEventListener("mousedown", handleClickOutside);

        // Bersihkan pendeteksi saat komponen ditutup agar memori tidak bocor
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-8">
                            {/* LOGO AREA */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                                        <span className="text-white font-black text-xl">C</span>
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">
                                        CBT <span className="text-indigo-600">PRO</span>
                                    </span>
                                </Link>
                            </div>

                            {/* MENU DESKTOP */}
                            <div className="hidden sm:flex sm:space-x-8">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')} className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('ujian.index')} active={route().current('ujian.index')} className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                                    Daftar Ujian
                                </NavLink>
                            </div>
                        </div>

                        {/* PROFIL & DROPDOWN DESKTOP */}
                        <div className="hidden sm:flex sm:items-center">
                            {/* Pasang 'ref' di kotak pembungkus ini */}
                            <div className="relative ms-3" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`inline-flex items-center gap-3 rounded-xl border border-transparent bg-transparent py-2 pl-2 pr-3 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none ${isProfileOpen ? 'bg-slate-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {/* AVATAR */}
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border shadow-inner transition-colors ${isProfileOpen ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                        {userInitials}
                                    </div>
                                    <span className="font-bold">{user.name}</span>

                                    {/* PANAH BAWAH (Berputar saat diklik) */}
                                    <svg className={`ms-1 h-4 w-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* KOTAK MENU DROPDOWN (Animasi Standar Industri) */}
                                <div className={`absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/60 transition-all duration-200 ease-out z-50 ${isProfileOpen ? 'transform opacity-100 scale-100 visible translate-y-0' : 'transform opacity-0 scale-95 invisible -translate-y-2 pointer-events-none'}`}>
                                    <div className="px-5 py-4 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-2xl">
                                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                                        <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{user.email}</p>
                                    </div>

                                    <div className="py-1 px-2">
                                        <Link href={route('profile.edit')} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            Profil Saya
                                        </Link>
                                    </div>

                                    <div className="py-1 px-2 border-t border-slate-100">
                                        <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-2 px-3 py-2.5 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors">
                                            <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            Keluar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HAMBURGER MENU (MOBILE) */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="inline-flex items-center justify-center rounded-lg p-2.5 text-slate-500 bg-slate-50 border border-slate-200 transition duration-150 ease-in-out hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:outline-none active:scale-95">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline-flex' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* DROPDOWN MENU MOBILE (Animasi Halus) */}
                <div className={`sm:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl transition-all duration-300 ease-in-out origin-top ${showingNavigationDropdown ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible h-0'}`}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-slate-100 pb-4 pt-4 bg-slate-50/50">
                        <div className="px-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm">
                                {userInitials}
                            </div>
                            <div>
                                <div className="text-base font-black text-slate-800">{user.name}</div>
                                <div className="text-sm font-semibold text-slate-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-rose-600 font-bold">
                                Keluar
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* HEADER HALAMAN */}
            {header && (
                <header className="bg-white border-b border-slate-200/60 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* KONTEN UTAMA */}
{/* KONTEN UTAMA */}
            <main className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* TOAST NOTIFICATION (MELAYANG DI POJOK KANAN BAWAH) */}
            {showToast && (flash.success || flash.error) && (
                <div className="fixed bottom-6 right-6 z-[100] transition-all duration-500 ease-in-out transform translate-y-0 opacity-100">
                    {flash.success && (
                        <div className="bg-emerald-600/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-900/20 flex items-center gap-4 border border-emerald-500/50">
                            <div className="bg-white/20 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <p className="font-bold tracking-wide">{flash.success}</p>
                            <button onClick={() => setShowToast(false)} className="ml-2 text-emerald-200 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    )}

                    {flash.error && (
                        <div className="bg-rose-600/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl shadow-rose-900/20 flex items-center gap-4 border border-rose-500/50">
                            <div className="bg-white/20 p-2 rounded-full">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>
                            <p className="font-bold tracking-wide">{flash.error}</p>
                            <button onClick={() => setShowToast(false)} className="ml-2 text-rose-200 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
