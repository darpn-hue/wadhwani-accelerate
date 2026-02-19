import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import {
    Sparkles, LayoutDashboard, Users, TrendingUp, DollarSign, Target, Briefcase, Building2,
    FileText, Send, CheckCircle, Edit3, X, Save, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { StatusSelect } from '../components/StatusSelect';
import { useAuth } from '../context/AuthContext';

// Types
interface DeliverableItem {
    title: string;
    description: string;
    status: 'green' | 'orange' | 'red' | 'gray' | 'blue';
}

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
    needs: { id?: string; stream: string; status: string }[]; // mapped from streams
    status: string;
    program_recommendation?: string;
    agreement_status?: string; // 'Sent', 'Signed', etc.
    agreement_milestones?: Record<string, DeliverableItem[]>; // Updated type
    venture_partner?: string; // New for Phase 15
    created_at: string;
    // VSM Fields
    vsm_notes?: string;
    internal_comments?: string;
    ai_analysis?: any;
}

const STREAMS = ['Product', 'GTM', 'Funding', 'Supply Chain', 'Operations', 'Team'];

const MOCK_DELIVERABLES: Record<string, DeliverableItem[]> = {
    'Product': [
        { title: 'Core API Specs', description: 'Technical specifications for public and internal endpoints.', status: 'green' },
        { title: 'UI Design System', description: 'Global typography and component standards.', status: 'green' },
        { title: 'V1.2 Integration', description: 'Deployment of legacy data retrofitting.', status: 'orange' },
        { title: 'Infrastructure', description: 'Multi-region cloud deployment strategy.', status: 'red' },
        { title: 'Unit Testing', description: 'Standardized QA suite for core services.', status: 'green' },
        { title: 'Security Audit', description: 'Third-party penetration testing and compliance.', status: 'gray' }
    ],
    'GTM': [
        { title: 'ICP Definition', description: 'Detailed profile of high-value manufacturing clients.', status: 'green' },
        { title: 'Distribution', description: 'Partner channel mapping and commission structures.', status: 'green' },
        { title: 'Referral Program', description: 'Incentivized advocacy and customer advocacy.', status: 'orange' },
        { title: 'Partner Ecosystem', description: 'Integration directory for third-party providers.', status: 'green' },
        { title: 'Pricing Strategy', description: 'Tiered subscription and volume discount model.', status: 'blue' },
        { title: 'Sales Launch', description: 'Regional enablement kit for direct sales teams.', status: 'green' }
    ],
    'Funding': [
        { title: 'Series A Pitch', description: 'Upscaled narrative for institutional growth rounds.', status: 'red' },
        { title: 'Financial Metrics', description: 'Historical performance and 24-month projections.', status: 'orange' },
        { title: 'Data Room', description: 'Document repository for due diligence.', status: 'green' },
        { title: 'Investor Outreach', description: 'CRM tracking for potential VC partners.', status: 'green' },
        { title: 'Financial Model', description: 'Excel-based dynamic budget and burn calculator.', status: 'green' },
        { title: 'Exit Strategy', description: 'M&A landscape analysis and valuation benchmarks.', status: 'gray' }
    ],
    'Supply Chain': [
        { title: 'Lead Time Gap', description: 'Analysis of hardware delays vs scaling targets.', status: 'red' },
        { title: 'Vendor Review', description: 'Quarterly performance scorecard for key suppliers.', status: 'orange' },
        { title: 'Inventory Forecast', description: 'AI-driven predictive stock requirements.', status: 'green' },
        { title: 'Logistics Audit', description: 'Freight cost optimization and route analysis.', status: 'green' },
        { title: 'Compliance Review', description: 'Regulatory certification status for global trade.', status: 'green' },
        { title: 'Safety Stock', description: 'Buffering strategy for mission-critical components.', status: 'gray' }
    ],
    'Operations': [
        { title: 'ERP Integration', description: 'Centralized management of ops and finance.', status: 'green' },
        { title: 'Team Training', description: 'Internal platform for onboarding new staff.', status: 'green' },
        { title: 'Automation', description: 'Standardization of routine warehouse tasks.', status: 'orange' },
        { title: 'Office Expansion', description: 'Real estate planning for the EMEA headquarters.', status: 'green' },
        { title: 'Compliance Audit', description: 'Internal review of data privacy and safety.', status: 'green' },
        { title: 'Disaster Recovery', description: 'Backup protocols and emergency business plan.', status: 'green' }
    ],
    'Team': [
        { title: 'Hiring Handbook', description: 'Standardized offer procedures.', status: 'green' },
        { title: 'Appraisal Framework', description: 'Semi-annual performance review methodology.', status: 'orange' },
        { title: 'Individual Metrics', description: 'KPI dashboards for department leads.', status: 'green' },
        { title: 'Equity Program', description: 'Option pool allocation and vesting schedules.', status: 'green' },
        { title: 'Culture Workshop', description: 'Mission alignment for remote global teams.', status: 'green' },
        { title: 'Benefits Overhaul', description: 'Comparison study of regional health plans.', status: 'gray' }
    ]
};

