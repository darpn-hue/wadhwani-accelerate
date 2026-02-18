import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Mic, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StatusSelect } from '../components/StatusSelect';

// Steps configuration - matching the reference screens exactly
const STEPS = [
    { id: 1, label: 'BUSINESS' },
    { id: 2, label: 'VENTURE' },
    { id: 3, label: 'STATUS' },
    { id: 4, label: 'SUPPORT' },
];

// Workstreams for Step 3 - matching the reference screen
const WORKSTREAMS = [
    'Product',
    'GTM',
    'Funding',
    'SupplyChain',
    'Operations',
    'Team',
];

// Tooltip content per workstream — warm, founder-friendly guidance
const WORKSTREAM_INFO: Record<string, { tagline: string; deliverables: string[] }> = {
    Product: {
        tagline: 'This is about your product or service 👇',
        deliverables: [
            'Think about what you\'re selling and to whom',
            'Is your product/service ready, or still in development?',
            'What makes it better or different from others?',
            'Have you tested it with real customers yet?',
            'Do you have a clear plan to grow or improve it?',
        ],
    },
    GTM: {
        tagline: 'GTM = how you find & win customers 👇',
        deliverables: [
            'Think about how you currently get new customers',
            'Do you sell directly, through agents, or online?',
            'Is your sales process working, or feeling stuck?',
            'Do you know exactly who your best customer is?',
            'Do you have a plan to reach more customers this year?',
        ],
    },
    Funding: {
        tagline: 'This is about your money & finances 👇',
        deliverables: [
            'Think about whether your business is making money yet',
            'Do you know your monthly income and expenses clearly?',
            'Have you taken any loans or outside investment?',
            'Do you need money to grow — and how much?',
            'Do you have a basic financial plan for the next year?',
        ],
    },
    SupplyChain: {
        tagline: 'This is about getting & delivering your product 👇',
        deliverables: [
            'Think about where you get your raw materials or stock',
            'Is your supply reliable, or do you face shortages?',
            'How do you deliver your product to customers?',
            'Are your delivery costs under control?',
            'Do you have trusted suppliers you can count on?',
        ],
    },
    Operations: {
        tagline: 'This is about how your business runs daily 👇',
        deliverables: [
            'Think about how smoothly your day-to-day work runs',
            'Are there tasks that keep breaking down or causing delays?',
            'Do you track your sales, costs, and output regularly?',
            'Is your team clear on who does what?',
            'Are you spending too much time on things that could be automated?',
        ],
    },
    Team: {
        tagline: 'This is about the people in your business 👇',
        deliverables: [
            'Think about who is helping you run the business today',
            'Are there key roles you urgently need to fill?',
            'Is your team motivated and clear on their goals?',
            'Do you struggle to find or keep good people?',
            'Do you have a plan to grow your team as the business grows?',
        ],
    },
};

type GrowthType = 'product' | 'segment' | 'geography';

