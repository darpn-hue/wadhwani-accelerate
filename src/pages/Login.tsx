import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight, Chrome, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/dashboard',
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDemoLogin = (role: string) => {
        if (role === 'entrepreneur') {
            setEmail('rajesh@example.com');
            setPassword('password');
            alert('Demo credentials pre-filled. Please ensure this user exists in Supabase or use Sign Up.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-orange-50 flex flex-col items-center justify-center p-4">

            {/* Header Branding */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-red-600 rounded-xl mb-4 shadow-lg shadow-red-600/20">
                    <Rocket className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
                <p className="mt-2 text-gray-600">
                    Or <button onClick={() => navigate('/signup')} className="text-red-600 font-medium hover:underline">create a new account</button>
                </p>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                    <Chrome className="w-5 h-5 text-gray-900" />
                    Sign in with Google
                </button>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Input
                        label="Email address"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                    />
                    <Input
                        label="Password"
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-4 h-4" />}
                    />

                    <Button className="w-full" onClick={() => handleLogin()} disabled={loading}>
                        <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {/* Demo Accounts */}
                <div className="pt-2 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleDemoLogin('entrepreneur')}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            Entrepreneur
                        </button>
                        <button
                            onClick={() => handleDemoLogin('success_mgr')}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            Success Mgr
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-400">
                        <div>Entrepreneur: rajesh@example.com / password</div>
                        <div>Admin: meetul@admin.com / admin</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
