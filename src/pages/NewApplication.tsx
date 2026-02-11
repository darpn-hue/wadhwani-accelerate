import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Info, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Steps configuration
const STEPS = [
    { id: 1, title: 'Define Venture' },
    { id: 2, title: 'Commitment' },
    { id: 3, title: 'Needs' },
];

// Status Options for Step 3
const STATUS_OPTIONS = ['Done', 'Work in Progress', 'Need Help'];
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

    // Form State
    const [formData, setFormData] = useState({
        // Step 1
        ventureName: '',
        founderName: '',
        currentProduct: '',
        currentCustomers: '',
        currentLocation: '',
        currentRevenue: '',

        newProduct: '',
        newSegment: '',
        newLocation: '',
        businessModel: '',
        expectedRevenue: '',

        // Step 2
        investment: '',
        teamSize: '',
        progress: '',

        // Step 3
        needs: STREAMS.map(s => ({ stream: s, status: 'Need Help' }))
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNeedStatus = (streamIndex: number, status: string) => {
        const newNeeds = [...formData.needs];
        newNeeds[streamIndex].status = status;
        setFormData(prev => ({ ...prev, needs: newNeeds }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('ventures').insert({
                user_id: user.id,
                name: formData.ventureName,
                description: `${formData.currentProduct} • ${formData.newLocation || formData.currentLocation}`,
                location: formData.currentLocation,
                program: 'Accelerate', // Default assignment logic
                status: 'Submitted',

                growth_current: {
                    product: formData.currentProduct,
                    segment: formData.currentCustomers,
                    geography: formData.currentLocation,
                    revenue: formData.currentRevenue,
                    business_model: formData.businessModel
                },
                growth_target: {
                    product: formData.newProduct,
                    segment: formData.newSegment,
                    geography: formData.newLocation,
                    revenue: formData.expectedRevenue
                },
                commitment: {
                    investment: formData.investment,
                    teamSize: formData.teamSize,
                    progress: formData.progress
                },
                needs: formData.needs
            });

            if (error) throw error;
            setIsSubmitted(true);
        } catch (err) {
            console.error('Error submitting application:', err);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 3) {
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
                            <li>Initial Screening by VSM</li>
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

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-700">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Change at least one of the 3 dimensions below (Product, Segment, Geo) to qualify as a "Growth Venture".</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current State</span>
                                    <Input placeholder="Current Product" value={formData.currentProduct} onChange={(e) => updateField('currentProduct', e.target.value)} />
                                    <Input placeholder="Current Customers" value={formData.currentCustomers} onChange={(e) => updateField('currentCustomers', e.target.value)} />
                                    <Input placeholder="Current Location" value={formData.currentLocation} onChange={(e) => updateField('currentLocation', e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">New / Target State</span>
                                    <Input placeholder="New Product Line" value={formData.newProduct} onChange={(e) => updateField('newProduct', e.target.value)} />
                                    <Input placeholder="New Target Segment" value={formData.newSegment} onChange={(e) => updateField('newSegment', e.target.value)} />
                                    <Input placeholder="Expansion Location" value={formData.newLocation} onChange={(e) => updateField('newLocation', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Current Annual Revenue" placeholder="e.g. 2 Crores" value={formData.currentRevenue} onChange={(e) => updateField('currentRevenue', e.target.value)} />
                                <Input label="Business Model" placeholder="How do you make money?" value={formData.businessModel} onChange={(e) => updateField('businessModel', e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Expected Incremental Revenue (Year 3)</label>
                                <select
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={formData.expectedRevenue}
                                    onChange={(e) => updateField('expectedRevenue', e.target.value)}
                                >
                                    <option value="">Select Size</option>
                                    <option value="1Cr - 5Cr">1Cr - 5Cr</option>
                                    <option value="5Cr - 10Cr">5Cr - 10Cr</option>
                                    <option value="10Cr+">10Cr+</option>
                                </select>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900">Show Commitment</h2>
                                <p className="text-gray-500">We invest in those who invest in themselves.</p>
                            </div>

                            <div className="space-y-6">
                                <Input
                                    label="How much capital are you willing to invest?"
                                    placeholder="e.g. 50 Lakhs"
                                    value={formData.investment}
                                    onChange={(e) => updateField('investment', e.target.value)}
                                />
                                <Input
                                    label="How many full-time people will you dedicate?"
                                    placeholder="e.g. 5 people"
                                    value={formData.teamSize}
                                    onChange={(e) => updateField('teamSize', e.target.value)}
                                />

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">What have you done so far?</label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                                        placeholder="Describe pilots, prototypes, or contracts..."
                                        value={formData.progress}
                                        onChange={(e) => updateField('progress', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold text-gray-900">Status & Needs</h2>
                                    <p className="text-gray-500">For each stream, indicate the current status.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {STREAMS.map((stream, idx) => (
                                    <div key={stream} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                                        <span className="font-medium text-gray-900">{stream}</span>
                                        <div className="flex gap-2">
                                            {STATUS_OPTIONS.map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => updateNeedStatus(idx, status)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.needs[idx].status === status
                                                            ? 'bg-red-50 border-red-500 text-red-700'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
                                {currentStep === 3 ? 'Submit Application' : 'Next'}
                                {currentStep !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
                            </>
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
};