export const VSMDashboard: React.FC = () => {
    const { user } = useAuth();
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
    const [milestones, setMilestones] = useState<Record<string, DeliverableItem[]> | null>(null);

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
            setMilestones(freshVenture.agreement_milestones || null);
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

    const generateDeliverables = async () => {
        if (!selectedVenture) return;
        setGeneratingDeliverables(true);

        setTimeout(async () => {
            // Use the detailed mock deliverables
            const newMilestones = { ...MOCK_DELIVERABLES };

            try {
                await api.updateVenture(selectedVenture.id, { agreement_milestones: newMilestones });

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
            await api.updateVenture(selectedVenture.id, {
                status: newStatus,
                internal_comments: internalComments
            });

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

    const handleStreamStatusChange = async (stream: string, newStatus: string) => {
        if (!selectedVenture || !selectedVenture.needs) return;

        // Find the stream to update
        const streamToUpdate = selectedVenture.needs.find(n => n.stream === stream);

        if (!streamToUpdate || !streamToUpdate.id) {
            // Need ID to update logic
            console.error("Stream ID missing, cannot update via API");
            alert("Error: Missing stream ID. Please refresh.");
            return;
        }

        try {
            // Optimistic Update
            const updatedNeeds = selectedVenture.needs.map(n =>
                n.stream === stream ? { ...n, status: newStatus } : n
            );

            const updatedVenture = { ...selectedVenture, needs: updatedNeeds };
            setSelectedVenture(updatedVenture);
            setVentures(prev => prev.map(v => v.id === selectedVenture.id ? updatedVenture : v));

            // API Call
            await api.updateStream(streamToUpdate.id, { status: newStatus });

        } catch (error) {
            console.error("Error updating stream status:", error);
            alert("Failed to update status");
            // Revert changes could go here
        }
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
                                onClick={() => handleVentureSelect(v)}
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
                        {/* Section 2a: Program Recommendation & Assessment */}
                        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-orange-500" />
                                    Program Assessment
                                </h2>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Save className="w-3 h-3" /> Save Assessment
                                        </span>
                                    )}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Recommended Program</label>
                                    <select
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                        value={program}
                                        onChange={(e) => setProgram(e.target.value)}
                                    >
                                        <option value="">Select a program...</option>
                                        <option value="Accelerate Core">Accelerate Core</option>
                                        <option value="Accelerate Select">Accelerate Select</option>
                                        <option value="Accelerate Prime">Accelerate Prime</option>
                                        <option value="Selfserve">Selfserve</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">Select the most suitable program tier.</p>
                                </div>
                                {(userRole === 'committee' || userRole === 'venture_mgr') && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Venture Partner</label>
                                        <select
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            value={selectedPartner}
                                            onChange={(e) => setSelectedPartner(e.target.value)}
                                        >
                                            <option value="">Assign Partner...</option>
                                            <option value="Sanjay (Fintech)">Sanjay (Fintech)</option>
                                            <option value="Vipul (Target/Agri)">Vipul (Target/Agri)</option>
                                            <option value="Anjali (Health)">Anjali (Health)</option>
                                            <option value="Rahul (Consumer)">Rahul (Consumer)</option>
                                            <option value="Priya (SaaS)">Priya (SaaS)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Internal Comments / Feedback</label>
                                <textarea
                                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none h-24 resize-none"
                                    placeholder="Add internal notes, concerns, or feedback for the committee..."
                                    value={internalComments}
                                    onChange={(e) => setInternalComments(e.target.value)}
                                />
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
                                                        <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 text-sm uppercase tracking-wide">{stream}</h4>
                                                        <ul className="space-y-2.5">
                                                            {milestones[stream]?.map((item, i) => {
                                                                const statusColors = {
                                                                    green: 'bg-green-500',
                                                                    orange: 'bg-orange-500',
                                                                    red: 'bg-red-500',
                                                                    gray: 'bg-gray-400',
                                                                    blue: 'bg-blue-500'
                                                                };
                                                                return (
                                                                    <li key={i} className="flex gap-2.5 text-xs">
                                                                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${statusColors[item.status]}`}></span>
                                                                        <div className="flex-1">
                                                                            <div className="font-semibold text-gray-900">{item.title}</div>
                                                                            <div className="text-gray-500 italic mt-0.5">{item.description}</div>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })}
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


                        {/* Section 3: Operational Readiness Check */}
                        <div>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <LayoutDashboard className="w-5 h-5 text-gray-500" />
                                    Current Business Status
                                </h2>
                                <p className="text-sm font-medium text-gray-500 ml-7 mt-1">Operational Readiness Check</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {STREAMS.map((stream) => {
                                    const need = selectedVenture.needs?.find(n => n.stream === stream);
                                    const currentStatus = need?.status || 'No help needed';

                                    return (
                                        <div key={stream} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stream}</span>
                                            <StatusSelect
                                                status={currentStatus}
                                                onChange={(newStatus) => handleStreamStatusChange(stream, newStatus)}
                                            />
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
                )}
            </div>

        </div>
    );
};
