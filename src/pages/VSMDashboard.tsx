import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Sparkles, CheckCircle, AlertTriangle, ChevronRight, XCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

// Types (simplified for this view)
interface Venture {
    id: string;
    name: string;
    description: string;
    growth_current: any;
    growth_target: any;
    status: string;
    created_at: string;
    // VSM Fields
    vsm_notes?: string;
    program_recommendation?: string;
    internal_comments?: string;
}

export const VSMDashboard: React.FC = () => {
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

    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        checkUserRole();
        fetchVentures();
    }, []);

    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            let { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single(); // Use single() to expect one row

            // AUTO-HEAL: If profile is missing, create it
            if (error || !data) {
                console.log('Profile missing/error, attempting to auto-create...', error);
                const role = user.email?.includes('admin') ? 'success_mgr' : 'entrepreneur';

                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert([{
                        id: user.id,
                        full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                        role: role
                    }]);

                if (!insertError) {
                    console.log('Profile auto-created via Dashboard');
                    setUserRole(role);
                    // Re-fetch ventures now that we have a role (and potentially RLS access)
                    setTimeout(fetchVentures, 1000);
                    return;
                } else {
                    console.error('Failed to auto-create profile:', insertError);
                }
            }

            setUserRole(data?.role || 'unknown');
            console.log('Current User Role:', data?.role);
        } else {
            setUserRole('not-logged-in');
        }
    };

    const fetchVentures = async () => {
        try {
            const { data, error } = await supabase
                .from('ventures')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('Fetched Ventures:', data);
            setVentures(data || []);
        } catch (error) {
            console.error('Error fetching ventures:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (selectedVenture) {
            setVsmNotes(selectedVenture.vsm_notes || '');
            setProgram(selectedVenture.program_recommendation || '');
            setInternalComments(selectedVenture.internal_comments || '');
            setAnalysisResult(null); // Reset analysis on change
        }
    }, [selectedVenture]);

    const handleSave = async () => {
        if (!selectedVenture) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('ventures')
                .update({
                    vsm_notes: vsmNotes,
                    program_recommendation: program,
                    internal_comments: internalComments,
                    status: 'Under Review' // Auto-update status
                })
                .eq('id', selectedVenture.id);

            if (error) throw error;

            // Update local state
            setVentures(prev => prev.map(v =>
                v.id === selectedVenture.id
                    ? { ...v, vsm_notes: vsmNotes, program_recommendation: program, internal_comments: internalComments, status: 'Under Review' }
                    : v
            ));

            alert('Assessment saved successfully!');
        } catch (error: any) {
            console.error('Error saving:', error);
            alert('Failed to save assessment: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const runAIAnalysis = () => {
        setAnalyzing(true);
        // Simulate API call
        setTimeout(() => {
            setAnalysisResult({
                recommendation: 'Accelerate Core',
                summary: `With ${selectedVenture?.growth_current?.revenue || 'existing'} revenue, ${selectedVenture?.name} fits the 5-25 Cr bracket perfectly. The pivot from a local model to an international AI Supply Chain OS requires the high-level scaling strategies and geographic expansion support characteristic of the Core program.`,
                context: "Market Context: The Southeast Asian logistics market is undergoing rapid digital transformation driven by the 'China Plus One' strategy, creating high demand for supply chain visibility. However, the region is highly fragmented, requiring localized AI models and deep integration capabilities to compete with established incumbents.",
                strengths: [
                    "Proven revenue generation indicates a history of building products that customers are willing to pay for.",
                    "Internal team size provides a significant technical foundation to accelerate the development of the AI-driven prototype.",
                    "Validation through beta customers demonstrates initial feasibility and early-stage interest in the new OS pivot.",
                    "Transitioning leverage existing domain expertise in enterprise resource management.",
                    "Targeting Southeast Asia aligns with global trade shifts and high growth in cross-border logistics technology."
                ],
                risks: [
                    "Extreme geographic risk in pivoting to Southeast Asia without a local presence or established regional network.",
                    "Potential resource dilution where the team may struggle to maintain legacy business while building a new AI platform.",
                    "Low capital reserves relative to the scale of the pivot may be insufficient for international market entry.",
                    "High competition from well-funded Silicon Valley and Singapore-based logistics startups.",
                    "Risk of 'Feature Creep' as the founder moves from a structured ERP model to a more complex, predictive AI-driven OS."
                ],
                questions: [
                    "What specific regulatory or logistical nuances of the Southeast Asian market have been incorporated into your AI prototype?",
                    "How do you plan to balance the R&D costs of the new OS without compromising the service levels of your current revenue-generating ERP?",
                    "What is the CAC (Customer Acquisition Cost) estimate for an Enterprise Logistics client in SEA compared to your historical SME data?",
                    "Can you demonstrate a clear technical roadmap for how your team will transition from traditional coding to advanced AI/ML development?",
                    "Are your two beta customers committed to long-term enterprise contracts, or are they temporary pilot programs without a clear path to monetization?"
                ]
            });
            setAnalyzing(false);
        }, 2000);
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-140px)]">

            {/* Left Panel: Venture List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 bg-gray-50 top-0 sticky z-10">
                    <h2 className="font-semibold text-gray-700">New Applications ({ventures.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading...</div>
                    ) : ventures.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>No applications found.</p>
                            <p className="text-xs mt-2 text-gray-300">Current Role: {userRole}</p>
                            {userRole === 'entrepreneur' && (
                                <p className="text-xs text-red-400 mt-1">
                                    Warning: You are logged in as an 'entrepreneur'. You can only see your own ventures.
                                    Please log in as a 'success_mgr' to see all submissions.
                                </p>
                            )}
                            {userRole === 'not-logged-in' && (
                                <div className="mt-4">
                                    <p className="text-xs text-red-400 mb-2">You are not logged in.</p>
                                    <Button onClick={() => window.location.href = '/login'} className="w-auto px-4 py-2 text-xs">
                                        Back to Login
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        ventures.map(v => (
                            <div
                                key={v.id}
                                onClick={() => { setSelectedVenture(v); setAnalysisResult(null); }}
                                className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 group ${selectedVenture?.id === v.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{v.name}</h3>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{v.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{v.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>{new Date(v.created_at).toLocaleDateString()}</span>
                                    {selectedVenture?.id === v.id && <ChevronRight className="w-4 h-4 text-blue-600" />}
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
                        {/* Header Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-gray-900">{selectedVenture.name}</h2>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-medium">SaaS</span>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Growth Pivot</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {selectedVenture.growth_current?.product} <span className="text-gray-400">→</span> {selectedVenture.growth_target?.product}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase">Business Stats</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        Rev: {selectedVenture.growth_current?.revenue} <span className="mx-2">|</span> Opp: {selectedVenture.growth_target?.revenue}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* AI Deep Dive Section */}
                        <div className="border border-blue-100 rounded-xl overflow-hidden">
                            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-blue-900">Gemini AI Deep Dive</h3>
                            </div>

                            {!analysisResult ? (
                                <div className="p-12 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Generate Deep Dive Analysis</h4>
                                    <p className="text-gray-500 max-w-md mb-6">
                                        Analyze sector trends, product pivot viability, and identify key strengths & risks using our AI engine.
                                    </p>
                                    <Button onClick={runAIAnalysis} disabled={analyzing} className="w-auto px-8">
                                        {analyzing ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing...
                                            </span>
                                        ) : (
                                            "Run Analysis"
                                        )}
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 space-y-6 bg-white animate-in fade-in duration-500">
                                    {/* Recommendation */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recommendation</span>
                                            <p className="mt-1 text-gray-600 leading-relaxed text-sm">
                                                {analysisResult.summary}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-400 italic">
                                                {analysisResult.context}
                                            </p>
                                        </div>
                                        <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded text-xs whitespace-nowrap">
                                            {analysisResult.recommendation}
                                        </span>
                                    </div>

                                    {/* Flags Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Green Flags */}
                                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                            <div className="flex items-center gap-2 mb-3 text-green-800 font-bold text-sm">
                                                <CheckCircle className="w-4 h-4" />
                                                <span>5 Green Flags (Strengths)</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {analysisResult.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-xs text-green-900 leading-relaxed">
                                                        <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-green-600/[0.5]" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Red Flags */}
                                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                            <div className="flex items-center gap-2 mb-3 text-red-800 font-bold text-sm">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>5 Red Flags (Risks)</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {analysisResult.risks.map((s: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-xs text-red-900 leading-relaxed">
                                                        <XCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-600/[0.5]" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Probing Questions */}
                                    <div className="bg-blue-50/30 rounded-xl p-5 border border-blue-100">
                                        <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold text-sm">
                                            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">?</span>
                                            <span>VSM Probing Questions</span>
                                        </div>
                                        <ul className="space-y-2">
                                            {analysisResult.questions.map((q: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-blue-900">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-300 border border-blue-100 shadow-sm">{i + 1}</span>
                                                    <span>{q}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button variant="outline" onClick={() => setAnalysisResult(null)} className="text-xs h-8">
                                            Regenerate Analysis
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Triage & Notes */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-xs">✓</span>
                                Triage & Notes
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Founder Call Transcript / Notes</label>
                                <textarea
                                    className="w-full h-32 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Paste interview notes here..."
                                    value={vsmNotes}
                                    onChange={(e) => setVsmNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Select
                                        label="Recommended Program"
                                        options={[
                                            { label: 'Accelerate Prime', value: 'Accelerate Prime' },
                                            { label: 'Accelerate Core', value: 'Accelerate Core' },
                                            { label: 'Accelerate Select', value: 'Accelerate Select' },
                                            { label: 'Reject', value: 'Reject' },
                                        ]}
                                        value={program}
                                        onChange={setProgram}
                                        placeholder="Select Program..."
                                    />
                                </div>
                                <div className="flex-[2] space-y-2">
                                    <label className="text-xs font-medium text-gray-500 uppercase">Internal Comments</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Final recommendation notes..."
                                        value={internalComments}
                                        onChange={(e) => setInternalComments(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Submit to Committee'}</Button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Component required for lucid-react LayoutDashboard icon usage in this file */}
            <div className="hidden">
                <LayoutDashboard />
            </div>
        </div>
    );
};
