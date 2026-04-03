import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { MailCheck, LogOut } from 'lucide-react'; // Import ikon

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            {/* --- HEADER --- */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <MailCheck size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Verifikasi Alamat Email
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">
                    Terima kasih telah mendaftar! Sebelum memulai, mohon verifikasi alamat email Anda dengan mengeklik tautan yang baru saja kami kirimkan. Jika Anda tidak menerima email tersebut, kami akan dengan senang hati mengirimkannya kembali.
                </p>
            </div>

            {/* --- STATUS MESSAGE --- */}
            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda berikan saat registrasi.
                </div>
            )}

            <form onSubmit={submit}>

                {/* --- ACTION BUTTONS --- */}
                <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">

                    {/* Tombol Logout */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
                    >
                        <LogOut size={16} /> Keluar
                    </Link>

                    {/* Tombol Resend Email */}
                    <PrimaryButton
                        className="w-full sm:w-auto flex justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200 text-base font-semibold"
                        disabled={processing}
                    >
                        {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
                    </PrimaryButton>

                </div>
            </form>
        </GuestLayout>
    );
}
