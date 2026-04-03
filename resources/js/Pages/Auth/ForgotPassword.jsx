import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react'; // Import ikon tambahan

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            {/* --- HEADER --- */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <KeyRound size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Lupa Kata Sandi?
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">
                    Jangan khawatir. Cukup masukkan alamat email Anda di bawah ini, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
                </p>
            </div>

            {/* --- STATUS MESSAGE (Tampil jika email berhasil dikirim) --- */}
            {status && (
                <div className="mb-6 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                {/* --- INPUT EMAIL --- */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@example.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                    {/* Tombol Kembali ke Login */}
                    <Link
                        href={route('login')}
                        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors focus:outline-none"
                    >
                        <ArrowLeft size={16} /> Kembali ke Login
                    </Link>

                    {/* Tombol Submit */}
                    <PrimaryButton
                        className="w-full sm:w-auto flex justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200"
                        disabled={processing}
                    >
                        {processing ? 'Mengirim...' : 'Kirim Tautan Reset'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
