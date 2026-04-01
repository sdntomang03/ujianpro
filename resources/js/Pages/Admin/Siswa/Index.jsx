import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, siswa }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    // Hapus 'id' dari inisialisasi form
    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const openModal = (item = null) => {
        if (item) {
            setEditData(item);

            setData({ name: item.name, email: item.email, password: '' });
        } else {
            setEditData(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            // Kita tetap menggunakan editData.id untuk rute URL update, tapi tidak dikirim sebagai input form
            put(route('admin.siswa.update', editData.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('admin.siswa.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            router.delete(route('admin.siswa.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-slate-800">Manajemen Data Siswa</h2>}
        >
            <Head title="Data Siswa" />

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <button
                        onClick={() => openModal()}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-xl transition shadow-lg shadow-rose-200"
                    >
                        + Tambah Siswa Baru
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black">
                            <tr>
                                {/* Kolom NIS/ID Dihapus */}
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siswa.data.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                    {/* Kolom data NIS/ID Dihapus */}
                                    <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                                    <td className="px-6 py-4 text-slate-500">{item.email}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => openModal(item)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-slate-900 mb-6">{editData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>

                            {/* Tambahkan autoComplete="off" di level form */}
                            <form onSubmit={submit} className="space-y-4" autoComplete="off">

                                {/* Trik tambahan: hidden input ini membingungkan password manager browser */}
                                <input type="text" style={{display: 'none'}} />
                                <input type="password" style={{display: 'none'}} />

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500"
                                        autoComplete="new-password" // Trik agar tidak dikenali sebagai nama
                                        spellCheck="false"
                                    />
                                    {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500"
                                        autoComplete="new-password" // Mencegah email admin otomatis terisi di sini
                                        spellCheck="false"
                                    />
                                    {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">
                                        Password {editData && '(Kosongkan jika tidak ganti)'}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500"
                                        autoComplete="new-password" // Memaksa browser bahwa ini adalah password baru, bukan password login admin
                                    />
                                    {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Batal</button>
                                    <button type="submit" disabled={processing} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
