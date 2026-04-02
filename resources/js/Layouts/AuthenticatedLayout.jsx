import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;

    // --- LOGIKA ROLE SPATIE ---
    // Memastikan user memiliki roles, jika tidak default ke false
    const isAdmin = user.roles?.some(role => role.name === 'admin');

    // --- STATE UI ---
    const [showToast, setShowToast] = useState(false);
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ambil Inisial Nama
    const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    // --- EFFECT: AUTO-HIDE TOAST ---
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // --- EFFECT: CLICK OUTSIDE DROPDOWN ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // --- THEME COLOR ---
    // Admin = Rose (Merah), Siswa = Indigo (Biru)
    const themeColor = isAdmin ? 'rose' : 'indigo';
    const bgPrimary = isAdmin ? 'bg-rose-600' : 'bg-indigo-600';
    const textPrimary = isAdmin ? 'text-rose-600' : 'text-indigo-600';
    const borderPrimary = isAdmin ? 'border-rose-200' : 'border-indigo-200';

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">

                        {/* LEFT SIDE: LOGO & NAV */}
                        <div className="flex items-center gap-8">
                            <div className="flex shrink-0 items-center">
                                <Link href={route(isAdmin ? 'admin.dashboard' : 'dashboard')} className="flex items-center gap-3 group">
                                    <div className={`w-10 h-10 ${bgPrimary} rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105`}>
                                        <span className="text-white font-black text-xl">{isAdmin ? 'A' : 'C'}</span>
                                    </div>
                                    <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">
                                        CBT <span className={textPrimary}>{isAdmin ? 'ADMIN' : 'PRO'}</span>
                                    </span>
                                </Link>
                            </div>

                            {/* DESKTOP MENU */}
                            <div className="hidden sm:flex sm:space-x-8">
                                <NavLink href={route(isAdmin ? 'admin.dashboard' : 'dashboard')} active={route().current(isAdmin ? 'admin.dashboard' : 'dashboard')}>
                                    Dashboard
                                </NavLink>

                                {isAdmin ? (
                                    <>
                                        <NavLink href={route('admin.siswa.index')} active={route().current('admin.siswa.*')}>
    Data Siswa
</NavLink>

                                        <NavLink href={route('admin.bank-soal.index')} active={route().current('admin.bank-soal.*')}>
                                            Bank Soal
                                        </NavLink>
                                        <NavLink href={route('admin.ujian.index')} active={route().current('admin.ujian.*')}>
                                            Ujian
                                        </NavLink>
                                        <NavLink href={route('admin.laporan.index')} active={route().current('admin.laporan.*')}>Laporan Nilai</NavLink>


                                    </>
                                ) : (
                                    <NavLink href={route('ujian.index')} active={route().current('ujian.*')}>
                                        Daftar Ujian
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        {/* RIGHT SIDE: PROFILE */}
                        <div className="hidden sm:flex sm:items-center">
                            <div className="relative ms-3" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`inline-flex items-center gap-3 rounded-xl border border-transparent py-2 pl-2 pr-3 text-sm font-medium transition-all duration-200 focus:outline-none ${isProfileOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                                >
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold border shadow-inner ${isAdmin ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                                        {userInitials}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs font-black text-slate-800 leading-none mb-1">{user.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{isAdmin ? 'Administrator' : 'Peserta Ujian'}</p>
                                    </div>
                                    <svg className={`h-4 w-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* DROPDOWN BOX */}
                                <div className={`absolute right-0 mt-3 w-60 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-200 z-50 ${isProfileOpen ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-2'}`}>
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                                        <p className="text-sm font-black text-slate-800 truncate">{user.name}</p>
                                        <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link href={route('profile.edit')} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                            Profil Saya
                                        </Link>
                                    </div>
                                    <div className="p-2 border-t border-slate-100">
                                        <Link href={route('logout')} method="post" as="button" className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            Keluar Sistem
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MOBILE HAMBURGER */}
                        <div className="sm:hidden">
                            <button onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)} className="p-2 rounded-lg bg-slate-50 text-slate-500">
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path className={!showingNavigationDropdown ? 'inline' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    <path className={showingNavigationDropdown ? 'inline' : 'hidden'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MOBILE NAV */}
                <div className={`sm:hidden bg-white border-t border-slate-100 transition-all ${showingNavigationDropdown ? 'block' : 'hidden'}`}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route(isAdmin ? 'admin.dashboard' : 'dashboard')} active={route().current(isAdmin ? 'admin.dashboard' : 'dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        {!isAdmin && (
                            <ResponsiveNavLink href={route('ujian.index')} active={route().current('ujian.index')}>
                                Daftar Ujian
                            </ResponsiveNavLink>
                        )}
                    </div>
                </div>
            </nav>

            {/* PAGE HEADER */}
            {header && (
                <header className="bg-white border-b border-slate-200/60 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* PAGE CONTENT */}
            <main className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>

            {/* FLOATING TOAST */}
            {showToast && (flash.success || flash.error) && (
                <div className="fixed bottom-8 right-8 z-[100] animate-bounce-short">
                    <div className={`px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-4 backdrop-blur-md ${flash.success ? 'bg-emerald-600/90' : 'bg-rose-600/90'}`}>
                        <div className="bg-white/20 p-2 rounded-full">
                            {flash.success ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            )}
                        </div>
                        <p className="font-bold tracking-wide">{flash.success || flash.error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
