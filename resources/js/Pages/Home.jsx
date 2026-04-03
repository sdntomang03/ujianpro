import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    GraduationCap,
    Landmark,
    MonitorPlay,
    BrainCircuit,
    Target,
    BarChart4,
    Timer,
    ListChecks,
    CheckSquare,
    ToggleLeft,
    Network,
    FormInput,
    ClipboardList
} from 'lucide-react';

export default function Home({ canLogin, canRegister }) {
    return (
        <>
            <Head title="CBT PRO - Platform Ujian UTBK, Kedinasan & ANBK" />

            {/* Injeksi Custom CSS Animasi */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
                .delay-500 { animation-delay: 500ms; }
            `}</style>

            <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white flex flex-col overflow-x-hidden">

                {/* --- NAVIGATION --- */}
                <nav className="w-full bg-white/80 backdrop-blur-lg border-b border-slate-200 fixed top-0 z-50 transition-all">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20 items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-200">
                                    C
                                </div>
                                <span className="font-black text-2xl tracking-tighter text-slate-800">
                                    CBT<span className="text-indigo-600">PRO</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6">
                                {canLogin && (
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route('register')}
                                        className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-full hover:bg-indigo-600 transition-all shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5"
                                    >
                                        Daftar Gratis
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* --- HERO SECTION --- */}
                <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
                        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-bold mb-8 shadow-sm">
                            <span className="flex w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                            Simulasi Ujian Paling Mendekati Aslinya
                        </div>

                        <h1 className="animate-fade-in-up delay-100 max-w-5xl mx-auto text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-8">
                            Taklukkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">UTBK & Kedinasan</span> Tanpa Rasa Ragu.
                        </h1>

                        <p className="animate-fade-in-up delay-200 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-12 leading-relaxed">
                            Platform simulasi terpadu untuk UTBK SNBT, ANBK, Sekolah Kedinasan, dan TKA. Dilengkapi sistem penilaian berstandar nasional dan analitik mendalam.
                        </p>

                        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="group flex items-center justify-center gap-2 px-10 py-4 text-lg font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    Mulai Simulasi Sekarang
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="px-10 py-4 text-lg font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm w-full sm:w-auto"
                                >
                                    Lihat Jadwal Ujian
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- 4 PILAR UJIAN --- */}
                <section className="py-12 relative z-20 -mt-16 sm:-mt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="animate-fade-in-up delay-100 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:border-indigo-300 transition-all group">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <GraduationCap size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">UTBK SNBT</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Simulasi TPS, Literasi, dan Penalaran Matematika menggunakan sistem penilaian IRT (Item Response Theory).
                                </p>
                            </div>

                            <div className="animate-fade-in-up delay-200 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:border-blue-300 transition-all group">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Landmark size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">Sekolah Kedinasan</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Persiapan SKD (TWK, TIU, TKP) tembus STAN, IPDN, STIS. Lengkap dengan hitungan passing grade nasional.
                                </p>
                            </div>

                            <div className="animate-fade-in-up delay-300 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:border-emerald-300 transition-all group">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MonitorPlay size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">Simulasi ANBK</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Familiarisasi format AKM (Literasi & Numerasi) dengan multi-tipe soal persis seperti aplikasi Pusmenjar.
                                </p>
                            </div>

                            <div className="animate-fade-in-up delay-400 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:-translate-y-2 hover:border-amber-300 transition-all group">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <BrainCircuit size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">TKA & Psikotes</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                    Uji Tes Kemampuan Akademik (Saintek/Soshum) dan instrumen survei karakter/psikologi.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 🌟 TIPE SOAL YANG DIDUKUNG (SECTION BARU) --- */}
                <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                    {/* Hiasan Background Gelap */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-black mb-4">Kompatibilitas Tipe Soal Berstandar AKM</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Engine CBT PRO tidak hanya mendukung pilihan ganda biasa, melainkan seluruh tipe soal standar evaluasi pendidikan terkini.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Tipe 1: PG */}
                            <div className="animate-fade-in-up delay-100 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors">
                                <ListChecks className="w-8 h-8 text-indigo-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Pilihan Ganda (PG)</h3>
                                <p className="text-slate-400 text-sm">Standar soal memilih satu jawaban paling tepat dari opsi A hingga E.</p>
                            </div>

                            {/* Tipe 2: PG Kompleks */}
                            <div className="animate-fade-in-up delay-200 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors">
                                <CheckSquare className="w-8 h-8 text-blue-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">PG Kompleks (Checkbox)</h3>
                                <p className="text-slate-400 text-sm">Peserta dapat memilih lebih dari satu jawaban benar pada satu butir soal. Format wajib ANBK.</p>
                            </div>

                            {/* Tipe 3: Benar / Salah */}
                            <div className="animate-fade-in-up delay-300 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-colors">
                                <ToggleLeft className="w-8 h-8 text-emerald-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Benar / Salah</h3>
                                <p className="text-slate-400 text-sm">Mengevaluasi tabel pernyataan. Peserta menentukan status Benar/Salah untuk masing-masing baris.</p>
                            </div>

                            {/* Tipe 4: Menjodohkan */}
                            <div className="animate-fade-in-up delay-400 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-amber-500 transition-colors">
                                <Network className="w-8 h-8 text-amber-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Menjodohkan</h3>
                                <p className="text-slate-400 text-sm">Menghubungkan premis di sisi kiri dengan pasangan jawaban yang tepat di sisi kanan.</p>
                            </div>

                            {/* Tipe 5: Isian Singkat */}
                            <div className="animate-fade-in-up delay-500 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-pink-500 transition-colors">
                                <FormInput className="w-8 h-8 text-pink-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Isian Singkat</h3>
                                <p className="text-slate-400 text-sm">Mendukung jawaban teks pendek atau angka mutlak. Sistem koreksi otomatis (*auto-correct*).</p>
                            </div>

                            {/* Tipe 6: Survei Karakter */}
                            <div className="animate-fade-in-up delay-500 bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-colors">
                                <ClipboardList className="w-8 h-8 text-cyan-400 mb-4" />
                                <h3 className="text-xl font-bold mb-2">Survei & Kuesioner</h3>
                                <p className="text-slate-400 text-sm">Modul khusus tanpa skor benar/salah, ideal untuk tes kepribadian (TKP) dan Survei Lingkungan Belajar.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FEATURES SECTION (Penjelasan Sistem) --- */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            {/* Keterangan Fitur */}
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
                                    Bukan Sekadar Latihan Soal Biasa.
                                </h2>
                                <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                                    Kami mendesain *engine* CBT PRO untuk meniru tekanan, antarmuka, dan sistem penilaian ujian resmi secara identik agar siswa tidak kaget saat hari H.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mt-1">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">Sistem Penilaian IRT & Passing Grade</h4>
                                            <p className="text-slate-600 mt-2">Bobot soal ditentukan berdasarkan tingkat kesulitan. Menjawab soal susah dengan benar akan memberikan skor jauh lebih tinggi.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mt-1">
                                            <Timer size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">Blocking Time per Sub-tes</h4>
                                            <p className="text-slate-600 mt-2">Seperti UTBK sesungguhnya, peserta tidak bisa melompat atau kembali ke sub-tes lain jika waktu sudah habis.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mt-1">
                                            <BarChart4 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900">Rapor Analitik & Peringkat</h4>
                                            <p className="text-slate-600 mt-2">Orang tua dan siswa dapat melihat kelemahan spesifik per materi (misal: lemah di Silogisme) beserta ranking nasional.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Mockup Animasi */}
                            <div className="relative lg:ml-auto">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[3rem] rotate-3 opacity-20 blur-2xl animate-pulse"></div>
                                <div className="relative bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border-[8px] border-slate-800 animate-float w-full max-w-lg mx-auto">
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="bg-white rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                                            <div className="font-bold text-slate-800">Literasi Bahasa Indonesia</div>
                                            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full font-mono text-sm font-bold">14 : 59</div>
                                        </div>
                                        <div className="h-4 bg-slate-100 rounded-full w-full mb-3"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-full mb-3"></div>
                                        <div className="h-4 bg-slate-100 rounded-full w-2/3 mb-8"></div>

                                        <div className="space-y-3">
                                            <div className="p-3 border-2 border-indigo-600 bg-indigo-50 rounded-lg flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">A</div>
                                                <div className="h-3 bg-indigo-200 rounded-full w-1/2"></div>
                                            </div>
                                            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">B</div>
                                                <div className="h-3 bg-slate-200 rounded-full w-1/3"></div>
                                            </div>
                                            <div className="p-3 border border-slate-200 rounded-lg flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">C</div>
                                                <div className="h-3 bg-slate-200 rounded-full w-2/5"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* --- CALL TO ACTION BOTTOM --- */}
                <section className="px-4 py-24 bg-slate-50">
                    <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-20 blur-[100px] rounded-full"></div>

                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 relative z-10 leading-tight">
                            Persiapkan Masa Depan Anda <br className="hidden sm:block" /> Mulai Dari Detik Ini.
                        </h2>
                        <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                            Bergabunglah dengan puluhan ribu siswa lainnya yang telah sukses menembus PTN dan Sekolah Kedinasan impian mereka.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="px-10 py-4 bg-white text-indigo-700 font-black rounded-2xl hover:scale-105 transition-transform shadow-xl"
                                >
                                    Daftar Akun Sekarang
                                </Link>
                            )}
                            {canLogin && (
                                <Link
                                    href={route('login')}
                                    className="px-10 py-4 bg-transparent text-white font-black rounded-2xl border-2 border-indigo-400 hover:bg-indigo-600 transition-all"
                                >
                                    Masuk Siswa
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer className="py-8 border-t border-slate-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-2 text-slate-500 font-medium">
                        &copy; {new Date().getFullYear()} CBT PRO Indonesia. Platform Ujian UTBK, ANBK & Kedinasan.
                    </div>
                </footer>

            </div>
        </>
    );
}
