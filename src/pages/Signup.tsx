import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Mail, Lock, ArrowRight, Chrome, User, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'entrepreneur',
                    },
                },
            });

            if (error) throw error;

            if (data.session) {
                navigate('/dashboard');
            } else {
                alert('Signup successful! Please check your email for confirmation.');
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message);
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
                <h1 className="text-2xl font-bold text-gray-900">Create a new account</h1>
                <p className="mt-2 text-gray-600">
                    Or <button onClick={() => navigate('/login')} className="text-red-600 font-medium hover:underline">sign in to existing account</button>
                </p>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

                {/* Google Sign Up */}
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                    <Chrome className="w-5 h-5 text-gray-900" />
                    Sign up with Google
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
                        label="Full Name"
                        placeholder="John Doe"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        icon={<User className="w-4 h-4" />}
                    />
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

                    <Button className="w-full" onClick={handleSignup} disabled={loading}>
                        <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

            </div>
        </div>
    );
};
