import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Info, Loader2, Mic } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

import { StatusSelect } from '../components/StatusSelect';

// Steps configuration
const STEPS = [
    { id: 1, title: 'Business' },
    { id: 2, title: 'Venture' },
    { id: 3, title: 'Status' },
    { id: 4, title: 'Support' }
];

const STREAMS = [
    'Money & Capital',
    'Product & Strategy',
    'People & Team',
    'Operations',
    'Go-To-Market',
    'Supply Chain'
];

const STREAM_MILESTONES: Record<string, { title: string; description: string }[]> = {
    'Product & Strategy': [
        { title: 'Core API Specs', description: 'Technical specifications for public and internal endpoints.' },
        { title: 'UI Design System', description: 'Global Figma library and component standards.' },
        { title: 'V1.2 Integration', description: 'Middleware bridge for legacy data retrofitting.' },
        { title: 'Infrastructure', description: 'Multi-region cloud deployment strategy.' },
        { title: 'Unit Testing', description: 'Standardized QA suite for core services.' },
        { title: 'Security Audit', description: 'Third-party penetration testing and compliance.' },
    ],
    'Go-To-Market': [
        { title: 'ICP Definition', description: 'Detailed profile of high-value manufacturing clients.' },
        { title: 'Distribution', description: 'Partner channel mapping and commission structures.' },
        { title: 'Referral Program', description: 'Incentive model for existing customer advocacy.' },
        { title: 'Partner Ecosystem', description: 'Integration directory for third-party providers.' },
        { title: 'Pricing Strategy', description: 'Tiered subscription and volume discount model.' },
        { title: 'Sales Launch', description: 'Regional enablement kit for direct sales teams.' },
    ],
    'Money & Capital': [
        { title: 'Series A Pitch', description: 'Updated narrative for institutional growth rounds.' },
        { title: 'Financial Metrics', description: 'Historical performance and 24-month projections.' },
        { title: 'Data Room', description: 'Encrypted document repository for due diligence.' },
        { title: 'Investor Outreach', description: 'CRM tracking for potential VC partners.' },
        { title: 'Financial Model', description: 'Excel-based dynamic budget and burn calculator.' },
        { title: 'Exit Strategy', description: 'M&A landscape analysis and valuation benchmarks.' },
    ],
    'Supply Chain': [
        { title: 'Lead Time Gap', description: 'Analysis of hardware delays vs scaling targets.' },
        { title: 'Vendor Review', description: 'Quarterly performance scorecard for key suppliers.' },
        { title: 'Inventory Forecast', description: 'AI-driven predictive stock requirements.' },
        { title: 'Logistics Audit', description: 'Freight cost optimization and route analysis.' },
        { title: 'Compliance Review', description: 'Regulatory certification status for global trade.' },
        { title: 'Safety Stock', description: 'Buffering strategy for mission-critical components.' },
    ],
    'Operations': [
        { title: 'ERP Integration', description: 'Centralized management of ops and finance.' },
        { title: 'Team Training', description: 'Internal platform for onboarding new staff.' },
        { title: 'Automation', description: 'Standardization of routine warehouse tasks.' },
        { title: 'Office Expansion', description: 'Real estate planning for the EMEA headquarters.' },
        { title: 'Compliance Audit', description: 'Internal review of data privacy and safety.' },
        { title: 'Disaster Recovery', description: 'Backup protocols and emergency business plan.' },
    ],
    'People & Team': [
        { title: 'Hiring Handbook', description: 'Standardized interview and offer procedures.' },
        { title: 'Appraisal Framework', description: 'Semi-annual performance review methodology.' },
        { title: 'Individual Metrics', description: 'KPI dashboards for all department leads.' },
        { title: 'Equity Program', description: 'Option pool allocation and vesting schedules.' },
        { title: 'Culture Workshop', description: 'Mission alignment for remote global teams.' },
        { title: 'Benefits Overhaul', description: 'Comparison study of regional health plans.' },
    ],
};

