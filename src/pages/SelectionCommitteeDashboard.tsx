import React, { useEffect, useState } from 'react';
import { Building2, Sparkles, TrendingUp, Loader2, Briefcase, Users, Target, Send, AlertTriangle, HelpCircle, CheckCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { InteractionsSection } from '../components/Interactions/InteractionsSection';

interface Venture {
    id: string;
    name: string;
    city: string;
    location: string;
    status: string;
    program_recommendation: string;
    revenue_12m: number;
    revenue_potential_3y: number;
    full_time_employees: number;
    founder_name?: string;
    growth_current?: any;
    commitment?: any;
    needs: { id?: string; stream: string; status: string }[];
    streams?: any[];
    created_at: string;
    vsm_reviewed_at: string;
    vsm_notes?: string;
    internal_comments?: string;
    ai_analysis?: any;
    growth_target?: any;
    incremental_hiring?: string;
    venture_partner?: string;
    workbench_locked?: boolean;
}

export const SelectionCommitteeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [ventures, setVentures] = useState<Venture[]>([]);
    const [selectedVenture, setSelectedVenture] = useState<Venture | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Commitment & Approval State
    const [selectedProgram, setSelectedProgram] = useState('Accelerate Core');
    const [ventureComments, setVentureComments] = useState('');
    const [savingCommitment, setSavingCommitment] = useState(false);

    useEffect(() => {
        if (user) {
            fetchVentures();
        }
    }, [user]);

    const fetchVentures = async () => {
        try {
            // Fetch all ventures with program_recommendation = "Accelerate Core" or "Accelerate Select"
            const { ventures: allVentures } = await api.getVentures({});

            console.log('🔍 All ventures:', allVentures);
            console.log('🔍 Venture recommendations:', allVentures?.map((v: any) => ({
                name: v.name,
                program_recommendation: v.program_recommendation,
                matches: ['Accelerate Core', 'Accelerate Select'].includes(v.program_recommendation)
            })));

            // Filter for Core and Select programs only
            const accelerateVentures = allVentures?.filter(
                (v: Venture) => ['Accelerate Core', 'Accelerate Select'].includes(v.program_recommendation || '')
            ) || [];

            console.log('✅ Filtered Accelerate ventures (Core & Select):', accelerateVentures);

            // Map ventures to ensure needs array exists
            const mappedVentures = accelerateVentures.map((v: any) => ({
                ...v,
                needs: (v.streams || v.needs || []).map((s: any) => ({
                    id: s.id,
                    stream: s.stream_name,
                    status: s.status
                }))
            }));

            setVentures(mappedVentures);
        } catch (err) {
            console.error('Error fetching ventures:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVentureSelect = async (venture: Venture) => {
        // Optimistically set selected to show UI immediately
        setSelectedVenture(venture);

        // Fetch fresh details with streams
        try {
            const { venture: freshVenture, streams } = await api.getVenture(venture.id);

            // Extract fields from JSONB
            if (freshVenture.commitment) {
                freshVenture.revenue_12m = freshVenture.commitment.lastYearRevenue || '0';
                freshVenture.revenue_potential_3y = freshVenture.commitment.revenuePotential || '0';
                freshVenture.incremental_hiring = freshVenture.commitment.incrementalHiring || 'TBD';
            }

            if (freshVenture.growth_current) {
                freshVenture.full_time_employees = freshVenture.growth_current.employees || '0';
            }

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
        } catch (error) {
            console.error('Error fetching venture details:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedVenture) return;

        setSavingCommitment(true);

        try {
            const updatePayload: any = {
                status: newStatus,
                venture_partner: user?.email || 'Selection Committee',
            };

            // If status is Contract Sent, lock the workbench
            if (newStatus === 'Contract Sent') {
                updatePayload.workbench_locked = true;
            }

            await api.updateVenture(selectedVenture.id, updatePayload);

            // Update local state
            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? { ...v, status: newStatus }
                    : v
            ));

            setSelectedVenture(prev => prev ? { ...prev, status: newStatus } : null);

            // Show workbench lock notification if contract sent
            if (newStatus === 'Contract Sent') {
                alert(`✓ Status updated to: ${newStatus}\n\n🔒 Workbench has been locked. The venture will be notified to take action.`);
            }
        } catch (error: any) {
            console.error('Error updating venture status:', error);
            alert('Failed to update status: ' + error.message);
        } finally {
            setSavingCommitment(false);
        }
    };

    const handleApproveAndSend = async (actionType: 'agreement' | 'contract') => {
        if (!selectedVenture) return;

        setSavingCommitment(true);

        try {
            const newStatus = actionType === 'agreement' ? 'Agreement Sent' : 'Contract Sent';

            const updatePayload: any = {
                status: newStatus,
                venture_partner: user?.email || 'Selection Committee',
                // Store commitment data if needed
            };

            // If sending contract, lock the workbench
            if (actionType === 'contract') {
                updatePayload.workbench_locked = true;
            }

            await api.updateVenture(selectedVenture.id, updatePayload);

            // Update local state
            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? { ...v, status: newStatus }
                    : v
            ));

            setSelectedVenture(prev => prev ? { ...prev, status: newStatus } : null);

            if (actionType === 'contract') {
                alert(`✓ Contract sent successfully!\n\nStatus updated to: ${newStatus}\n🔒 Workbench has been locked. The venture will be notified to take action.`);
            } else {
                alert(`✓ Agreement sent successfully!\n\nStatus updated to: ${newStatus}`);
            }
        } catch (error: any) {
            console.error('Error updating venture:', error);
            alert('Failed to send: ' + error.message);
        } finally {
            setSavingCommitment(false);
        }
    };

    const filteredVentures = statusFilter === 'all'
        ? ventures
        : ventures.filter(v => v.status === statusFilter);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            {!selectedVenture && (
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Accelerate Applications <span className="text-gray-400 font-normal ml-2">({filteredVentures.length})</span>
                        </h1>
                        <p className="text-gray-500 mt-1">Review and manage Accelerate ventures (Core, Select).</p>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">Status:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            )}

            {/* MASTER VIEW: Venture List (Big Cards) */}
            {!selectedVenture ? (
                <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : filteredVentures.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-400">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                        <p className="text-gray-500">
                            Ventures recommended for Accelerate Core or Select will appear here
                        </p>
                    </div>
                ) : (
                    filteredVentures.map(v => (
                        <div
                            key={v.id}
                            onClick={() => handleVentureSelect(v)}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-8 flex items-center justify-between group"
                        >
                            {/* Left Column: Identity */}
                            <div className="space-y-4 w-1/3">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-indigo-700 transition-colors mb-1">
                                        {v.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm tracking-wide uppercase font-semibold">
                                        <Target className="w-4 h-4" />
                                        {v.location || v.growth_current?.city || v.city || 'Unknown City'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <Users className="w-3.5 h-3.5" />
                                    {v.founder_name || v.growth_current?.founder_name || 'FOUNDER'}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-24 bg-gray-100 mx-4"></div>

                            {/* Middle Column: Program Status */}
                            <div className="flex-1 px-8 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Program Status</span>
                                    <div className={`px-5 py-2.5 rounded-full text-sm font-bold ${
                                        v.program_recommendation
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                                    }`}>
                                        {v.program_recommendation || 'Pending Review'}
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-24 bg-gray-100 mx-4"></div>

                            {/* Right Column: Revenue & Action */}
                            <div className="flex items-center gap-6 w-1/4 justify-end pl-4">
                                <div className="text-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Revenue (LTM)</span>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {v.revenue_12m || v.commitment?.lastYearRevenue || v.commitment?.revenuePotential || 'N/A'}
                                    </div>
                                </div>

                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                    <Send className="w-6 h-6 rotate-0" />
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Summary Stats */}
                {!loading && filteredVentures.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-indigo-600">Total Applications</p>
                                    <p className="text-3xl font-bold text-indigo-900 mt-1">{ventures.length}</p>
                                </div>
                                <Building2 className="w-12 h-12 text-indigo-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Under Review</p>
                                    <p className="text-3xl font-bold text-yellow-900 mt-1">
                                        {ventures.filter(v => v.status === 'Under Review').length}
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-yellow-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Approved</p>
                                    <p className="text-3xl font-bold text-green-900 mt-1">
                                        {ventures.filter(v => v.status === 'Approved').length}
                                    </p>
                                </div>
                                <Sparkles className="w-12 h-12 text-green-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            ) : (
                /* DETAIL VIEW: Same as Venture Manager Dashboard */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Back Button */}
                    <div className="border-b border-gray-100 px-6 py-3 bg-gray-50">
                        <Button variant="ghost" onClick={() => setSelectedVenture(null)} className="text-gray-500 hover:text-gray-900 w-auto px-3 py-2 h-auto text-sm">
                            ← Back to Ventures
                        </Button>
                    </div>

                    {/* Header: Company Name Left, Status Right */}
                    <div className="border-b border-gray-100 px-6 py-5 bg-white flex items-center justify-between sticky top-0 z-20">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedVenture.name}</h2>
                        <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-bold">
                            {selectedVenture.status}
                        </span>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* VSM Assessment Info Banner */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-indigo-900">Screening Manager Assessment</p>
                                <p className="text-xs text-indigo-700 mt-1">
                                    This venture was assessed by the Screening Manager and recommended for {selectedVenture.program_recommendation}.
                                    {selectedVenture.vsm_reviewed_at && ` Reviewed on ${new Date(selectedVenture.vsm_reviewed_at).toLocaleDateString()}.`}
                                </p>
                            </div>
                        </div>

                        {/* Dashboard Metrics */}
                        <div className="grid grid-cols-3 gap-4">
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
                                    {selectedVenture.revenue_potential_3y || '0'}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Current Full Time Employees</span>
                                <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {selectedVenture.full_time_employees || '0'}
                                </div>
                            </div>
                        </div>

                        {/* Venture Context */}
                        <div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6 space-y-4">
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Name: <span className="font-semibold text-gray-900">{selectedVenture.founder_name || selectedVenture.growth_current?.founder_name || 'N/A'}</span></span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Mobile: <span className="font-semibold text-gray-900">{selectedVenture.growth_current?.phone || selectedVenture.growth_current?.mobile || 'N/A'}</span></span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Email: <span className="font-semibold text-gray-900">{selectedVenture.growth_current?.email || 'N/A'}</span></span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Registered company name</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.name || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Designation (Your role in the company)</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.role || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Company type:</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.business_type || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">Which city is your company primarily based in</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.city || selectedVenture.city || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">State in which your company is located</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.state || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600 block mb-1">How did I hear about us:</span>
                                        <div className="font-medium text-gray-900">{selectedVenture.growth_current?.referred_by || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Current vs Target Business */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="grid grid-cols-2 divide-x divide-gray-100">
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

                                    <div className="p-6 bg-white">
                                        <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-blue-100 pb-3 mb-4">
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                            New Venture
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Product</span>
                                                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.product || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Segment</span>
                                                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.segment || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-blue-400 uppercase block mb-1.5">New Region</span>
                                                <p className="text-sm text-gray-800 bg-white p-3 rounded-lg border border-blue-50 min-h-[44px] flex items-center shadow-sm shadow-blue-100/50">{selectedVenture.growth_target?.geography || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VSM Notes */}
                        {selectedVenture.vsm_notes && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-base font-bold text-gray-700 mb-4">Screening Manager Notes</h3>
                                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap border border-gray-100">
                                    {selectedVenture.vsm_notes}
                                </div>
                            </div>
                        )}

                        {/* AI Analysis */}
                        {selectedVenture.ai_analysis && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    <span className="text-base font-bold text-gray-700">AI Insights</span>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-gray-100">
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">PROS</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {(selectedVenture.ai_analysis.strengths || []).map((s: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CONS</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {(selectedVenture.ai_analysis.risks || []).map((r: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <HelpCircle className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Probing Questions</span>
                                        </div>
                                        <ol className="space-y-2 list-decimal list-inside">
                                            {(selectedVenture.ai_analysis.questions || []).map((q: string, i: number) => (
                                                <li key={i} className="text-sm text-gray-700">{q}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Program Recommendation */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                <span className="text-base font-bold text-gray-700">Program Recommendation</span>
                            </div>
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-indigo-700">Recommended Program:</span>
                                    <span className="text-lg font-bold text-indigo-900">{selectedVenture.program_recommendation}</span>
                                </div>
                                {selectedVenture.internal_comments && (
                                    <div className="mt-3 pt-3 border-t border-indigo-200">
                                        <span className="text-xs font-bold text-indigo-600 uppercase block mb-2">Internal Comments</span>
                                        <p className="text-sm text-indigo-800 whitespace-pre-wrap">{selectedVenture.internal_comments}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactions Section */}
                        <InteractionsSection ventureId={selectedVenture.id} />

                        {/* Commitment & Approval Section */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-gray-400" />
                                    <span className="text-base font-bold text-gray-700">Commitment & Approval</span>
                                </div>
                                {selectedVenture.status === 'Agreement Sent' && (
                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                        ✓ Agreement Sent
                                    </span>
                                )}
                                {selectedVenture.status === 'Contract Sent' && (
                                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                                        ✓ Contract Sent
                                    </span>
                                )}
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Contract Status Log */}
                                {selectedVenture.status === 'Contract Sent' && (
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                        <div>
                                            <p className="text-sm font-semibold text-indigo-900">Contract Sent - Awaiting Signature</p>
                                            <p className="text-xs text-indigo-600 mt-1">
                                                {(selectedVenture as any).updated_at ? new Date((selectedVenture as any).updated_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Program Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Program
                                    </label>
                                    <select
                                        value={selectedProgram}
                                        onChange={(e) => setSelectedProgram(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm text-gray-800"
                                    >
                                        <option value="Accelerate Core">Accelerate Core</option>
                                        <option value="Accelerate Select">Accelerate Select</option>
                                        <option value="Accelerate Prime">Accelerate Prime</option>
                                    </select>
                                </div>

                                {/* Comments */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Comments
                                    </label>
                                    <textarea
                                        value={ventureComments}
                                        onChange={(e) => setVentureComments(e.target.value)}
                                        placeholder="Add any notes or comments about the commitment..."
                                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none text-sm text-gray-700 placeholder:text-gray-400 resize-none"
                                    />
                                </div>

                                {/* Status-based CTAs */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                Current Status:
                                            </label>
                                            <select
                                                value={selectedVenture.status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                disabled={savingCommitment}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <option value="Submitted">Submitted</option>
                                                <option value="Under Review">Under Review</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Agreement Sent">Agreement Sent</option>
                                                <option value="Contract Sent">Contract Sent</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {selectedVenture.status === 'Under Review' && (
                                                <button
                                                    onClick={() => handleApproveAndSend('agreement')}
                                                    disabled={savingCommitment}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    {savingCommitment ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-5 h-5" />
                                                            Approve & Send Agreement
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {selectedVenture.status === 'Agreement Sent' && (
                                                <button
                                                    onClick={() => handleApproveAndSend('contract')}
                                                    disabled={savingCommitment}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    {savingCommitment ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" />
                                                            Send Contract
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {selectedVenture.status === 'Contract Sent' && (
                                                <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                                    <span className="font-semibold text-gray-700">Contract Sent - Awaiting Signature</span>
                                                </div>
                                            )}

                                            {selectedVenture.status === 'Submitted' && (
                                                <button
                                                    onClick={() => handleApproveAndSend('agreement')}
                                                    disabled={savingCommitment}
                                                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                                                >
                                                    {savingCommitment ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-5 h-5" />
                                                            Approve & Send Agreement
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
