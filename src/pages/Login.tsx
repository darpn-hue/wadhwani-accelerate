import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight, AlertCircle, Briefcase, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);

            // Navigate based on email (simple role detection)
            if (email.includes('admin') || email.includes('manager') || email.includes('committee')) {
                navigate('/vsm/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role: string) => {
        let demoEmail = '';
        let demoPassword = '';

        if (role === 'entrepreneur') {
            demoEmail = 'rajesh@example.com';
            demoPassword = 'password';
        } else if (role === 'success_mgr') {
            demoEmail = 'meetul@admin.com';
            demoPassword = 'admin123';
        } else if (role === 'venture_mgr') {
            demoEmail = 'arun@admin.com';
            demoPassword = 'admin123';
        } else if (role === 'committee') {
            demoEmail = 'committee@admin.com';
            demoPassword = 'admin123';
        }

        setEmail(demoEmail);
        setPassword(demoPassword);

        // Trigger auto-login
        setLoading(true);
        setError(null);

        try {
            await signIn(demoEmail, demoPassword);

            // Navigation based on role
            if (role === 'success_mgr' || role === 'venture_mgr' || role === 'committee') {
                navigate('/vsm/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Demo login failed.');
        } finally {
            setLoading(false);
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
                            Venture
                        </button>
                        <button
                            onClick={() => handleDemoLogin('success_mgr')}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                            Screening Manager
                        </button>
                        <button
                            onClick={() => handleDemoLogin('venture_mgr')}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Briefcase className="w-4 h-4 text-purple-600" />
                            Venture Manager
                        </button>
                        <button
                            onClick={() => handleDemoLogin('committee')}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Users className="w-4 h-4 text-indigo-600" />
                            Selection Committee
                        </button>

                    </div>

                    <div className="text-center text-xs text-gray-400 space-y-1">
                        <div>Venture: rajesh@example.com / password</div>
                        <div>Screening Mgr: meetul@admin.com / admin123</div>
                        <div>Venture Mgr: arun@admin.com / admin123</div>
                        <div>Committee: committee@admin.com / admin123</div>
                    </div>
                </div>

            </div>
        </div>
    );
};
