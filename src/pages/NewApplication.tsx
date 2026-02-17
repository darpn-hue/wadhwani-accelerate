import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, Mic } from 'lucide-react';
import { Button } from '../components/ui/Button';
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

export const NewApplication: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDescriptionTypes, setSelectedDescriptionTypes] = useState<('product' | 'segment' | 'geography')[]>([]);

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
                founder_name: formData.founderName, // NEW: Store founder name
                description: `${formData.whatDoYouSell} • ${formData.whoDoYouSellTo}`,
                location: formData.regionsCovered,
                city: formData.city,
                revenue_12m: formData.currentRevenue,
                full_time_employees: formData.teamSize,
                program: 'Accelerate',
                status: 'Submitted',

                growth_focus: formData.growthFocus, // Tracked from toggle buttons
                revenue_potential_3y: formData.revenuePotential,
                min_investment: formData.investment,
                incremental_hiring: formData.incrementalHiring,

                blockers: formData.blockers,
                support_request: formData.supportRequest,

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
                        <div className="font-semibold">
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
                                <h2 className="text-2xl font-bold text-gray-900">Business</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">REGISTERED COMPANY NAME</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Punjab Exports Pvt Ltd"
                                        value={formData.ventureName}
                                        onChange={(e) => updateField('ventureName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">OWNER NAME</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Rajesh Kumar"
                                        value={formData.founderName}
                                        onChange={(e) => updateField('founderName', e.target.value)}
                                    />
                                </div>
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
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">WHICH REGIONS DO YOU SELL IN?</span>
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CITY OF OPERATION</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Ludhiana"
                                        value={formData.city}
                                        onChange={(e) => updateField('city', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">REVENUE (LAST 12 MONTHS)</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., ₹2 Crores"
                                        value={formData.currentRevenue}
                                        onChange={(e) => updateField('currentRevenue', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">FULL-TIME EMPLOYEES</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 15 employees"
                                        value={formData.teamSize}
                                        onChange={(e) => updateField('teamSize', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Venture</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-base font-bold text-gray-900">Is the growth venture about a new product, new segment, or new geography?</p>
                                </div>

                                {/* Selection Buttons */}
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newTypes = selectedDescriptionTypes.includes('product')
                                                ? selectedDescriptionTypes.filter(t => t !== 'product')
                                                : [...selectedDescriptionTypes, 'product'] as ('product' | 'segment' | 'geography')[];
                                            setSelectedDescriptionTypes(newTypes);
                                            updateField('growthFocus', newTypes.join(','));
                                        }}
                                        className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${selectedDescriptionTypes.includes('product')
                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        New Product
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newTypes = selectedDescriptionTypes.includes('segment')
                                                ? selectedDescriptionTypes.filter(t => t !== 'segment')
                                                : [...selectedDescriptionTypes, 'segment'] as ('product' | 'segment' | 'geography')[];
                                            setSelectedDescriptionTypes(newTypes);
                                            updateField('growthFocus', newTypes.join(','));
                                        }}
                                        className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${selectedDescriptionTypes.includes('segment')
                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        New Segment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newTypes = selectedDescriptionTypes.includes('geography')
                                                ? selectedDescriptionTypes.filter(t => t !== 'geography')
                                                : [...selectedDescriptionTypes, 'geography'] as ('product' | 'segment' | 'geography')[];
                                            setSelectedDescriptionTypes(newTypes);
                                            updateField('growthFocus', newTypes.join(','));
                                        }}
                                        className={`px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${selectedDescriptionTypes.includes('geography')
                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        New Geography
                                    </button>
                                </div>

                                {/* Conditional Text Areas */}
                                {selectedDescriptionTypes.includes('product') && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIBE THE NEW PRODUCT</span>
                                            <Mic className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <textarea
                                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-shadow"
                                            placeholder="Detail the technical or service innovation..."
                                            value={formData.focusProduct}
                                            onChange={(e) => updateField('focusProduct', e.target.value)}
                                        />
                                    </div>
                                )}

                                {selectedDescriptionTypes.includes('segment') && (
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
                                )}

                                {selectedDescriptionTypes.includes('geography') && (
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
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">PROJECTED REVENUE (YEAR 3)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., ₹10 Crores"
                                    value={formData.revenuePotential}
                                    onChange={(e) => updateField('revenuePotential', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">MINIMUM INVESTMENT REQUIRED</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., ₹50 Lakhs"
                                    value={formData.investment}
                                    onChange={(e) => updateField('investment', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">INCREMENTAL HIRING NEEDED</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 5-10 new employees"
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
                                        <span className="font-medium text-gray-900">{stream}</span>

                                        <div className="w-[200px]">
                                            <StatusSelect
                                                status={formData.needs[idx].status}
                                                onChange={(newStatus) => updateNeedStatus(idx, newStatus)}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-4 space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">SPECIFIC BLOCKERS OR CHALLENGES</label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                                        placeholder="e.g., Limited working capital, difficulty hiring skilled workers, supply chain delays..."
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
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">DETAILED SUPPORT REQUEST</label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[200px]"
                                        placeholder="e.g., Need help with financial modeling for investor pitch, require mentorship on scaling operations, seeking connections with potential distributors..."
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
        </div >
    );
};
