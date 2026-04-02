import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import {
    Plus, Search, Edit3, Trash2, BookOpen, Layers, Target,
    HelpCircle, ChevronDown, ChevronUp, CheckCircle2, XCircle
} from 'lucide-react';

export default function Index({ auth, soal, kategori, filters }) {
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleFilterChange = (key, value) => {
        router.get(
            route('admin.bank-soal.index'),
            { ...filters, [key]: value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        if (confirm('Data yang dihapus tidak dapat dikembalikan. Lanjutkan?')) {
            router.delete(route('admin.bank-soal.destroy', id));
        }
    };

    const createMarkup = (html) => ({ __html: html || '' });

    const getTipeBadge = (tipe) => {
        const styles = {
            pg: 'bg-blue-50 text-blue-700 border-blue-100',
            pg_kompleks: 'bg-purple-50 text-purple-700 border-purple-100',
            isian: 'bg-orange-50 text-orange-700 border-orange-100',
            benar_salah: 'bg-cyan-50 text-cyan-700 border-cyan-100',
            menjodohkan: 'bg-pink-50 text-pink-700 border-pink-100',
            survei: 'bg-slate-50 text-slate-700 border-slate-100',
        };
        return styles[tipe] || styles.survei;
    };

    const renderKunciJawaban = (item) => {
        const { tipe_soal, kunci_jawaban, opsis } = item;

        if (tipe_soal === 'survei') return <span className="text-slate-300 font-bold">-</span>;

        if (tipe_soal === 'menjodohkan') {
            let count = 0;
            try { count = Object.keys(typeof kunci_jawaban === 'string' ? JSON.parse(kunci_jawaban) : (kunci_jawaban || {})).length; } catch(e){}
            return <div className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 text-[10px] font-black border border-pink-200 shadow-sm">{count} PASANG</div>;
        }

        if (tipe_soal === 'benar_salah') {
            return <div className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-700 text-[10px] font-black border border-cyan-200 shadow-sm">B / S</div>;
        }

        if (tipe_soal === 'pg_kompleks') {
             let count = 0;
             if (opsis && Array.isArray(opsis)) {
                 count = opsis.filter(o => o.is_correct === true || o.is_correct === 1 || o.is_correct === "1").length;
             }
             return <div className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-black border border-purple-200 shadow-sm">{count > 0 ? `${count} KUNCI` : 'DISET'}</div>;
        }

        if (tipe_soal === 'isian') {
            return <div className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700 text-[10px] font-black border border-orange-200 shadow-sm">ISIAN</div>;
        }

        if (tipe_soal === 'pg') {
             if (opsis && Array.isArray(opsis)) {
                 const idx = opsis.findIndex(o => o.is_correct === true || o.is_correct === 1 || o.is_correct === "1");
                 if (idx !== -1) {
                     const abjad = String.fromCharCode(65 + idx);
                     return <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black border border-blue-200 shadow-sm">{abjad}</div>;
                 }
             }
             return <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black border border-slate-200 shadow-sm" title="Belum diset">?</div>;
        }

        return <span className="text-slate-300">-</span>;
    };

    const renderOpsiDetail = (item) => {
        const opsis = item?.opsis || [];
        const tipe_soal = item?.tipe_soal || 'survei';
        const kunci_jawaban = item?.kunci_jawaban;

        if (opsis.length === 0) {
            return <p className="text-sm italic text-slate-400 py-2">Belum ada opsi jawaban yang terdaftar untuk soal ini.</p>;
        }

        if (tipe_soal === 'menjodohkan') {
            let mapKunci = {};
            try {
                mapKunci = typeof kunci_jawaban === 'string' ? JSON.parse(kunci_jawaban) : kunci_jawaban;
                if (!mapKunci) mapKunci = {};
            } catch(e) {
                return <p className="text-sm font-bold text-rose-500">⚠ Format kunci jawaban rusak atau belum diisi.</p>;
            }

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {Object.entries(mapKunci).map(([kiriId, kananId]) => {
                        const teksKiri = opsis.find(o => o.id == kiriId)?.teks_opsi || 'ID Kiri Tidak Ditemukan';
                        const teksKanan = opsis.find(o => o.id == kananId)?.teks_opsi || 'ID Kanan Tidak Ditemukan';
                        return (
                            <div key={`jodoh-${kiriId}`} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                                <div className="flex-1 text-sm bg-slate-50 p-2 rounded-lg prose prose-sm" dangerouslySetInnerHTML={createMarkup(teksKiri)}></div>
                                <span className="text-indigo-500 font-black">➔</span>
                                <div className="flex-1 text-sm bg-indigo-50 text-indigo-700 font-medium p-2 rounded-lg prose prose-sm" dangerouslySetInnerHTML={createMarkup(teksKanan)}></div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {opsis.map((opsi, idx) => {
                    const isBenar = opsi.is_correct === true || opsi.is_correct === 1 || opsi.is_correct === "1";

                    return (
                        <div key={`opsi-${opsi.id || idx}`} className={`flex items-start gap-3 p-3 rounded-xl border ${isBenar ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                            {tipe_soal === 'pg' || tipe_soal === 'pg_kompleks' ? (
                                <div className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${isBenar ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                            ) : (
                                <div className="mt-1">
                                    {isBenar ? <CheckCircle2 size={16} className="text-emerald-500"/> : <XCircle size={16} className="text-slate-300"/>}
                                </div>
                            )}

                            <div className={`text-sm prose prose-sm max-w-none ${isBenar ? 'text-emerald-900 font-medium' : 'text-slate-600'}`} dangerouslySetInnerHTML={createMarkup(opsi.teks_opsi)}></div>

                            {tipe_soal === 'benar_salah' && (
                                <div className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                    {opsi.group === 'kiri' ? 'Pernyataan' : ''}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-black text-2xl text-slate-800 tracking-tight">Manajemen Bank Soal</h2>
                    <Link
                        href={route('admin.bank-soal.create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        <Plus size={20} /> Buat Soal Baru
                    </Link>
                </div>
            }
        >
            <Head title="Bank Soal" />

            {/* KARTU STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><BookOpen /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Total Soal</p>
                        <h4 className="text-2xl font-black text-slate-800">{soal.total}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><Layers /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Kategori Aktif</p>
                        <h4 className="text-2xl font-black text-slate-800">{kategori?.length}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><Target /></div>
                    <div>
                        <p className="text-sm font-bold text-slate-500">Rata-rata Bobot</p>
                        <h4 className="text-2xl font-black text-slate-800">10 Poin</h4>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* TOOLBAR PENCARIAN & FILTER */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        <div className="relative group">
                            <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Cari pertanyaan..."
                                defaultValue={filters?.search || ''}
                                onBlur={(e) => handleFilterChange('search', e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', e.target.value)}
                                className="pl-11 pr-4 py-2.5 w-full sm:w-72 bg-white border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                            />
                        </div>
                        <select
                            value={filters?.kategori_id || ''}
                            onChange={(e) => handleFilterChange('kategori_id', e.target.value)}
                            className="border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-bold text-slate-600 cursor-pointer py-2.5"
                        >
                            <option value="">Semua Mata Pelajaran</option>
                            {kategori?.map((kat) => <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>)}
                        </select>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Menampilkan {soal.data.length} dari {soal.total} Data
                    </div>
                </div>

                {/* TABEL DATA SOAL */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-slate-400 text-[11px] uppercase font-black tracking-tighter border-b border-slate-50">
                                {/* UBAH ID MENJADI NO */}
                                <th className="px-8 py-5 text-center w-20">No</th>
                                <th className="px-6 py-5">Informasi Soal</th>
                                <th className="px-6 py-5 w-32 text-center">Tipe</th>
                                <th className="px-6 py-5 w-24 text-center">Kunci</th>
                                <th className="px-8 py-5 w-40 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {soal.data.length > 0 ? (
                                soal.data.map((item, index) => {

                                    // MENGHITUNG NOMOR URUT BERDASARKAN HALAMAN
                                    const nomorUrut = (soal.current_page - 1) * soal.per_page + index + 1;

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr
                                                onClick={() => toggleRow(item.id)}
                                                className={`transition-colors group cursor-pointer ${expandedRow === item.id ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
                                            >
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        {/* MENAMPILKAN NOMOR URUT */}
                                                        <span className={`text-sm font-black transition-colors ${expandedRow === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-400'}`}>
                                                            {nomorUrut}
                                                        </span>
                                                        {expandedRow === item.id ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-slate-300 group-hover:text-indigo-400" />}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">
                                                                {item.kategori?.nama_kategori || 'UMUM'}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                            <span className="text-[10px] font-bold text-slate-400">
                                                                Bobot: {item.bobot_nilai} Poin
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={`text-sm font-bold text-slate-700 leading-relaxed prose prose-sm max-w-none ${expandedRow === item.id ? '' : 'line-clamp-2'}`}
                                                            dangerouslySetInnerHTML={createMarkup(item.pertanyaan)}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="px-6 py-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getTipeBadge(item.tipe_soal)}`}>
                                                        {item.tipe_soal.replace('_', ' ')}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex justify-center group-hover:scale-105 transition-transform duration-300">
                                                        {renderKunciJawaban(item)}
                                                    </div>
                                                </td>

                                                <td className="px-8 py-6">
                                                    <div className={`flex justify-end gap-2 transition-all duration-300 ${expandedRow === item.id ? 'opacity-100 translate-x-0' : 'translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                                        <Link
                                                            href={route('admin.bank-soal.edit', item.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all hover:shadow-md border border-transparent hover:border-indigo-100"
                                                            title="Edit Soal"
                                                        >
                                                            <Edit3 size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={(e) => handleDelete(item.id, e)}
                                                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all hover:shadow-md border border-transparent hover:border-rose-100"
                                                            title="Hapus Soal"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* BARIS DETAIL OPSI */}
                                            {expandedRow === item.id && (
                                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                                    <td colSpan="5" className="px-8 pb-6 pt-2">
                                                        <div className="pl-16 border-l-2 border-indigo-100 ml-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <Layers size={14} /> Daftar Opsi Jawaban
                                                            </h5>
                                                            {renderOpsiDetail(item)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300"><HelpCircle size={40} /></div>
                                            <div className="max-w-xs">
                                                <h5 className="text-slate-800 font-bold">Tidak ada soal ditemukan</h5>
                                                <p className="text-slate-400 text-sm mt-1">Coba ubah filter pencarian Anda atau buat soal baru sekarang.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION COMPONENT */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Menampilkan Halaman {soal.current_page} dari {soal.last_page}
                    </p>

                    {soal.links && soal.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {soal.links.map((link, idx) => {
                                const labelText = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');

                                return link.url === null ? (
                                    <div
                                        key={idx}
                                        className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: labelText }}
                                    />
                                ) : (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        preserveScroll
                                        className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                                            link.active
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: labelText }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
