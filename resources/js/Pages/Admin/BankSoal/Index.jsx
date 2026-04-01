import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ auth, soal, kategori, filters }) {

    // Fungsi Filter Kategori
    const handleFilterChange = (e) => {
        router.get(
            route('admin.bank-soal.index'),
            { kategori_id: e.target.value },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Fungsi Hapus Soal
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus soal ini? Data yang dihapus tidak dapat dikembalikan.')) {
            router.delete(route('admin.bank-soal.destroy', id));
        }
    };

    // Fungsi pengaman teks (Mencegah React Crash jika ada format JSON nyasar)
    const safeText = (val) => typeof val === 'object' && val !== null ? JSON.stringify(val) : val;

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-2xl text-slate-800">Manajemen Bank Soal</h2>}>
            <Head title="Bank Soal" />

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* TOOLBAR: Filter & Tombol Navigasi Tambah */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm font-bold text-slate-500 whitespace-nowrap">Filter Mapel:</label>
                        <select
                            value={filters?.kategori_id || ''}
                            onChange={handleFilterChange}
                            className="w-full sm:w-64 border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 text-sm font-medium text-slate-700 cursor-pointer"
                        >
                            <option value="">-- Semua Kategori --</option>
                            {kategori?.map((kat) => (
                                <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                            ))}
                        </select>
                    </div>

                    {/* Menggunakan LINK untuk pindah ke halaman Create */}
                    <Link
                        href={route('admin.bank-soal.create')}
                        className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Soal Baru
                    </Link>
                </div>

                {/* TABEL DATA SOAL */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-slate-400 text-xs uppercase font-black border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 w-16 text-center">No</th>
                                <th className="px-6 py-4 w-48">Kategori</th>
                                <th className="px-6 py-4">Cuplikan Pertanyaan</th>
                                <th className="px-6 py-4 w-24 text-center">Kunci</th>
                                <th className="px-6 py-4 w-32 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {soal?.data?.length > 0 ? (
                                soal.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition group">
                                        <td className="px-6 py-4 text-center text-slate-400 font-bold">
                                            {index + 1 + ((soal.current_page || 1) - 1) * (soal.per_page || 10)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                                                {safeText(item.kategori?.nama_kategori) || 'Tanpa Kategori'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-slate-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: safeText(item.pertanyaan) || '-' }}></div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs border border-emerald-200">
                                                {safeText(item.kunci_jawaban) || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                                            {/* Menggunakan LINK untuk pindah ke halaman Edit */}
                                            <Link
                                                href={route('admin.bank-soal.edit', item.id)}
                                                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition font-bold text-sm"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition font-bold text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Belum ada soal untuk kategori ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TODO: Letakkan Pagination Komponen di sini jika diperlukan */}

        </AuthenticatedLayout>
    );
}
