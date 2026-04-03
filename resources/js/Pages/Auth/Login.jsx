import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn, Mail, Lock } from 'lucide-react'; // Import ikon

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* --- HEADER --- */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <LogIn size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Selamat Datang Kembali
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
            </div>

            {status && (
                <div className="mb-4 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">

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
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@example.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* --- INPUT PASSWORD --- */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* --- REMEMBER ME & FORGOT PASSWORD --- */}
                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-indigo-600 focus:ring-indigo-500 rounded border-gray-300"
                        />
                        <span className="ms-2 text-sm text-gray-600 font-medium">Ingat Saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none focus:underline"
                        >
                            Lupa kata sandi?
                        </Link>
                    )}
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full flex justify-center py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200 text-base"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Masuk Sekarang'}
                    </PrimaryButton>
                </div>

                {/* --- REGISTER LINK --- */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link
                        href={route('register')}
                        className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors focus:outline-none focus:underline"
                    >
                        Daftar di sini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
