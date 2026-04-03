import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, Lock } from 'lucide-react'; // Import ikon keamanan

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi" />

            {/* --- HEADER --- */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Konfirmasi Keamanan
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">
                    Ini adalah area aman dari aplikasi. Silakan konfirmasi kata sandi Anda terlebih dahulu sebelum melanjutkan.
                </p>
            </div>

            <form onSubmit={submit}>

                {/* --- INPUT PASSWORD --- */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Anda" />
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
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* --- ACTION BUTTON --- */}
                <div className="mt-8 flex justify-end">
                    <PrimaryButton
                        className="w-full sm:w-auto flex justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200 text-base font-semibold"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Konfirmasi Lanjutkan'}
                    </PrimaryButton>
                </div>

            </form>
        </GuestLayout>
    );
}
