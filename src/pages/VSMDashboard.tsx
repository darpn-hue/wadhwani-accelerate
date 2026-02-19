import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
    Briefcase,
    Edit3,
    Loader2,
    Save,
    Send,
    Sparkles,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

// Types
interface Venture {
    id: string;
    name: string;
    description: string;
    // New Fields
    city: string;
    location?: string; // Added location
    revenue_12m: string;
    full_time_employees: string;
    growth_focus: string;
    revenue_potential_3y: string;
    min_investment: string;
    incremental_hiring: string;
    // JSONB Fields
    growth_current: any; // { industry, product, segment, geography }
    growth_target: any; // { product, segment, geography } (descriptions)
    needs: { id?: string; stream: string; status: string }[]; // mapped from streams
    status: string;
    program_recommendation?: string;
    agreement_status?: string; // 'Sent', 'Signed', etc.
    venture_partner?: string; // New for Phase 15
    created_at: string;
    // VSM Fields
    vsm_notes?: string;
    internal_comments?: string;
    ai_analysis?: any;
}

export const VSMDashboard: React.FC = () => {
    const { user } = useAuth();
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any | null>(null);

    // Form State
    const [vsmNotes, setVsmNotes] = useState('');
    const [program, setProgram] = useState('');
    const [internalComments, setInternalComments] = useState('');
    const [saving, setSaving] = useState(false);

    // Venture Partner State
    const [selectedPartner, setSelectedPartner] = useState('');

    // Edit Profile State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editProfileData, setEditProfileData] = useState<any>({});

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            checkUserRole();
        }
    }, [user]);

    useEffect(() => {
        if (userRole) {
            fetchVentures();
        }
    }, [userRole]);

    const checkUserRole = () => {
        if (!user) {
            setUserRole('not-logged-in');
            return;
        }

        const email = user.email || '';
        // Check for Venture Manager first (arun@admin.com)
        if (email.includes('arun')) {
            setUserRole('venture_mgr');
            return;
        }
        // Check for Committee (committee@admin.com)
        if (email.includes('committee')) {
            setUserRole('committee');
            return;
        }
        // Then Screening Manager (other admin emails)
        if (email.includes('admin')) {
            setUserRole('success_mgr');
            return;
        }

        // Fallback or explicit profile check
        setUserRole('entrepreneur');
    };

    const fetchVentures = async () => {
        setLoading(true);
        try {
            const { ventures: data } = await api.getVentures();

            let filteredData = data || [];

            // ROLE BASED FILTERING (keep client-side for now as API returns all for staff)
            if (userRole === 'venture_mgr') {
                filteredData = filteredData.filter((v: any) => v.program_recommendation === 'Accelerate Prime');
            } else if (userRole === 'committee') {
                filteredData = filteredData.filter((v: any) => ['Accelerate Core', 'Accelerate Select'].includes(v.program_recommendation || ''));
            }

            // Map data to ensure needs array exists
            const mappedVentures = filteredData.map((v: any) => ({
                ...v,
                needs: v.needs || []
            }));

            setVentures(mappedVentures);
        } catch (error) {
            console.error('Error fetching ventures:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVentureSelect = async (venture: Venture) => {
        // Optimistically set selected to show UI immediately
        setSelectedVenture(venture);
        setAnalysisResult(null);

        // Fetch fresh details with streams
        try {
            const { venture: freshVenture, streams } = await api.getVenture(venture.id);

            // Map streams to needs format
            const mappedNeeds = (streams || []).map((s: any) => ({
                id: s.id,
                stream: s.stream_name,
                status: s.status
            }));

            const fullVenture = {
                ...freshVenture,
                needs: mappedNeeds
            };

            setSelectedVenture(fullVenture);

            // Setup form state
            setVsmNotes(freshVenture.vsm_notes || '');
            setProgram(freshVenture.program_recommendation || 'Selfserve');
            setInternalComments(freshVenture.internal_comments || '');
            setAnalysisResult(freshVenture.ai_analysis || null);
            setSelectedPartner(freshVenture.venture_partner || '');
            setEditProfileData(freshVenture.growth_target || {});

        } catch (error) {
            console.error('Error fetching venture details:', error);
        }
    };

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

            await api.updateVenture(selectedVenture.id, updatePayload);

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
                await api.updateVenture(selectedVenture.id, { ai_analysis: newAnalysis });

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

    const saveProfileChanges = async () => {
        if (!selectedVenture) return;

        try {
            await api.updateVenture(selectedVenture.id, { growth_target: editProfileData });

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

    // Helper to get status color for streams
    const getStreamStatusColor = (streamName: string, venture: Venture) => {
        const need = venture.needs.find(n => n.stream === streamName);
        if (!need) return 'bg-gray-200'; // Default / Not assessed
        switch (need.status) {
            case 'Resolved': return 'bg-green-500';
            case 'In Progress': return 'bg-yellow-400';
            case 'Attention': return 'bg-red-500';
            default: return 'bg-gray-200';
        }
    };

    const STREAMS = ['Product', 'GTM', 'Funding', 'Supply Chain', 'Operations', 'Team'];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

            {/* Header / Title */}
            {!selectedVenture && (
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {userRole === 'venture_mgr' ? 'Prime Applications' :
                                userRole === 'committee' ? 'Core & Select Apps' :
                                    'Applications'} <span className="text-gray-400 font-normal ml-2">({ventures.length})</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Review and assess venture applications.</p>
                    </div>
                </div>
            )}

            {/* MASTER VIEW: Venture List (Big Cards) */}
            {!selectedVenture ? (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
                    ) : ventures.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
                            No applications found.
                        </div>
                    ) : (
                        ventures.map(v => (
                            <div
                                key={v.id}
                                onClick={() => handleVentureSelect(v)}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-8 flex items-center justify-between group"
                            >
                                {/* Left Column: Identity */}
                                <div className="space-y-4 w-1/3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            {/* Status Dot */}
                                            <div className={`w-3 h-3 rounded-full ${v.status === 'Submitted' ? 'bg-yellow-400' :
                                                v.status === 'Under Review' ? 'bg-blue-400' :
                                                    v.status === 'Agreement Sent' ? 'bg-purple-400' :
                                                        v.status === 'Contract Sent' ? 'bg-green-400' : 'bg-gray-300'
                                                }`}></div>
                                            <h2 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                                                {v.name}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm pl-6 tracking-wide uppercase font-semibold">
                                            <Target className="w-4 h-4" />
                                            {v.location || v.growth_current?.city || 'Unknown City'}
                                        </div>
                                    </div>

                                    <div className="pl-6 flex items-center gap-4">
                                        {/* Program Badge */}
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 uppercase tracking-wider">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            {v.program_recommendation || 'PENDING'}
                                        </div>

                                        {/* Founder/User Name */}
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            <Users className="w-3.5 h-3.5" />
                                            {v.growth_current?.founder_name || 'FOUNDER'}
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-24 bg-gray-100 mx-4"></div>

                                {/* Middle Column: Stream Status Grid */}
                                <div className="flex-1 px-8">
                                    <div className="grid grid-cols-3 gap-y-6 gap-x-8">
                                        {STREAMS.map(stream => (
                                            <div key={stream} className="flex flex-col items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full ${getStreamStatusColor(stream, v)}`}></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stream}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-px h-24 bg-gray-100 mx-4"></div>

                                {/* Right Column: Revenue & Action */}
                                <div className="flex items-center gap-8 w-1/4 justify-end pl-4">
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-1">Revenue (LTM)</span>
                                        <div className="text-3xl font-bold text-gray-900">{v.revenue_12m || 'N/A'}</div>
                                    </div>

                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                        <Send className="w-6 h-6 rotate-0" /> {/* Using Send as arrow/chevron replacement or just arrow right if available */}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* DETAIL VIEW: Full Screen Venture Assessment */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">

                    {/* Back Button & Header */}
                    <div className="border-b border-gray-100 p-4 flex items-center gap-4 bg-white sticky top-0 z-20">
                        <Button variant="ghost" onClick={() => setSelectedVenture(null)} className="text-gray-500 hover:text-gray-900 w-auto px-3 py-2 h-auto text-sm">
                            ← Back to Ventures
                        </Button>
                        <div className="h-6 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">{selectedVenture.name}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">{selectedVenture.status}</span>
                        </div>
                    </div>

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
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Funding Required</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <span className="text-sm text-gray-400">₹</span>
                                    {selectedVenture.min_investment || '0'}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Team Size</span>
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

                        {/* Section 2: Venture Context Comparison (Side-by-Side) */}
                        <div>
                            <div className="flex justify-end items-center mb-4">
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

                            {/* Header Info Row */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6 space-y-4">
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Founder Concept / Name</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.founder_name || user?.user_metadata?.full_name || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Role in Business</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.role || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Email</span>
                                        <div className="font-medium text-gray-900">{user?.email || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">City / State</span>
                                        <div className="font-medium text-gray-900">
                                            {selectedVenture.growth_current?.city ? `${selectedVenture.growth_current.city}, ${selectedVenture.growth_current.state}` : selectedVenture.location || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Business Type</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.business_type || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Referred By</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.referred_by || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>


                            {/* Comparison Card */}
                            <div className="bg-white border boundary-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="grid grid-cols-2 divide-x divide-gray-100">
                                    {/* Current Business Column */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-gray-900 font-bold border-b border-gray-100 pb-3 mb-4">
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                            Current Business
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Product / Service</span>
                                                <p className="text-sm text-gray-800 bg-gray-50/50 p-3 rounded-lg border border-gray-100 min-h-[44px] flex items-center">{selectedVenture.growth_current?.product || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Customer Segment</span>
                                                <p className="text-sm text-gray-800 bg-gray-50/50 p-3 rounded-lg border border-gray-100 min-h-[44px] flex items-center">{selectedVenture.growth_current?.segment || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Region</span>
                                                <p className="text-sm text-gray-800 bg-gray-50/50 p-3 rounded-lg border border-gray-100 min-h-[44px] flex items-center">{selectedVenture.growth_current?.geography || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* New Venture Column */}
                                    <div className={`p-6 ${isEditingProfile ? 'bg-blue-50/30' : 'bg-white'}`}>
                                        <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-100 pb-3 mb-4">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                            New Venture <span className="text-blue-600/60 font-medium ml-1">({selectedVenture.growth_focus})</span>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Product</span>
                                                {isEditingProfile ? (
                                                    <input
                                                        className="w-full p-2.5 text-sm border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                                        value={editProfileData.product || ''}
                                                        onChange={e => setEditProfileData({ ...editProfileData, product: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.product || 'N/A'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Segment</span>
                                                {isEditingProfile ? (
                                                    <input
                                                        className="w-full p-2.5 text-sm border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                                        value={editProfileData.segment || ''}
                                                        onChange={e => setEditProfileData({ ...editProfileData, segment: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.segment || 'N/A'}</p>
                                                )}
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Region</span>
                                                {isEditingProfile ? (
                                                    <input
                                                        className="w-full p-2.5 text-sm border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none"
                                                        value={editProfileData.geography || ''}
                                                        onChange={e => setEditProfileData({ ...editProfileData, geography: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.geography || 'N/A'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Operational Readiness (Read-Only 3x2 Grid) */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-gray-500" />
                                Current Venture Status
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Row 1 */}
                                {['Product', 'GTM', 'Funding'].map(stream => (
                                    <div key={stream}>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{stream}</span>
                                        <div className="p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-500 flex items-center justify-center">
                                            N/A (Non Editable)
                                        </div>
                                    </div>
                                ))}
                                {/* Row 2 */}
                                {['Supply Chain', 'Operations', 'Team'].map(stream => (
                                    <div key={stream}>
                                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">{stream}</span>
                                        <div className="p-3 bg-gray-100 rounded-lg text-sm font-medium text-gray-500 flex items-center justify-center">
                                            N/A (Non Editable)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 4: Recommendation & Submit */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sticky bottom-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-500" />
                                Program Recommendation
                            </h2>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Recommended Program</label>
                                    <select
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        value={program}
                                        onChange={(e) => setProgram(e.target.value)}
                                    >
                                        <option value="">Select a Program...</option>
                                        <option value="Accelerate Core">Accelerate Core (Early Stage)</option>
                                        <option value="Accelerate Select">Accelerate Select (Growth Stage)</option>
                                        <option value="Accelerate Prime">Accelerate Prime (Scaling)</option>
                                        <option value="Selfserve">Self-Serve (Digital Only)</option>
                                        <option value="Reject">Not Suitable</option>
                                    </select>
                                </div>

                                {/* Show Venture Partner selection only for Committee */}
                                {userRole === 'committee' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Assign Venture Partner</label>
                                        <select
                                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                            value={selectedPartner}
                                            onChange={(e) => setSelectedPartner(e.target.value)}
                                        >
                                            <option value="">Select Partner...</option>
                                            <option value="Arun Kumar">Arun Kumar</option>
                                            <option value="Meetul Patel">Meetul Patel</option>
                                            <option value="Rajesh Jain">Rajesh Jain</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Internal Comments (Committee Only)</label>
                                <textarea
                                    className="w-full p-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
                                    placeholder="Add private comments for the selection committee..."
                                    value={internalComments}
                                    onChange={(e) => setInternalComments(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !program}
                                    className="px-8 h-12 text-base shadow-xl shadow-gray-200 bg-gray-900 hover:bg-black text-white"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                    Submit Assessment
                                </Button>
                            </div>
                        </div>

                        {/* [VENTURE MANAGER OR COMMITTEE] Deliverables Section */}
                        {(selectedVenture.status === 'Contract Sent' || selectedVenture.status === 'Agreement Sent' || userRole === 'committee') && (userRole === 'venture_mgr' || userRole === 'committee') && (
                            <div className="border border-purple-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-purple-100">
                                <div className="bg-purple-50/50 p-4 border-b border-purple-100">
                                    <h3 className="font-bold text-purple-900">Program Deliverables (Advanced View)</h3>
                                </div>
                                <div className="p-4 text-center text-purple-400 text-sm">
                                    Deliverables tracking is currently managed in the dedicated Tracker view.
                                </div>
                            </div>
                        )}

                        {/* Section 4: AI Evaluation & Transcript (Advanced) */}
                        <div className="border border-indigo-100 rounded-xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-indigo-900">AI Venture Evaluation</h3>
                                </div>
                                <Button
                                    onClick={runAIAnalysis}
                                    disabled={analyzing}
                                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white w-auto px-4 py-2"
                                    variant="primary"
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
                                            {analysisResult.questions && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Interview Questions</h4>
                                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                                        {analysisResult.questions.map((q: string, i: number) => (
                                                            <li key={i}>{q}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
