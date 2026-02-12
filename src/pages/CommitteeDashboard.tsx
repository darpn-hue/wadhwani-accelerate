import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, User, LogOut, Sparkles, CheckCircle, AlertTriangle, FileText, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Select } from '../components/ui/Select'; // Assuming Select component exists or using native select

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
    // New Fields
    ai_analysis?: any;
    venture_partner?: string;
    final_program?: string;
    agreement_milestones?: any;
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

    useEffect(() => {
        if (selectedVenture) {
            fetchMilestonesForVenture(selectedVenture.id);
        }
    }, [selectedVenture?.id]);

    const fetchMilestonesForVenture = async (ventureId: string) => {
        const { data, error } = await supabase
            .from('venture_milestones')
            .select('*')
            .eq('venture_id', ventureId);

        if (!error && data && data.length > 0) {
            // Transform rows back to category object
            const grouped = data.reduce((acc: any, curr: any) => {
                if (!acc[curr.category]) acc[curr.category] = [];
                acc[curr.category].push(curr.description);
                return acc;
            }, {});

            setSelectedVenture(prev => prev ? { ...prev, agreement_milestones: grouped } : null);
        }
    };

    const handleDecision = async (decision: 'Approved' | 'Rejected') => {
        if (!selectedVenture) return;

        // VALIDATION
        if (decision === 'Rejected' && (!feedback || feedback.trim().length === 0)) {
            alert("Please provide feedback/reason for rejection.");
            return;
        }
        if (decision === 'Approved') {
            if (!selectedVenture.venture_partner) {
                alert("Please assign a Venture Partner before approving.");
                return;
            }
            if (!window.confirm("Are you sure you want to APPROVE this venture?")) {
                return;
            }
        }

        setProcessing(true);

        try {
            const finalTier = selectedVenture.final_program || selectedVenture.program_recommendation;

            const { error } = await supabase
                .from('ventures')
                .update({
                    status: decision, // Update main status
                    committee_decision: decision,
                    committee_feedback: feedback,
                    venture_partner: selectedVenture.venture_partner,
                    final_program: finalTier,
                    agreement_milestones: selectedVenture.agreement_milestones,
                    // New Agreement Flow Fields
                    agreement_status: decision === 'Approved' ? 'Sent' : 'Draft',
                    agreement_sent_at: decision === 'Approved' ? new Date().toISOString() : null
                })
                .eq('id', selectedVenture.id);

            if (error) throw error;

            // Optimistic update
            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? {
                        ...v,
                        status: decision,
                        committee_decision: decision,
                        committee_feedback: feedback,
                        venture_partner: selectedVenture.venture_partner,
                        final_program: finalTier,
                        agreement_milestones: selectedVenture.agreement_milestones,
                        agreement_status: decision === 'Approved' ? 'Sent' : 'Draft'
                    }
                    : v
            ));

            if (decision === 'Approved') {
                alert("Decision recorded. Agreement has been sent to the venture for signature.");
            }
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

                        {/* AI Deep Dive Section (Read Only) */}
                        <div className="border border-indigo-100 rounded-xl overflow-hidden bg-indigo-50/30">
                            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-indigo-900">Gemini AI Deep Dive</h3>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-indigo-400 border border-indigo-200 px-2 py-0.5 rounded bg-white">Read Only</span>
                            </div>

                            {!selectedVenture.ai_analysis ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p>No AI Analysis generated by VSM yet.</p>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6">
                                    {/* Summary */}
                                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                            {selectedVenture.ai_analysis.summary}
                                        </p>
                                        <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-3">
                                            {selectedVenture.ai_analysis.context}
                                        </p>
                                    </div>

                                    {/* Flags Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                            <div className="flex items-center gap-2 mb-2 text-green-800 font-bold text-xs uppercase">
                                                <CheckCircle className="w-3 h-3" /> Green Flags
                                            </div>
                                            <ul className="space-y-1">
                                                {selectedVenture.ai_analysis.strengths?.map((s: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-[11px] text-green-900">
                                                        <span className="text-green-500">•</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                            <div className="flex items-center gap-2 mb-2 text-orange-800 font-bold text-xs uppercase">
                                                <AlertTriangle className="w-3 h-3" /> Red Flags
                                            </div>
                                            <ul className="space-y-1">
                                                {selectedVenture.ai_analysis.risks?.map((s: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-[11px] text-orange-900">
                                                        <span className="text-orange-500">•</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                        <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-800 mb-2">
                                            <span className="w-4 h-4 bg-indigo-200 rounded-full flex items-center justify-center text-[10px]">?</span>
                                            VSM Interview Questions
                                        </h4>
                                        <ul className="space-y-1 pl-6 list-disc text-xs text-indigo-900">
                                            {selectedVenture.ai_analysis.questions?.map((q: string, i: number) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Agreement Configuration */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-700" />
                                <h3 className="font-bold text-indigo-900">Agreement Configuration</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Partner Selection & Regenerate */}
                                <div className="grid grid-cols-2 gap-6 items-end">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                            <User className="w-3 h-3" /> Assign Venture Partner
                                        </label>
                                        <Select
                                            placeholder="Select Partner"
                                            value={selectedVenture.venture_partner || ''}
                                            onChange={(val) => {
                                                const updated = { ...selectedVenture, venture_partner: val };
                                                setSelectedVenture(updated);
                                                // Persist partner immediately
                                                supabase.from('ventures')
                                                    .update({ venture_partner: val })
                                                    .eq('id', selectedVenture.id)
                                                    .then(({ error }) => {
                                                        if (error) console.error('Error saving partner:', error);
                                                    });
                                            }}
                                            options={[
                                                { label: 'Arun Partner', value: 'Arun Partner' },
                                                { label: 'Rajesh Kumar', value: 'Rajesh Kumar' },
                                                { label: 'Sneha Gupta', value: 'Sneha Gupta' }
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                            <Briefcase className="w-3 h-3" /> Draft Agreement
                                        </label>
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-white"
                                            onClick={() => {
                                                // SIMULATE AI GENERATION
                                                const btn = document.activeElement as HTMLButtonElement;
                                                const originalText = btn.innerText;
                                                btn.innerText = "Generating with Gemini...";
                                                btn.disabled = true;

                                                setTimeout(async () => {
                                                    // Define new milestones structure (for display)
                                                    const newMilestones = {
                                                        'Money & Capital': [`Secure initial tranche of 50L funding for ${selectedVenture.name}.`],
                                                        'Product & Strategy': [
                                                            'Achieve CE certification and ensure all IoT hardware meets European safety standards.',
                                                            'Validate the product-market fit through five structured discovery interviews.',
                                                            'Refine the value proposition based on pilot feedback.'
                                                        ],
                                                        'People & Team': ['Hire a dedicated Sales Lead for the North India expansion.'],
                                                        'Operations': ['Establish a formalized inventory management process.'],
                                                        'Go-To-Market': ['Launch a targeted LinkedIn campaign for B2B distributors.'],
                                                        'Supply Chain': ['Onboard two backup suppliers for critical raw materials.']
                                                    };

                                                    // 1. Delete existing milestones (if regenerating)
                                                    await supabase.from('venture_milestones').delete().eq('venture_id', selectedVenture.id);

                                                    // 2. Insert new milestones
                                                    const milestonesToInsert: any[] = [];
                                                    Object.entries(newMilestones).forEach(([category, items]) => {
                                                        items.forEach(desc => {
                                                            milestonesToInsert.push({
                                                                venture_id: selectedVenture.id,
                                                                category,
                                                                description: desc,
                                                                status: 'Pending'
                                                            });
                                                        });
                                                    });

                                                    const { error } = await supabase.from('venture_milestones').insert(milestonesToInsert);

                                                    if (error) {
                                                        console.error("Error saving milestones:", error);
                                                        alert("Failed to save milestones.");
                                                    } else {
                                                        // Update local state
                                                        // Note: We still keep agreement_milestones in locally for the UI to render, 
                                                        // even though it's now in a separate table.
                                                        const updated = { ...selectedVenture, agreement_milestones: newMilestones };
                                                        setSelectedVenture(updated);
                                                        setVentures(prev => prev.map(v => v.id === selectedVenture.id ? updated : v));
                                                    }

                                                    // Auto-expand all sections
                                                    setExpandedSections({
                                                        'Money & Capital': true,
                                                        'Product & Strategy': true,
                                                        'People & Team': true,
                                                        'Operations': true,
                                                        'Go-To-Market': true,
                                                        'Supply Chain': true
                                                    });

                                                    btn.innerText = originalText;
                                                    btn.disabled = false;
                                                }, 1500);
                                            }}
                                        >
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Regenerate Milestones (AI)
                                        </Button>
                                    </div>
                                </div>

                                {/* Milestones Preview */}
                                {selectedVenture.agreement_milestones && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Generated Milestones Preview</label>
                                        <div className="space-y-2 border border-gray-100 rounded-lg overflow-hidden">
                                            {/* Order: Money, Product, People, Operations, GTM, Supply Chain */}
                                            {['Money & Capital', 'Product & Strategy', 'People & Team', 'Operations', 'Go-To-Market', 'Supply Chain'].map((category) => {
                                                const items = selectedVenture.agreement_milestones[category] || [];
                                                const iconColor = category.includes('Money') ? 'bg-green-400' :
                                                    category.includes('Product') ? 'bg-purple-400' :
                                                        category.includes('Supply') ? 'bg-orange-400' : 'bg-gray-300';
                                                const isExpanded = expandedSections[category];

                                                return (
                                                    <div key={category} className="bg-white border-b border-gray-100 last:border-0">
                                                        <div className="group">
                                                            <button
                                                                className="w-full flex justify-between items-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                                                onClick={() => setExpandedSections(prev => ({
                                                                    ...prev,
                                                                    [category]: !prev[category]
                                                                }))}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-2 h-2 rounded-full ${iconColor}`} />
                                                                    {category}
                                                                </div>
                                                                {isExpanded ? (
                                                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                                                )}
                                                            </button>
                                                            {/* Expanded Content */}
                                                            {isExpanded && items.length > 0 && (
                                                                <div className="px-4 pb-3 pl-8 animate-in slide-in-from-top-1 duration-200">
                                                                    <ul className="list-disc space-y-1 text-xs text-gray-600">
                                                                        {items.map((item: string, i: number) => (
                                                                            <li key={i}>{item}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div >
                                    </div >
                                )}
                            </div >
                        </div >

                        {/* Status / Action Footer */}
                        {
                            activeTab === 'pending' ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900">Final Decision & Override</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="border-b border-gray-100 pb-6">
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Final Tier Override</label>
                                            <Select
                                                value={selectedVenture.final_program || selectedVenture.program_recommendation || ''}
                                                onChange={(val) => {
                                                    const updated = { ...selectedVenture, final_program: val };
                                                    setSelectedVenture(updated);
                                                }}
                                                options={[
                                                    { label: 'Accelerate Prime', value: 'Accelerate Prime' },
                                                    { label: 'Accelerate Core', value: 'Accelerate Core' },
                                                    { label: 'Accelerate Select', value: 'Accelerate Select' }
                                                ]}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <Button
                                                variant="outline"
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-sm h-10 px-6"
                                                onClick={() => handleDecision('Rejected')}
                                                disabled={processing}
                                            >
                                                Reject
                                            </Button>

                                            <Button
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[180px] h-10 text-sm shadow-md shadow-indigo-200"
                                                onClick={() => handleDecision('Approved')}
                                                disabled={processing}
                                            >
                                                {processing ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve & Send
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`rounded-xl border p-4 flex justify-between items-center ${selectedVenture.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                    <div className="flex items-center gap-2 font-bold">
                                        <Clock className="w-5 h-5" />
                                        <span>{selectedVenture.status}. Partner: {selectedVenture.venture_partner || 'Unassigned'}</span>
                                    </div>
                                    <div className="font-medium">
                                        Final Tier: <span className="font-bold">{selectedVenture.final_program || selectedVenture.program_recommendation}</span>
                                    </div>
                                </div>
                            )
                        }
                    </div >
                )}
            </div >
        </div >
    );
};
