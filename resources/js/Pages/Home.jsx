import { Head, Link } from '@inertiajs/react';

export default function Home({ canLogin, canRegister }) {
    return (
        <>
            {/* Tag Head ini akan mengubah judul tab di browser */}
            <Head title="Beranda CBT" />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
                <div className="max-w-2xl w-full p-8 bg-white rounded-2xl shadow-xl text-center border border-gray-100">

                    {/* Ikon atau Logo sederhana */}
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🎓</span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
                        Portal <span className="text-blue-600">CBT Online</span>
                    </h1>
                    <p className="text-gray-500 mb-8 text-lg px-4">
                        Selamat datang di platform ujian berbasis komputer. Silakan masuk untuk melihat jadwal dan mulai mengerjakan soal ujian Anda.
                    </p>

                    {/* Tombol Navigasi */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        {canLogin ? (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                                >
                                    Masuk (Login)
                                </Link>

                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 font-bold rounded-xl hover:bg-blue-50 transition"
                                    >
                                        Daftar Akun Baru
                                    </Link>
                                )}
                            </>
                        ) : null}
                    </div>

                </div>
            </div>
        </>
    );
}
