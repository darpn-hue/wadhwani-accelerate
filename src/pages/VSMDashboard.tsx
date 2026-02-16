import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, LayoutDashboard, Users, TrendingUp, DollarSign, Target, Briefcase, Building2, Lock, Unlock, AlertCircle, FileText, Send, CheckCircle, Edit3, X, Save, Calendar, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Types
interface Venture {
    id: string;
    name: string;
    description: string;
    // New Fields
    city: string;
    revenue_12m: string;
    full_time_employees: string;
    growth_focus: string;
    revenue_potential_3y: string;
    min_investment: string;
    incremental_hiring: string;
    // JSONB Fields
    growth_current: any; // { industry, product, segment, geography }
    growth_target: any; // { product, segment, geography } (descriptions)
    needs: { stream: string, status: string }[];
    status: string;
    program_recommendation?: string;
    agreement_status?: string; // 'Sent', 'Signed', etc.
    agreement_milestones?: any; // { stream: [items] }
    venture_partner?: string; // New for Phase 15
    created_at: string;
    // VSM Fields
    vsm_notes?: string;
    internal_comments?: string;
    ai_analysis?: any;
}

const STREAMS = ['Product', 'GTM', 'Funding', 'Supply Chain', 'Operations', 'Team'];
const VENTURE_PARTNERS = [
    'Sanjay (Fintech)',
    'Vipul (Target/Agri)',
    'Anjali (Health)',
    'Rahul (Consumer)',
    'Priya (SaaS)'
];

