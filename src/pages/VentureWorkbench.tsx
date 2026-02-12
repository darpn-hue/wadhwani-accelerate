import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, FileText, Loader2, PenTool } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Mock Data for Workbench Dashboard
const MOCK_JOURNEY = [
    { stream: 'Business', owner: 'Founder', end: 'Oct 2025', status: 'On Track' },
    { stream: 'Financials', owner: 'CFO', end: 'Dec 2025', status: 'At Risk' },
    { stream: 'Product', owner: 'CTO', end: 'Jan 2026', status: 'Delayed' },
];

export const VentureWorkbench = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [venture, setVenture] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [streams, setStreams] = useState<any[]>([]);
    const [supportHours, setSupportHours] = useState<any>(null);

    useEffect(() => {
        if (id) fetchVentureData();
    }, [id]);

    const fetchVentureData = async () => {
        try {
            // 1. Fetch Venture Details
            const { data: ventureData, error: ventureError } = await supabase
                .from('ventures')
                .select('*')
                .eq('id', id)
                .single();

            if (ventureError) throw ventureError;
            setVenture(ventureData);

            // 2. Fetch Milestones
            const { data: milestoneData } = await supabase
                .from('venture_milestones')
                .select('*')
                .eq('venture_id', id);

            setMilestones(milestoneData || []);

            // 3. Fetch Streams
            const { data: streamData } = await supabase
                .from('venture_streams')
                .select('*')
                .eq('venture_id', id);

            setStreams(streamData || []);

            // 4. Fetch Support Hours
            const { data: hoursData } = await supabase
                .from('support_hours')
                .select('*')
                .eq('venture_id', id)
                .single();

            setSupportHours(hoursData);

        } catch (error) {
            console.error('Error fetching venture data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignAgreement = async () => {
        if (!accepted) return;
        setSigning(true);
        try {
            const { error } = await supabase
                .from('ventures')
                .update({
                    agreement_status: 'Signed',
                    agreement_accepted_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Refresh
            fetchVentureData();
        } catch (error) {
            console.error('Error signing agreement:', error);
            alert('Failed to sign agreement. Please try again.');
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!venture) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">Venture Not Found</h2>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="mt-4">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const isSigned = venture.agreement_status === 'Signed';

    // Group milestones by category for display
    const milestonesByCategory = milestones.reduce((acc: any, curr: any) => {
        if (!acc[curr.category]) acc[curr.category] = [];
        acc[curr.category].push(curr.description);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {isSigned ? 'Venture Dashboard February' : 'Review Agreement'}
                        </h1>
                    </div>
                </div>
                {isSigned && (
                    <div className="flex gap-4">
                        <div className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium flex items-center gap-2">
                            Progress Status <span className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium flex items-center gap-2">
                            Support Satisfaction <span className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto">
                {!isSigned ? (
                    // SIGNING VIEW
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Partnership Agreement</h2>
                                    <p className="text-gray-500">Please review the terms and milestones for the {venture.final_program || venture.program} program.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Venture Partner</span>
                                    <span className="font-medium text-gray-900">{venture.venture_partner || 'Pending Assignment'}</span>
                                </div>
                                <div className="bg-white p-3 rounded border border-gray-200">
                                    <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Program Tier</span>
                                    <span className="font-medium text-blue-600">{venture.final_program || venture.program}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="prose prose-sm max-w-none text-gray-600">
                                <h3 className="text-gray-900 font-bold">1. Program Milestones</h3>
                                <p>The following milestones have been defined for your engagement:</p>

                                <div className="space-y-4 mt-4">
                                    {Object.keys(milestonesByCategory).length > 0 ? (
                                        Object.entries(milestonesByCategory).map(([category, items]: [string, any]) => (
                                            <div key={category} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                                                <h4 className="font-bold text-gray-800 mb-2">{category}</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {(items as string[]).map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="italic text-gray-400">No specific milestones defined yet.</p>
                                    )}
                                </div>

                                <h3 className="text-gray-900 font-bold mt-8">2. Terms & Conditions</h3>
                                <p>By accepting this agreement, you commit to actively participating in the program, attending scheduled sessions with your Venture Partner, and working towards the defined milestones.</p>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${accepted ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                        {accepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={accepted}
                                        onChange={(e) => setAccepted(e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">I have read and agree to the partnership terms and milestones.</span>
                                </label>

                                <Button
                                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-12 text-base"
                                    disabled={!accepted || signing}
                                    onClick={handleSignAgreement}
                                >
                                    {signing ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Signing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <PenTool className="w-4 h-4" /> Sign & Accept Agreement
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // WORKBENCH VIEW (Signed)
                    <div className="space-y-6">
                        {/* Status Cards */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-8 grid grid-cols-1 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-lime-100 text-lime-800 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">Business</div>
                                        <span className="font-bold text-gray-900">{venture.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-lime-100 text-lime-800 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">CEO</div>
                                        <span className="font-bold text-gray-900">Arun Kumar</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-lime-400 text-lime-900 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">Venture</div>
                                        <span className="font-bold text-gray-900">{venture.description}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded">Partner</div>
                                        <span className="font-bold text-gray-900">{venture.venture_partner || 'Unassigned'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-4 bg-white rounded-lg shadow-sm border border-gray-100 p-0 overflow-hidden flex">
                                <div className="flex-1 border-r border-gray-100 p-4 text-center">
                                    <div className="bg-purple-900 text-white text-[10px] uppercase font-bold py-1 px-2 rounded mb-2 inline-block">Support Tier</div>
                                    <div className="text-xl font-bold text-gray-900">{venture.final_program || 'Prime'}</div>
                                </div>
                                <div className="flex-1 border-r border-gray-100 p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{supportHours?.balance ?? 15}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Hours Balance</div>
                                </div>
                                <div className="flex-1 bg-purple-900 text-white p-4 flex flex-col justify-center">
                                    <div className="text-xs opacity-80 uppercase font-bold">Outcome</div>
                                    <div className="font-bold text-sm">Start + 3yr Incremental</div>
                                </div>
                            </div>
                        </div>

                        {/* Journey Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-lg text-gray-900">Journey</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-orange-500 text-white text-xs uppercase font-bold">
                                            <th className="px-6 py-3 text-left">Stream</th>
                                            <th className="px-6 py-3 text-left">Owner</th>
                                            <th className="px-6 py-3 text-left">End</th>
                                            <th className="px-6 py-3 text-left">Status</th>
                                            <th className="px-6 py-3 text-left">End Output</th>
                                            <th className="px-6 py-3 text-left">Sprint Deliverable</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {streams.length > 0 ? (
                                            streams.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{row.stream_name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{row.owner || 'Founder'}</td>
                                                    <td className="px-6 py-4 text-gray-600">{row.end_date || 'Oct 2025'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'On Track' ? 'bg-green-100 text-green-700' :
                                                            row.status === 'At Risk' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 italic">Marker for success</td>
                                                    <td className="px-6 py-4 text-gray-500 italic">Stream unblock</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No streams defined.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Feedback & Support Notes */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Feedback</h4>
                                <ul className="space-y-2">
                                    <li className="text-red-500 text-sm flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        Provided expert did not understand domain enough to be valuable
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-4">Support Notes</h4>
                                <ul className="space-y-2">
                                    <li className="text-red-500 text-sm flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        Validate Supply Chain and Operations requirements are understood through the playbook
                                    </li>
                                    <li className="text-red-500 text-sm flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                        Provide research on relevant government programs to address forex risk management
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
