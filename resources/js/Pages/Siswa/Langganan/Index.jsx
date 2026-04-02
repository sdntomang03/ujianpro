import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    Check, Crown, Star, Zap, ShieldCheck,
    X, UploadCloud, AlertCircle
} from 'lucide-react';

export default function Index({ auth, pakets, currentPaketId }) {

    // --- PAYMENT MODAL SYSTEM ---
    const [selectedPaket, setSelectedPaket] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        paket_id: '',
        nominal_transfer: '',
        bukti_pembayaran: null,
    });

    const getHargaPaket = (level) => {
        if (level === 10) return 0;
        if (level === 20) return 99000;
        return 199000;
    };

    const openPaymentModal = (paket) => {
        setSelectedPaket(paket);
        clearErrors();
        setData({
            paket_id: paket.id,
            nominal_transfer: getHargaPaket(paket.level),
            bukti_pembayaran: null,
        });
        setPreviewUrl(null);
    };

    const closePaymentModal = () => {
        setSelectedPaket(null);
        reset();
        setPreviewUrl(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData('bukti_pembayaran', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const submitPayment = (e) => {
        e.preventDefault();
        post(route('upgrade.process'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closePaymentModal();
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-black text-slate-800 tracking-tight">Pilih Paket Belajar</h2>}
        >
            <Head title="Upgrade Paket" />

            <div className="py-12 bg-slate-50/50 min-h-screen relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Text */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            Investasi Terbaik untuk <span className="text-indigo-600">Masa Depanmu.</span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Pilih paket yang sesuai dengan kebutuhan belajarmu dan dapatkan akses ke ribuan bank soal eksklusif.
                        </p>
                    </div>

                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pakets.map((paket) => {
                            const isCurrent = currentPaketId === paket.id;
                            const isPlatinum = paket.level >= 30;
                            const isPremium = paket.level === 20;
                            const hargaStr = paket.level === 10 ? 'Gratis' : paket.level === 20 ? 'Rp 99rb' : 'Rp 199rb';

                            return (
                                <div
                                    key={paket.id}
                                    className={`relative bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 flex flex-col ${
                                        isPlatinum ? 'border-indigo-600 shadow-2xl shadow-indigo-100 md:scale-105 z-20' : 'border-slate-100'
                                    }`}
                                >
                                    {isPlatinum && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                            Paling Populer
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                                            isPlatinum ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {isPlatinum ? <Star size={28} fill="currentColor"/> : isPremium ? <Crown size={28} /> : <Zap size={28} />}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">{paket.nama_paket}</h3>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-4xl font-black text-slate-900">
                                                {hargaStr}
                                            </span>
                                            {paket.level > 10 && <span className="text-slate-400 font-bold text-sm">/selamanya</span>}
                                        </div>
                                    </div>

                                    {/* Features List */}
                                    <ul className="space-y-4 mb-10 flex-1">
                                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                                            <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full"><Check size={14} strokeWidth={3}/></div>
                                            Akses Soal Jenjang {auth.user.jenjang}
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-600 font-medium">
                                            <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full"><Check size={14} strokeWidth={3}/></div>
                                            Analisis Nilai Real-time
                                        </li>
                                        {paket.level >= 20 && (
                                            <li className="flex items-center gap-3 text-slate-600 font-bold">
                                                <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full"><Check size={14} strokeWidth={3}/></div>
                                                Pembahasan Soal PDF
                                            </li>
                                        )}
                                        {paket.level >= 30 && (
                                            <li className="flex items-center gap-3 text-indigo-600 font-black">
                                                <div className="bg-indigo-100 text-indigo-600 p-1 rounded-full"><Check size={14} strokeWidth={3}/></div>
                                                Konsultasi Privat Tutor
                                            </li>
                                        )}
                                    </ul>

                                    {/* Action Button */}
                                    {isCurrent ? (
                                        <div className="w-full bg-slate-100 text-slate-400 font-black py-4 px-6 rounded-2xl text-center uppercase text-xs tracking-widest border border-slate-200">
                                            Paket Aktif Saat Ini
                                        </div>
                                    ) : paket.level < auth.user.paket?.level ? (
                                         <div className="w-full bg-slate-50 text-slate-300 font-black py-4 px-6 rounded-2xl text-center uppercase text-xs tracking-widest border border-slate-100">
                                            Sudah Melewati
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openPaymentModal(paket)}
                                            className={`w-full font-black py-4 px-6 rounded-2xl transition-all duration-300 uppercase text-xs tracking-widest shadow-lg active:scale-95 ${
                                                isPlatinum
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                                                : 'bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-200'
                                            }`}
                                        >
                                            Pilih Paket Ini
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 font-bold text-slate-500"><ShieldCheck /> Aman & Terpercaya</div>
                        <div className="flex items-center gap-2 font-bold text-slate-500"><Zap /> Aktivasi Cepat</div>
                    </div>
                </div>
            </div>

            {/* MODAL PEMBAYARAN MANUAL */}
            {selectedPaket && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Background Overlay */}
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={closePaymentModal}></div>

                    <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-xl text-slate-800 tracking-tight">Konfirmasi Pembayaran</h3>
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Paket {selectedPaket.nama_paket}</p>
                            </div>
                            <button onClick={closePaymentModal} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6 text-center mb-6">
                                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Transfer ke Rekening BCA</p>
                                <p className="text-3xl font-black text-indigo-900 tracking-wider font-mono">1234 5678 90</p>
                                <p className="text-xs font-bold text-indigo-600 mt-2 uppercase">A.N PT Aplikasi Ujian Cerdas</p>
                            </div>

                            <form id="formPayment" onSubmit={submitPayment} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Nominal yang harus dibayar
                                    </label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-800 font-black text-lg">
                                        Rp {data.nominal_transfer.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                        Upload Bukti Transfer
                                    </label>

                                    <label className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                        previewUrl ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                    }`}>
                                        {previewUrl ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                                    <span className="text-white font-bold text-xs uppercase tracking-widest">Ganti Gambar</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                                                <UploadCloud size={32} className="mb-3 text-indigo-400" />
                                                <p className="text-sm font-bold mb-1">Klik untuk upload gambar</p>
                                                <p className="text-xs font-medium opacity-70">JPG, PNG atau JPEG (Max. 2MB)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/jpeg, image/png, image/jpg"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {errors.bukti_pembayaran && (
                                        <p className="flex items-center gap-1.5 text-rose-500 text-xs font-bold mt-2 ml-1">
                                            <AlertCircle size={14}/> {errors.bukti_pembayaran}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                type="submit"
                                form="formPayment"
                                disabled={processing || !data.bukti_pembayaran}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase text-xs tracking-widest shadow-xl shadow-slate-200"
                            >
                                {processing ? 'Memproses Data...' : 'Kirim Bukti Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