export const NewApplication: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedGrowthTypes, setSelectedGrowthTypes] = useState<GrowthType[]>([]);

    // Form State - matching all fields from the 4 screens
    const [formData, setFormData] = useState({
        // Step 1: Business
        businessName: '',
        managingDirector: '',
        whatDoYouSell: '',
        whoDoYouSellTo: '',
        whichRegions: '',

        // Step 2: Venture
        growthFocus: [] as GrowthType[],
        focusProduct: '',
        focusSegment: '',
        focusGeography: '',
        revenuePotential12m: '',
        requestedInvestmentLimit: '',
        incrementalHiring: '',
        city: '',
        state: '',
        companyType: '',
        referredBy: '',

        // Step 3: Status
        workstreamStatuses: WORKSTREAMS.map(w => ({ stream: w, status: 'Not started' })),
        detailedStatusOverview: '',

        // Step 4: Support
        specificSupportRequired: '',
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateWorkstreamStatus = (index: number, status: string) => {
        const updated = [...formData.workstreamStatuses];
        updated[index] = { ...updated[index], status };
        setFormData(prev => ({ ...prev, workstreamStatuses: updated }));
    };

    const toggleGrowthType = (type: GrowthType) => {
        const updated = selectedGrowthTypes.includes(type)
            ? selectedGrowthTypes.filter(t => t !== type)
            : [...selectedGrowthTypes, type];
        setSelectedGrowthTypes(updated);
        setFormData(prev => ({ ...prev, growthFocus: updated }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            // 1. Create Venture via API
            const { venture } = await api.createVenture({
                name: formData.businessName,
                founder_name: formData.managingDirector,
                program: 'Accelerate',
                growth_current: {
                    product: formData.whatDoYouSell,
                    segment: formData.whoDoYouSellTo,
                    geography: formData.whichRegions,
                },
                growth_focus: formData.growthFocus.join(','),
                commitment: {
                    investment: formData.requestedInvestmentLimit,
                    incrementalHiring: formData.incrementalHiring,
                    revenuePotential: formData.revenuePotential12m,
                },
                blockers: formData.detailedStatusOverview,
                support_request: formData.specificSupportRequired,
            });

            // 2. Create Venture Streams via API
            for (const ws of formData.workstreamStatuses) {
                await api.createStream(venture.id, {
                    stream_name: ws.stream,
                    status: ws.status,
                });
            }

            // 3. Submit the venture
            await api.submitVenture(venture.id);

            setIsSubmitted(true);
        } catch (err) {
            console.error('Error submitting application:', err);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    // ─── Success Screen ───────────────────────────────────────────────────────
    if (isSubmitted) {
        return (
            <div className="max-w-xl mx-auto pt-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
                    <p className="text-gray-500">
                        Thank you for applying. Your venture details are now with our Venture Success Managers. We will review your application and get back to you shortly.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4 text-left text-sm space-y-2 text-blue-800">
                        <div className="font-semibold">What happens next?</div>
                        <ul className="list-disc list-inside pl-1 space-y-1 text-blue-700">
                            <li>Initial Screening by Venture Success Manager</li>
                            <li>Committee Review (for advanced tiers)</li>
                            <li>Agreement Generation</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 px-6 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Return to My Ventures
                    </button>
                </div>
            </div>
        );
    }

    // ─── Step Header ─────────────────────────────────────────────────────────
    const stepTitles: Record<number, string> = {
        1: 'DESCRIBE YOUR CURRENT BUSINESS',
        2: 'TELL US ABOUT YOUR GROWTH VENTURE',
        3: 'WHICH AREAS DO YOU NEED SUPPORT WITH?',
        4: 'TELL US WHAT TYPE OF HELP YOU ARE LOOKING FOR',
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-16">

            {/* ── Page Header (Step 2+ shows title + Save Draft) */}
            {currentStep >= 2 && (
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                        Accelerate Application
                    </h1>
                    <button className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        SAVE DRAFT
                    </button>
                </div>
            )}

            {/* ── Step Progress Bar ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center">
                    {STEPS.map((step, idx) => {
                        const isCompleted = step.id < currentStep;
                        const isActive = step.id === currentStep;
                        return (
                            <React.Fragment key={step.id}>
                                <div
                                    className={`flex flex-col items-center gap-1.5 flex-1 py-2 px-3 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border-2 border-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span
                                        className={`text-[10px] font-bold tracking-widest ${isCompleted
                                            ? 'text-green-600'
                                            : isActive
                                                ? 'text-blue-600'
                                                : 'text-gray-400'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className="w-px h-8 bg-gray-200 mx-1" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* ── Step Content Card ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                {/* Step Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {currentStep}
                    </div>
                    <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">
                        {stepTitles[currentStep]}
                    </h2>
                </div>

                {/* ── STEP 1: BUSINESS ─────────────────────────────────────── */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        {/* Business Name */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Business Name
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                placeholder="Enter registered business name"
                                value={formData.businessName}
                                onChange={e => updateField('businessName', e.target.value)}
                            />
                        </div>

                        {/* Your Role in the Business */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Your Role in the Business
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                placeholder="E.g., Owner, Managing Director, CEO..."
                                value={formData.managingDirector}
                                onChange={e => updateField('managingDirector', e.target.value)}
                            />
                        </div>

                        {/* What do you sell? */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    What do you sell?
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                placeholder="Describe your current products and services..."
                                value={formData.whatDoYouSell}
                                onChange={e => updateField('whatDoYouSell', e.target.value)}
                            />
                        </div>

                        {/* Who do you sell to? */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Who do you sell to?
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                placeholder="Describe your customer segments..."
                                value={formData.whoDoYouSellTo}
                                onChange={e => updateField('whoDoYouSellTo', e.target.value)}
                            />
                        </div>

                        {/* Which regions do you sell to? */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Which regions do you sell to?
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                placeholder="Describe the geographies and regions you cover..."
                                value={formData.whichRegions}
                                onChange={e => updateField('whichRegions', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ── STEP 2: VENTURE ──────────────────────────────────────── */}
                {currentStep === 2 && (
                    <div className="space-y-8">
                        {/* Growth type question */}
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Is your venture delivering a new product/service or targeting a new segment or looking to enter a new geography?
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {([
                                    { key: 'product' as GrowthType, label: 'NEW PRODUCT/SERVICE' },
                                    { key: 'segment' as GrowthType, label: 'NEW SEGMENT' },
                                    { key: 'geography' as GrowthType, label: 'NEW GEOGRAPHY' },
                                ]).map(({ key, label }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => toggleGrowthType(key)}
                                        className={`px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${selectedGrowthTypes.includes(key)
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Conditional textareas — appear when toggle is selected */}
                            {selectedGrowthTypes.includes('product') && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Describe the New Product/Service
                                        </label>
                                        <Mic className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <textarea
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                        placeholder="Detail the technical or service innovation..."
                                        value={formData.focusProduct}
                                        onChange={e => updateField('focusProduct', e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedGrowthTypes.includes('segment') && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Describe the Target Segment
                                        </label>
                                        <Mic className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <textarea
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                        placeholder="Who is the ideal customer for this expansion?"
                                        value={formData.focusSegment}
                                        onChange={e => updateField('focusSegment', e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedGrowthTypes.includes('geography') && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            Describe the Target Geography
                                        </label>
                                        <Mic className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <textarea
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[110px] resize-none"
                                        placeholder="List the specific regions or countries..."
                                        value={formData.focusGeography}
                                        onChange={e => updateField('focusGeography', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Revenue Potential */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Projected Revenue Potential (12M)
                            </label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                value={formData.revenuePotential12m}
                                onChange={e => updateField('revenuePotential12m', e.target.value)}
                            >
                                <option value="" disabled>Choose</option>
                                <option value=">75Cr">&gt;75Cr</option>
                                <option value="25Cr-75Cr">25Cr - 75Cr</option>
                                <option value="5Cr-25Cr">5Cr - 25Cr</option>
                                <option value="1-5Cr">1 - 5Cr</option>
                                <option value="Pre-Revenue">Pre-Revenue</option>
                            </select>
                        </div>

                        {/* City + State row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    City
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="E.g., Mumbai"
                                    value={formData.city}
                                    onChange={e => updateField('city', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    State
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    placeholder="E.g., Maharashtra"
                                    value={formData.state}
                                    onChange={e => updateField('state', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Company Type */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Company Type
                            </label>
                            <select
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                value={formData.companyType}
                                onChange={e => updateField('companyType', e.target.value)}
                            >
                                <option value="" disabled>Select company type...</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Services">Services</option>
                                <option value="Consumer/D2C">Consumer / D2C</option>
                                <option value="Trading">Trading</option>
                                <option value="Startups">Startups</option>
                            </select>
                        </div>

                        {/* Referred By Partner */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Referred By Which Partner
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                placeholder="E.g., Wadhwani Foundation, SIDBI..."
                                value={formData.referredBy}
                                onChange={e => updateField('referredBy', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ── STEP 3: STATUS ───────────────────────────────────────── */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        {/* Workstream table */}
                        <div>
                            {/* Header row */}
                            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workstream</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</span>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-100">
                                {formData.workstreamStatuses.map((ws, idx) => (
                                    <div key={ws.stream} className="grid grid-cols-2 gap-4 items-center py-4">
                                        {/* Workstream name + info tooltip */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">{ws.stream}</span>
                                            <div className="relative group">
                                                <Info className="w-3.5 h-3.5 text-gray-300 hover:text-blue-500 cursor-help transition-colors" />
                                                {/* Tooltip */}
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block w-64 pointer-events-none">
                                                    <div className="bg-gray-900 text-white rounded-xl p-3.5 shadow-2xl">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                                                            {WORKSTREAM_INFO[ws.stream]?.tagline}
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {WORKSTREAM_INFO[ws.stream]?.deliverables.map((d, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                                    <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                                                                    {d}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {/* Arrow */}
                                                        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-900 rotate-45" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <StatusSelect
                                            status={ws.status}
                                            onChange={newStatus => updateWorkstreamStatus(idx, newStatus)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detailed Status Overview */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Detailed Status Overview
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[120px] resize-none"
                                placeholder="Summarize key milestones reached and any current blockers..."
                                value={formData.detailedStatusOverview}
                                onChange={e => updateField('detailedStatusOverview', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ── STEP 4: SUPPORT ──────────────────────────────────────── */}
                {currentStep === 4 && (
                    <div className="space-y-6">
                        {/* Specific Support Required */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    Specific Support Required
                                </label>
                                <Mic className="w-4 h-4 text-gray-300" />
                            </div>
                            <textarea
                                className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:border-solid focus:bg-white transition-all min-h-[200px] resize-none"
                                placeholder="E.g., Mentorship in Go-to-Market, Networking with APAC hubs, Technical Advisory for cloud scaling..."
                                value={formData.specificSupportRequired}
                                onChange={e => updateField('specificSupportRequired', e.target.value)}
                            />
                        </div>

                        {/* Info box */}
                        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700">
                                Be as specific as possible. Our ecosystem support model is designed to deploy targeted interventions based on the granularity of your requests here.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer Navigation ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-1">
                {/* Previous Step */}
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    PREVIOUS STEP
                </button>

                {/* Cancel */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                    CANCEL
                </button>

                {/* Next / Submit */}
                <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : currentStep === 4 ? (
                        <>
                            SUBMIT APPLICATION
                            <Check className="w-4 h-4" />
                        </>
                    ) : (
                        <>
                            NEXT: {STEPS[currentStep].label}
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
