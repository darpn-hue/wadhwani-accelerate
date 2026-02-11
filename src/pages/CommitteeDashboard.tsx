import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, User, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Types
interface Venture {
    id: string;
    name: string;
    description: string;
    growth_current: any;
    growth_target: any;
    status: string;
    created_at: string;
    location?: string; // Added optional property
    vsm_notes?: string;
    program_recommendation?: string;
    internal_comments?: string; // Added optional property
    committee_decision?: string;
    committee_feedback?: string;
}

export const CommitteeDashboard: React.FC = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
    // const [loading, setLoading] = useState(true); // Removed unused loading state
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
    const [feedback, setFeedback] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchVentures();
    }, []);

    const fetchVentures = async () => {
        try {
            const { data, error } = await supabase
                .from('ventures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVentures(data || []);
        } catch (error) {
            console.error('Error fetching ventures:', error);
        } finally {
            // setLoading(false); // Removed
        }
    };

    const handleDecision = async (decision: 'Approved' | 'Rejected') => {
        if (!selectedVenture) return;

        // VALIDATION
        if (decision === 'Rejected' && (!feedback || feedback.trim().length === 0)) {
            alert("Please provide feedback/reason for rejection.");
            return;
        }
        if (decision === 'Approved' && !window.confirm("Are you sure you want to APPROVE this venture?")) {
            return;
        }

        setProcessing(true);

        try {
            const { error } = await supabase
                .from('ventures')
                .update({
                    status: decision, // Update main status
                    committee_decision: decision,
                    committee_feedback: feedback
                })
                .eq('id', selectedVenture.id);

            if (error) throw error;

            // Optimistic update
            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? { ...v, status: decision, committee_decision: decision, committee_feedback: feedback }
                    : v
            ));

            setSelectedVenture(null); // Deselect after action
            setFeedback('');
        } catch (error) {
            console.error('Error submitting decision:', error);
            alert('Failed to submit decision');
        } finally {
            setProcessing(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    // Filter Logic
    // Pending: Status is 'Under Review' (sent by VSM)
    // Approved History: Status is 'Approved' or 'Rejected'
    const pendingVentures = ventures.filter(v => v.status === 'Under Review');
    const historyVentures = ventures.filter(v => ['Approved', 'Rejected'].includes(v.status));

    const displayedVentures = activeTab === 'pending' ? pendingVentures : historyVentures;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-700 rounded-lg">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Accelerate</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">
                            CM
                        </div>
                        <div>
                            <div className="font-bold text-sm text-gray-900">Committee Member</div>
                            <div className="text-xs text-gray-500">Selection Committee</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => { setActiveTab('pending'); setSelectedVenture(null); }}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending ({pendingVentures.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('approved'); setSelectedVenture(null); }}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            History ({historyVentures.length})
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activeTab === 'pending' && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Review</h3>}
                        {activeTab === 'approved' && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Decision History</h3>}

                        {displayedVentures.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                                {activeTab === 'pending' ? 'No pending reviews.' : 'No history available.'}
                            </div>
                        ) : (
                            displayedVentures.map(v => (
                                <div
                                    key={v.id}
                                    onClick={() => setSelectedVenture(v)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedVenture?.id === v.id ? 'bg-red-50 border-red-500 border-r-2 shadow-sm' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold ${selectedVenture?.id === v.id ? 'text-red-900' : 'text-gray-900'}`}>{v.name}</h4>
                                        {v.status === 'Approved' && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>}
                                        {v.status === 'Rejected' && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejected</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{v.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(v.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {v.program_recommendation && (
                                        <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded inline-block">
                                            Rec: {v.program_recommendation}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <Button variant="ghost" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 justify-start" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                {!selectedVenture ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <User className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-500">Select a venture to review</h3>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold text-gray-900">{selectedVenture.name}</h1>
                                    {selectedVenture.status === 'Approved' && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Approved</span>
                                    )}
                                    {selectedVenture.status === 'Rejected' && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">Rejected</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Proposed Tier</span>
                                <span className="text-xl font-bold text-red-700">
                                    {selectedVenture.program_recommendation || 'No Recommendation'}
                                </span>
                            </div>
                        </div>

                        {/* Main Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 grid grid-cols-12 gap-8">

                                {/* Row 1: Growth Pivot (8 cols) & Financials (4 cols) */}
                                <div className="col-span-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Growth Pivot</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="text-gray-500 line-through decoration-gray-400">
                                            <span className="font-medium text-gray-900 decoration-0 inline-block">{selectedVenture.growth_current?.product}</span>
                                            <span className="text-gray-400 mx-1">({selectedVenture.growth_current?.geography || selectedVenture.location})</span>
                                        </div>
                                        <div className="text-red-400 font-bold">→</div>
                                        <div className="font-bold text-gray-900">
                                            {selectedVenture.growth_target?.product}
                                            <span className="font-normal text-gray-500 ml-1">({selectedVenture.growth_target?.geography})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-4 border-l border-gray-100 pl-8">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Financials</h3>
                                    <div className="text-sm">
                                        <span className="text-gray-500">Rev:</span> <span className="font-bold text-gray-900">{selectedVenture.growth_current?.revenue}</span>
                                        <span className="mx-2 text-gray-300">|</span>
                                        <span className="text-gray-500">Opportunity:</span> <span className="font-bold text-gray-900">{selectedVenture.growth_target?.revenue}</span>
                                    </div>
                                </div>

                                {/* Row 2: Execution Progress */}
                                <div className="col-span-12 pt-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Execution Progress</h3>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 italic text-gray-700 text-sm">
                                        "{selectedVenture.vsm_notes || 'No progress notes available.'}"
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Status / Action Footer */}
                        {activeTab === 'pending' ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Committee Decision</h3>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full h-24 p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none text-sm transition-all"
                                        placeholder="Enter feedback or conditions for approval..."
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm"
                                            onClick={() => handleDecision('Rejected')}
                                            disabled={processing}
                                        >
                                            {processing ? 'Processing...' : 'Reject'}
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] text-sm"
                                            onClick={() => handleDecision('Approved')}
                                            disabled={processing}
                                        >
                                            {processing ? 'Processing...' : 'Approve Venture'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`rounded-xl border p-4 flex justify-between items-center ${selectedVenture.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                <div className="flex items-center gap-2 font-bold">
                                    <Clock className="w-5 h-5" />
                                    <span>{selectedVenture.status}. Partner: Unknown</span>
                                </div>
                                <div className="font-medium">
                                    Tier: <span className="font-bold">{selectedVenture.program_recommendation}</span>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};