export const NewApplication: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Business
        ventureName: '',
        founderName: '',
        whatDoYouSell: '',
        whoDoYouSellTo: '',
        regionsCovered: '',
        city: '',
        currentRevenue: '',
        teamSize: '', // Moved from Step 2 to Step 1

        // Step 2: Venture
        growthFocus: '', // New field: Product, Segment, Geography
        revenuePotential: '', // New field: revenue_potential_3y
        investment: '',
        incrementalHiring: '', // New field: incremental_hiring
        // Detailed breakdowns for each focus area
        focusProduct: '',
        focusSegment: '',
        focusGeography: '',

        // Step 3: Status
        needs: STREAMS.map(s => ({ stream: s, status: 'No help needed' })), // Default updated
        blockers: '', // New field

        // Step 4: Support
        supportRequest: '' // New field
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNeedStatus = (streamIndex: number, status: string) => {
        const newNeeds = [...formData.needs];

        // Check constraint if selecting "Need deep support"
        if (status === 'Need deep support') {
            const currentNeedHelpCount = newNeeds.filter(n => n.status === 'Need deep support').length;
            // If we are changing TO 'Need deep support' and we already have 3 (and this one isn't currently it)
            if (currentNeedHelpCount >= 3 && newNeeds[streamIndex].status !== 'Need deep support') {
                alert('You can only select up to 3 "Need deep support" items.');
                return;
            }
        }

        newNeeds[streamIndex].status = status;
        setFormData(prev => ({ ...prev, needs: newNeeds }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { data: venture, error } = await supabase.from('ventures').insert({
                user_id: user.id,
                name: formData.ventureName,
                description: `${formData.whatDoYouSell} • ${formData.whoDoYouSellTo}`,
                location: formData.regionsCovered,
                city: formData.city, // New mapped field
                revenue_12m: formData.currentRevenue, // New mapped field
                full_time_employees: formData.teamSize, // New mapped field
                program: 'Accelerate', // Default assignment logic
                status: 'Submitted',

                growth_focus: formData.growthFocus, // New mapped field
                revenue_potential_3y: formData.revenuePotential, // New mapped field
                min_investment: formData.investment, // New mapped field
                incremental_hiring: formData.incrementalHiring, // New mapped field

                blockers: formData.blockers, // New mapped field
                support_request: formData.supportRequest, // New mapped field

                growth_current: {
                    // Storing structured data in JSONB as backup/searchable extras
                    product: formData.whatDoYouSell,
                    segment: formData.whoDoYouSellTo,
                    geography: formData.regionsCovered,
                },
                growth_target: {
                    product: formData.focusProduct,
                    segment: formData.focusSegment,
                    geography: formData.focusGeography
                }, // Storing details for all potential growth areas
                commitment: {
                    // Keeping legacy structure for compatibility if needed, but main data is now in columns
                    investment: formData.investment,
                    teamSize: formData.teamSize
                }
            })
                .select()
                .single();

            if (error) throw error;

            // 2. Insert Venture Streams (Needs)
            // Map the needs array to the new table structure
            const streamsToInsert = formData.needs.map(need => ({
                venture_id: venture.id,
                stream_name: need.stream,
                status: need.status, // Directly store the string from StatusSelect
                owner: 'Founder',
                updated_at: new Date().toISOString()
            }));

            const { error: streamsError } = await supabase
                .from('venture_streams')
                .insert(streamsToInsert);

            if (streamsError) throw streamsError;

            // 3. Initialize Support Hours
            const { error: hoursError } = await supabase
                .from('support_hours')
                .insert({
                    venture_id: venture.id,
                    allocated: 15,
                    used: 0
                });

            if (hoursError) console.error("Error creating support hours:", hoursError);
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
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

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
                        <div className="font-semibold flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            What happens next?
                        </div>
                        <ul className="list-disc list-inside pl-1 space-y-1 text-blue-700">
                            <li>Initial Screening by Venture Success Manager</li>
                            <li>Committee Review (for advanced tiers)</li>
                            <li>Agreement Generation</li>
                        </ul>
                    </div>

                    <Button onClick={() => navigate('/dashboard')} className="w-full">
                        Return to My Ventures
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
                <div
                    className="absolute top-1/2 left-0 h-1 bg-red-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="flex justify-between">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step.id <= currentStep
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white border-2 border-gray-200 text-gray-400'
                                    }`}
                            >
                                {step.id}
                            </div>
                            <span className={`text-xs font-medium ${step.id <= currentStep ? 'text-red-600' : 'text-gray-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Wizard Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[500px] flex flex-col">

                <div className="flex-1 space-y-8">
                    {currentStep === 1 && (
                        <>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Describe Your Venture</h2>
                                <p className="text-gray-500">To qualify, you must demonstrate a growth trajectory (New Product, Segment, Geo, or Model).</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Venture Name *"
                                    placeholder="e.g. Punjab Exports"
                                    value={formData.ventureName}
                                    onChange={(e) => updateField('ventureName', e.target.value)}
                                />
                                <Input
                                    label="Founder Name *"
                                    placeholder=""
                                    value={formData.founderName}
                                    onChange={(e) => updateField('founderName', e.target.value)}
                                />
                            </div>

                            {/* Industry Field Removed as per new requirement */}


                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WHAT DO YOU SELL?</span>
                                    <div className="relative">
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Describe your current products and services..."
                                            value={formData.whatDoYouSell}
                                            onChange={(e) => updateField('whatDoYouSell', e.target.value)}
                                        />
                                        <Mic className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WHO DO YOU SELL TO?</span>
                                    <div className="relative">
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Describe your customer segments..."
                                            value={formData.whoDoYouSellTo}
                                            onChange={(e) => updateField('whoDoYouSellTo', e.target.value)}
                                        />
                                        <Mic className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WHICH REGIONS DO YOU SELL TO?</span>
                                    <div className="relative">
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                            placeholder="Describe the geographies and regions you cover..."
                                            value={formData.regionsCovered}
                                            onChange={(e) => updateField('regionsCovered', e.target.value)}
                                        />
                                        <Mic className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="City of Operation"
                                    placeholder="e.g. Ludhiana"
                                    value={formData.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                />
                                <Input
                                    label="Revenue in Last 12 Months"
                                    placeholder="e.g. 2 Crores"
                                    value={formData.currentRevenue}
                                    onChange={(e) => updateField('currentRevenue', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Number of Full-Time Employees"
                                    placeholder="e.g. 15"
                                    value={formData.teamSize}
                                    onChange={(e) => updateField('teamSize', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Venture Details</h2>
                                <p className="text-gray-500">Tell us about your growth plans and investment potential.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Growth Venture Focus</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['New Product', 'New Segment', 'New Geography'].map((focus) => (
                                            <button
                                                key={focus}
                                                type="button"
                                                onClick={() => updateField('growthFocus', focus)}
                                                className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${formData.growthFocus === focus
                                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                                    }`}
                                            >
                                                {focus}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-6 mt-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIBE THE NEW PRODUCT/SERVICE</span>
                                                <Mic className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <textarea
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-shadow"
                                                placeholder="Detail the technical or service innovation..."
                                                value={formData.focusProduct}
                                                onChange={(e) => updateField('focusProduct', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIBE THE TARGET SEGMENT</span>
                                                <Mic className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <textarea
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-shadow"
                                                placeholder="Who is the ideal customer for this expansion?"
                                                value={formData.focusSegment}
                                                onChange={(e) => updateField('focusSegment', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIBE THE TARGET GEOGRAPHY</span>
                                                <Mic className="w-4 h-4 text-gray-300" />
                                            </div>
                                            <textarea
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-shadow"
                                                placeholder="List the specific regions or countries..."
                                                value={formData.focusGeography}
                                                onChange={(e) => updateField('focusGeography', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Projected Revenue by End of Year 3"
                                    placeholder="e.g. 10 Crores"
                                    value={formData.revenuePotential}
                                    onChange={(e) => updateField('revenuePotential', e.target.value)}
                                />

                                <Input
                                    label="Minimum Investment Amount"
                                    placeholder="e.g. 50 Lakhs"
                                    value={formData.investment}
                                    onChange={(e) => updateField('investment', e.target.value)}
                                />

                                <Input
                                    label="Incremental Hiring Expectation"
                                    placeholder="e.g. 5 new roles"
                                    value={formData.incrementalHiring}
                                    onChange={(e) => updateField('incrementalHiring', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="flex flex-col gap-2">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900">Status & Needs</h2>
                                    <p className="text-gray-500">For each stream, indicate the current status.</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                    We will be able to provide deep hands-on support for 3 of the options below. Please select <strong>"Need deep support"</strong> for your top 3 priorities.
                                </div>
                            </div>

                            <div className="space-y-2">
                                {STREAMS.map((stream, idx) => (
                                    <div key={stream} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-2 group relative">
                                            <span className="font-medium text-gray-900">{stream}</span>
                                            <Info className="w-4 h-4 text-gray-400 cursor-help" />

                                            {/* Tooltip */}
                                            <div className="absolute left-0 bottom-full mb-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-4 hidden group-hover:block z-20 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
                                                    {stream} Milestones
                                                </div>
                                                <div className="space-y-3">
                                                    {STREAM_MILESTONES[stream]?.map((milestone, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-blue-500`} />
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-900">{milestone.title}</div>
                                                                <div className="text-[10px] text-gray-500 leading-tight">{milestone.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Arrow */}
                                                <div className="absolute left-4 top-full w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45 -mt-1.5"></div>
                                            </div>
                                        </div>

                                        <div className="w-[200px]">
                                            <StatusSelect
                                                status={formData.needs[idx].status}
                                                onChange={(newStatus) => updateNeedStatus(idx, newStatus)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 space-y-2">
                                    <h3 className="text-sm font-medium text-gray-700">Any specific blockers?</h3>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                                        placeholder="Describe any immediate obstacles..."
                                        value={formData.blockers}
                                        onChange={(e) => updateField('blockers', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 4 && (
                        <>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Support Request</h2>
                                <p className="text-gray-500">How can the foundation specifically help you?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Detailed Support Needed</label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[200px]"
                                        placeholder="Please elaborate on the specific support you are requesting from the foundation..."
                                        value={formData.supportRequest}
                                        onChange={(e) => updateField('supportRequest', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1 || isSubmitting}
                        className="w-auto px-0 hover:bg-transparent hover:text-red-700 disabled:text-gray-300"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <Button onClick={handleNext} className="w-auto" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                {currentStep === 4 ? 'Submit Application' : 'Next'}
                                {currentStep !== 4 && <ArrowRight className="w-4 h-4 ml-2" />}
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
};
