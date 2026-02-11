import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, User, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VentureCard, type Venture } from '../components/VentureCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const MyVentures: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchVentures();
        }
    }, [user]);

    const fetchVentures = async () => {
        try {
            const { data, error } = await supabase
                .from('ventures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data if needed to match Venture type, 
            // but if table schema matches interface mostly, straightforward:
            const transformed: Venture[] = (data || []).map((v: any) => ({
                id: v.id,
                name: v.name,
                description: v.description,
                status: v.status,
                program: v.program,
                location: v.location,
                submittedAt: new Date(v.created_at).toISOString().split('T')[0]
            }));

            setVentures(transformed);
        } catch (err) {
            console.error('Error fetching ventures:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Ventures</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        Manage your applications and growth programs.
                        {user && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Viewing as: {user.user_metadata?.full_name || user.email}
                            </span>
                        )}
                    </p>
                </div>
                <Button onClick={() => navigate('/dashboard/new-application')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    New Application
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : ventures.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">No Ventures Yet</h2>
                    <p className="text-gray-500 max-w-sm">
                        You haven't submitted any applications yet. Start your journey by applying for our growth programs.
                    </p>
                    <Button onClick={() => navigate('/dashboard/new-application')} variant="outline" className="mt-4">
                        Apply Now
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ventures.map(venture => (
                        <VentureCard key={venture.id} venture={venture} />
                    ))}
                </div>
            )}
        </div>
    );
};
