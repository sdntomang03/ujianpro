import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { RefreshCcw, Mail, Lock } from 'lucide-react'; // Import ikon

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi" />

            {/* --- HEADER --- */}
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <RefreshCcw size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Buat Kata Sandi Baru
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">
                    Silakan masukkan kata sandi baru Anda di bawah ini untuk mendapatkan kembali akses ke akun Anda.
                </p>
            </div>

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
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm bg-gray-50"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            readOnly // Opsional: Tambahkan ini jika Anda tidak ingin user mengubah emailnya di tahap ini
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* --- INPUT NEW PASSWORD --- */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />
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
                            autoComplete="new-password"
                            isFocused={true} // Kursor langsung fokus ke sini
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* --- INPUT CONFIRM PASSWORD --- */}
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Ulangi Kata Sandi Baru" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock size={18} />
                        </div>
                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Ketikan ulang kata sandi"
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                {/* --- ACTION BUTTON --- */}
                <div className="pt-2">
                    <PrimaryButton
                        className="w-full flex justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200 text-base font-semibold"
                        disabled={processing}
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Kata Sandi'}
                    </PrimaryButton>
                </div>

            </form>
        </GuestLayout>
    );
}