export const VSMDashboard: React.FC = () => {
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);
    const [generatingDeliverables, setGeneratingDeliverables] = useState(false);

    // Form State
    const [vsmNotes, setVsmNotes] = useState('');
    const [program, setProgram] = useState('');
    const [internalComments, setInternalComments] = useState('');
    const [saving, setSaving] = useState(false);

    // Deliverables state
    const [milestones, setMilestones] = useState<Record<string, string[]> | null>(null);

    // Venture Partner State
    const [selectedPartner, setSelectedPartner] = useState('');

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState<any>({});

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        checkUserRole();
    }, []);

    useEffect(() => {
        if (userRole) {
            fetchVentures();
        }
    }, [userRole]);

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Check for Venture Manager first (arun@admin.com)
            if (user.email?.includes('arun')) {
                setUserRole('venture_mgr');
                return;
            }
            // Check for Committee (committee@admin.com)
            if (user.email?.includes('committee')) {
                setUserRole('committee');
                return;
            }
            // Then Screening Manager (other admin emails)
            if (user.email?.includes('admin')) {
                setUserRole('success_mgr');
                return;
            }

            // Fallback or explicit profile check
            setUserRole('entrepreneur');
        } else {
            setUserRole('not-logged-in');
        }
    };

    const fetchVentures = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('ventures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            let filteredData = data || [];

            // ROLE BASED FILTERING
            if (userRole === 'venture_mgr') {
                filteredData = filteredData.filter(v => v.program_recommendation === 'Accelerate Prime');
            } else if (userRole === 'committee') {
                filteredData = filteredData.filter(v => ['Accelerate Core', 'Accelerate Select'].includes(v.program_recommendation || ''));
            } else if (userRole === 'entrepreneur') {
                // Entrepreneurs usually handled by RLS, but double check
            }


            setVentures(filteredData);
        } catch (error) {
            console.error('Error fetching ventures:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (selectedVenture) {
            setVsmNotes(selectedVenture.vsm_notes || '');
            setProgram(selectedVenture.program_recommendation || 'Selfserve');
            setInternalComments(selectedVenture.internal_comments || '');
            setAnalysisResult(selectedVenture.ai_analysis || null);
            setMilestones(selectedVenture.agreement_milestones || null);
            setSelectedPartner(selectedVenture.venture_partner || '');

            // Reset edit state
            setIsEditingProfile(false);
            setEditProfileData(selectedVenture.growth_target || {});
        }
    }, [selectedVenture]);

    const handleSave = async () => {
        if (!selectedVenture) return;

        // VALIDATION
        if (!program) {
            alert("Please select a Recommended Program before submitting.");
            return;
        }

        setSaving(true);
        try {
            const updatePayload: any = {
                vsm_notes: vsmNotes,
                program_recommendation: program,
                internal_comments: internalComments,
                status: selectedVenture.status === 'Submitted' ? 'Under Review' : selectedVenture.status
            };

            if (userRole === 'committee') {
                updatePayload.venture_partner = selectedPartner;
            }

            const { error } = await supabase
                .from('ventures')
                .update(updatePayload)
                .eq('id', selectedVenture.id);

            if (error) throw error;

            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? { ...v, ...updatePayload }
                    : v
            ));

            alert('Data saved successfully!');
        } catch (error: any) {
            console.error('Error saving:', error);
            alert('Failed to save assessment: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const runAIAnalysis = async () => {
        if (!selectedVenture) return;
        setAnalyzing(true);

        // Simulate Context-Aware Analysis based on transcript
        setTimeout(async () => {
            const newAnalysis = {
                recommendation: 'Accelerate Core',
                generated_at: new Date().toISOString(),
                summary: `Evaluated "${selectedVenture.name}" targeting ${selectedVenture.growth_focus}. The venture shows strong traction with ${selectedVenture.revenue_12m || 'N/A'} revenue but faces risks in the ${selectedVenture.growth_target?.geography || 'target region'}. Founder notes indicate: "${vsmNotes.substring(0, 50)}..."`,
                context: "Sector Analysis: High growth potential in this vertical.",
                strengths: [
                    "Strong revenue base (LTM).",
                    `Clear focus on ${selectedVenture.growth_focus}.`,
                    "Experienced team structure."
                ],
                risks: [
                    "Competitive landscape in new geography.",
                    "Capital efficiency concern.",
                    "Go-to-market strategy needs refinement."
                ],
                questions: [
                    "How do you plan to acquire the first 10 customers in the new segment?",
                    "What is the breakdown of the 3-year revenue potential?",
                    "Can you elaborate on the specific compliance hurdles?",
                    "What is the burn rate impact of the new hiring plan?",
                    "How does the current product adapt to the new market?"
                ]
            };

            try {
                const { error } = await supabase
                    .from('ventures')
                    .update({
                        ai_analysis: newAnalysis
                    })
                    .eq('id', selectedVenture.id);

                if (error) throw error;

                setAnalysisResult(newAnalysis);
                setVentures(prev => prev.map(v =>
                    v.id === selectedVenture.id ? { ...v, ai_analysis: newAnalysis } : v
                ));

            } catch (err) {
                console.error("Failed to save AI analysis", err);
            } finally {
                setAnalyzing(false);
            }
        }, 2000);
    };

    const generateDeliverables = async () => {
        if (!selectedVenture) return;
        setGeneratingDeliverables(true);

        const isCommittee = userRole === 'committee';

        setTimeout(async () => {
            const newMilestones: Record<string, string[]> = {};
            STREAMS.forEach(stream => {
                // Committee gets dates
                const suffix = isCommittee ? ' (By Q3 2026)' : '';
                newMilestones[stream] = [
                    `Draft ${stream} strategy document${suffix}`,
                    `Identify key ${stream} KPIs${suffix}`,
                    `Hire lead for ${stream} execution${suffix}`,
                    `Secure necessary ${stream} resources${suffix}`,
                    `Review ${stream} progress${suffix}`
                ];
            });

            try {
                const { error } = await supabase
                    .from('ventures')
                    .update({
                        agreement_milestones: newMilestones
                    })
                    .eq('id', selectedVenture.id);

                if (error) throw error;
                setMilestones(newMilestones);
                setVentures(prev => prev.map(v =>
                    v.id === selectedVenture.id ? { ...v, agreement_milestones: newMilestones } : v
                ));

            } catch (e) {
                console.error("Error generating deliverables", e);
                alert("Failed to save deliverables");
            } finally {
                setGeneratingDeliverables(false);
            }
        }, 2000);
    };

    const sendAgreement = async (action: 'Approve' | 'Reject') => {
        if (!selectedVenture) return;

        const isReject = action === 'Reject';
        const msg = isReject
            ? "Are you sure you want to REJECT this venture?"
            : (userRole === 'committee' ? "Send Contract to venture?" : "Send agreement to venture?");

        if (!confirm(msg)) return;

        // For rejection, we might want to ensure there are comments
        if (isReject && !internalComments) {
            alert("Please add Internal Comments/Feedback before rejecting.");
            return;
        }

        const newStatus = isReject
            ? 'Rejected'
            : (userRole === 'committee' ? 'Contract Sent' : 'Agreement Sent');

        try {
            const { error } = await supabase
                .from('ventures')
                .update({
                    status: newStatus,
                    internal_comments: internalComments // Ensure comments are saved
                })
                .eq('id', selectedVenture.id);

            if (error) throw error;

            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id ? { ...v, status: newStatus, internal_comments: internalComments } : v
            ));

            // Also update selectedVenture to reflect status change immediately
            setSelectedVenture(prev => prev ? { ...prev, status: newStatus, internal_comments: internalComments } : null);

            alert(isReject ? 'Venture rejected.' : `${userRole === 'committee' ? 'Contract' : 'Agreement'} sent successfully!`);
        } catch (e) {
            console.error("Error updating status", e);
            alert("Failed to update status");
        }
    };

    const saveProfileChanges = async () => {
        if (!selectedVenture) return;

        try {
            const { error } = await supabase
                .from('ventures')
                .update({
                    growth_target: editProfileData
                })
                .eq('id', selectedVenture.id);

            if (error) throw error;

            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id ? { ...v, growth_target: editProfileData } : v
            ));

            setSelectedVenture(prev => prev ? { ...prev, growth_target: editProfileData } : null);
            setIsEditingProfile(false);
            alert("Venture profile updated.");

        } catch (e) {
            console.error("Error updating profile", e);
            alert("Failed to update profile");
        }
    };

    const getStreamColor = (status: string) => {
        switch (status) {
            case 'No help needed': return 'bg-gray-50 border-gray-200 text-gray-500';
            case 'Working on it': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'Need guidance': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'Need deep support': return 'bg-red-50 border-red-200 text-red-700 font-medium';
            default: return 'bg-gray-50 border-gray-200 text-gray-500';
        }
    };

    const getStreamLabel = (status: string) => {
        if (status === 'On Track') return 'Working on it';
        if (status === 'At Risk') return 'Need deep support';
        if (status === 'Delayed') return 'Need guidance';
        if (status === 'Not started') return 'No help needed';
        return status;
    };


    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">

            {/* Left Panel: Venture List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 bg-gray-50 top-0 sticky z-10 flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-gray-700">
                            {userRole === 'venture_mgr' ? 'Prime Applications' :
                                userRole === 'committee' ? 'Core & Select Apps' :
                                    'Applications'} ({ventures.length})
                        </h2>
                    </div>
                    {userRole === 'entrepreneur' && <span className="text-xs text-red-500 font-bold">Demo Mode</span>}
                    {userRole === 'venture_mgr' && <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-1 rounded">Venture Mgr</span>}
                    {userRole === 'committee' && <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">Selection Committee</span>}
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : ventures.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            {userRole === 'venture_mgr' ? 'No Prime applications found.' :
                                userRole === 'committee' ? 'No Core/Select applications found.' :
                                    'No applications found.'}
                        </div>
                    ) : (
                        ventures.map(v => (
                            <div
                                key={v.id}
                                onClick={() => { setSelectedVenture(v); setAnalysisResult(null); }}
                                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 group ${selectedVenture?.id === v.id ? 'bg-red-50 border-r-2 border-red-500' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold ${selectedVenture?.id === v.id ? 'text-red-900' : 'text-gray-900 group-hover:text-red-700'}`}>{v.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                                        v.status === 'Agreement Sent' ? 'bg-purple-100 text-purple-700' :
                                            v.status === 'Contract Sent' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-600'}`}>{v.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{v.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {v.revenue_12m || 'N/A'}</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {v.full_time_employees || '0'} FTE</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Detailed View */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto relative">
                {!selectedVenture ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <LayoutDashboard className="w-8 h-8 text-gray-300" />
                        </div>
                        <p>Select an application to review</p>
                    </div>
                ) : (
                    <div className="p-8 space-y-8">
                        {/* Section 1: Dashboard Metrics */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Current Revenue</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <span className="text-sm text-gray-400">₹</span>
                                    {selectedVenture.revenue_12m || '0'}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Revenue (3Y)</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <span className="text-sm text-gray-400">₹</span>
                                    {selectedVenture.revenue_potential_3y || 'TBD'}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Current FTE</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {selectedVenture.full_time_employees || '0'}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Jobs</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <Target className="w-4 h-4 text-gray-400" />
                                    {selectedVenture.incremental_hiring || 'TBD'}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Side-by-Side Venture View (With Edit for Venture Mgr & Committee) */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-gray-500" />
                                    Venture Context
                                </h2>
                                {(userRole === 'venture_mgr' || userRole === 'committee') && (
                                    <Button
                                        variant="outline"
                                        onClick={() => isEditingProfile ? saveProfileChanges() : setIsEditingProfile(true)}
                                        className="text-xs h-8"
                                    >
                                        {isEditingProfile ? <><Save className="w-3 h-3 mr-1" /> Save Changes</> : <><Edit3 className="w-3 h-3 mr-1" /> Edit Profile</>}
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Current Business */}
                                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                                    <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        Current Business
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Product/Service</span>
                                            <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_current?.product || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Customer Segment</span>
                                            <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_current?.segment || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase">Region</span>
                                            <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_current?.geography || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* New Venture */}
                                <div className={`border bg-blue-50/30 rounded-xl p-5 space-y-4 ${isEditingProfile ? 'border-blue-300 ring-2 ring-blue-100' : 'border-blue-100'}`}>
                                    <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-100 pb-2">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                        New Venture ({selectedVenture.growth_focus})
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-bold text-blue-400 uppercase">New Product</span>
                                            {isEditingProfile ? (
                                                <input
                                                    className="w-full mt-1 p-1 text-sm border rounded"
                                                    value={editProfileData.product || ''}
                                                    onChange={e => setEditProfileData({ ...editProfileData, product: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_target?.product || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-blue-400 uppercase">New Segment</span>
                                            {isEditingProfile ? (
                                                <input
                                                    className="w-full mt-1 p-1 text-sm border rounded"
                                                    value={editProfileData.segment || ''}
                                                    onChange={e => setEditProfileData({ ...editProfileData, segment: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_target?.segment || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-blue-400 uppercase">New Region</span>
                                            {isEditingProfile ? (
                                                <input
                                                    className="w-full mt-1 p-1 text-sm border rounded"
                                                    value={editProfileData.geography || ''}
                                                    onChange={e => setEditProfileData({ ...editProfileData, geography: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-800 mt-1">{selectedVenture.growth_target?.geography || 'N/A'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* [VENTURE MANAGER OR COMMITTEE] Deliverables Section */}
                        {(userRole === 'venture_mgr' || userRole === 'committee') && (
                            <div className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-purple-100">
                                <div className="bg-purple-50/50 p-4 border-b border-purple-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-bold text-purple-900">
                                            {userRole === 'committee' ? 'Selection Committee Deliverables (Time-bound)' : 'Program Deliverables & Agreement'}
                                        </h3>
                                    </div>
                                    {!milestones && (
                                        <Button
                                            onClick={generateDeliverables}
                                            disabled={generatingDeliverables}
                                            className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            {generatingDeliverables ? 'Generating...' : 'Generate Deliverables'}
                                        </Button>
                                    )}
                                </div>

                                <div className="p-6">
                                    {!milestones ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400 opacity-60">
                                            <Sparkles className="w-12 h-12 mb-4 text-purple-300" />
                                            <p>Generate deliverables based on specific streams</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                {STREAMS.map(stream => (
                                                    <div key={stream} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                        <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1 text-sm">{stream}</h4>
                                                        <ul className="space-y-2">
                                                            {milestones[stream]?.map((item, i) => (
                                                                <li key={i} className="flex gap-2 text-xs text-gray-600">
                                                                    <span className="text-purple-400 font-bold">•</span>
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                                {selectedVenture.status === 'Agreement Sent' || selectedVenture.status === 'Contract Sent' ? (
                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200 font-bold">
                                                        <CheckCircle className="w-5 h-5" />
                                                        {selectedVenture.status}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => sendAgreement('Reject')}
                                                            className="border-red-200 text-red-600 hover:bg-red-50"
                                                        >
                                                            <X className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                        <Button
                                                            onClick={() => sendAgreement('Approve')}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 gap-2"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            {userRole === 'committee' ? 'Send Contract' : 'Send Agreement'}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}


                        {/* Section 3: Current Business Status (Streams) */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-gray-500" />
                                Current Business Status
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {selectedVenture.needs?.map((need, i) => {
                                    const statusLabel = getStreamLabel(need.status);
                                    return (
                                        <div key={i} className={`p-3 rounded-lg border flex flex-col gap-1 ${getStreamColor(statusLabel)}`}>
                                            <span className="text-xs font-bold uppercase opacity-70">{need.stream}</span>
                                            <span className="text-sm font-semibold">{statusLabel}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 4: AI Evaluation & Transcript */}
                        <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-indigo-900">AI Venture Evaluation</h3>
                                </div>
                                <Button
                                    onClick={runAIAnalysis}
                                    disabled={analyzing}
                                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {analyzing ? 'Analyzing...' : 'Update Evaluation'}
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 divide-x divide-gray-100">
                                {/* Left Column: Transcript Input */}
                                <div className="col-span-1 p-4 bg-gray-50/50">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                        Call Transcript / Notes
                                    </label>
                                    <textarea
                                        className="w-full h-[400px] rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                                        placeholder="Paste transcript or type notes here to update context..."
                                        value={vsmNotes}
                                        onChange={(e) => setVsmNotes(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Updating notes and clicking "Update Evaluation" will refresh the AI summary.
                                    </p>
                                </div>

                                {/* Right Column: AI Output */}
                                <div className="col-span-2 p-6 space-y-6">
                                    {!analysisResult ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                            <Sparkles className="w-12 h-12 mb-4 text-gray-300" />
                                            <p>Run analysis to generate insights</p>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Executive Summary</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                                    {analysisResult.summary}
                                                </p>
                                                <p className="text-xs text-indigo-600 mt-2 italic font-medium">
                                                    Generated with updated context.
                                                </p>
                                            </div>

                                            {/* Follow-up Questions */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">?</span>
                                                    Follow-up Questions
                                                </h4>
                                                <ul className="space-y-2">
                                                    {analysisResult.questions.map((q: string, i: number) => (
                                                        <li key={i} className="flex gap-3 text-sm text-gray-600">
                                                            <span className="text-gray-400 font-mono text-xs mt-0.5">0{i + 1}</span>
                                                            {q}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 5: Program Selection & Partner Assignment */}
                        <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Final Authorization</h3>
                                    <p className="text-gray-400 text-sm">
                                        {userRole === 'venture_mgr' ? 'Re-recommend if necessary.' : 'Confirm program and partnerships.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                        Select Program
                                    </label>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={program}
                                        onChange={(e) => setProgram(e.target.value)}
                                    >
                                        <option value="Selfserve">Selfserve</option>
                                        <option value="Accelerate Prime">Accelerate Prime</option>
                                        <option value="Accelerate Core">Accelerate Core</option>
                                        <option value="Accelerate Select">Accelerate Select</option>
                                    </select>
                                </div>

                                {userRole === 'committee' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">
                                            <UserPlus className="w-3 h-3 text-indigo-400" />
                                            Assign Venture Partner
                                        </label>
                                        <select
                                            className="w-full bg-gray-800 border border-indigo-900/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={selectedPartner}
                                            onChange={(e) => setSelectedPartner(e.target.value)}
                                        >
                                            <option value="">Select Partner...</option>
                                            {VENTURE_PARTNERS.map(vp => (
                                                <option key={vp} value={vp}>{vp}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                                        Internal Comments
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Add notes for records..."
                                        value={internalComments}
                                        onChange={(e) => setInternalComments(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-red-600 hover:bg-red-700 text-white px-8 h-[46px]"
                                >
                                    {saving ? 'Saving...' : 'Confirm & Save'}
                                </Button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <div className="hidden">
                {/* Lucide icon cache/preload hack if needed */}
            </div>
        </div >
    );
};
