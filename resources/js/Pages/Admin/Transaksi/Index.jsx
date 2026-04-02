import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TransaksiIndex({ auth, transaksis }) {
    const { post, processing } = useForm();

    const handleApprove = (id) => {
        if (confirm('Setujui pembayaran ini? Paket siswa akan langsung diupgrade.')) {
            post(route('admin.transaksi.approve', id));
        }
    }

    const handleReject = (id) => {
        if (confirm('Tolak pembayaran ini?')) {
            post(route('admin.transaksi.reject', id));
        }
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-black text-slate-800">Verifikasi Pembayaran</h2>}>
            <Head title="Verifikasi Pembayaran" />

            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Siswa</th>
                                <th className="px-6 py-4">Paket Tujuan</th>
                                <th className="px-6 py-4 text-center">Bukti Transfer</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transaksis.data.map(tx => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                                        {new Date(tx.created_at).toLocaleDateString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{tx.user?.name}</p>
                                        <p className="text-xs text-slate-500">{tx.user?.email}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">
                                        {tx.paket?.nama_paket}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <a href={`/storage/${tx.bukti_pembayaran}`} target="_blank" rel="noreferrer" className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                                            Lihat Bukti
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {tx.status === 'pending' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Pending</span>}
                                        {tx.status === 'approved' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Approved</span>}
                                        {tx.status === 'rejected' && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Rejected</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {tx.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleApprove(tx.id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition" title="Setujui">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button onClick={() => handleReject(tx.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition" title="Tolak">
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
