import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, ArrowRight, Check, User, BookOpen, Target, FileUp, Eye } from 'lucide-react';
import { z } from 'zod';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
});

const academicSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  gpa: z.string().min(1, 'GPA/Grades is required'),
  institution: z.string().min(2, 'Institution name is required'),
});

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  educationLevel: string;
  gpa: string;
  institution: string;
  universityId: string;
  programId: string;
  personalStatement: string;
  documents: string;
}

const steps = [
  { id: 1, name: 'Personal Info', icon: User },
  { id: 2, name: 'Academic History', icon: BookOpen },
  { id: 3, name: 'Program Selection', icon: Target },
  { id: 4, name: 'Documents', icon: FileUp },
  { id: 5, name: 'Review', icon: Eye },
];

export default function ApplicationForm() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [programs, setPrograms] = useState<{ id: string; name: string; degree_type: string }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    educationLevel: '',
    gpa: '',
    institution: '',
    universityId: searchParams.get('university') || '',
    programId: searchParams.get('program') || '',
    personalStatement: '',
    documents: '',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    supabase.from('universities').select('id, name').eq('status', 'active').then(({ data }) => {
      if (data) setUniversities(data);
    });
  }, []);

  useEffect(() => {
    if (formData.universityId) {
      supabase.from('programs').select('id, name, degree_type').eq('university_id', formData.universityId).then(({ data }) => {
        if (data) setPrograms(data);
      });
    }
  }, [formData.universityId]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            fullName: data.full_name || '',
            phone: data.phone || '',
          }));
        }
      });
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    try {
      if (currentStep === 1) {
        personalInfoSchema.parse({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
      } else if (currentStep === 2) {
        academicSchema.parse({
          educationLevel: formData.educationLevel,
          gpa: formData.gpa,
          institution: formData.institution,
        });
      } else if (currentStep === 3) {
        if (!formData.universityId || !formData.programId) {
          setErrors({ program: 'Please select both university and program' });
          return false;
        }
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(e => {
          newErrors[e.path[0]] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Update profile with new data
      await supabase.from('profiles').update({
        full_name: formData.fullName,
        phone: formData.phone,
        education_level: formData.educationLevel,
        gpa: formData.gpa,
      }).eq('id', user.id);

      // Create application
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        university_id: formData.universityId,
        program_id: formData.programId,
        academic_history: `Education: ${formData.educationLevel}, Institution: ${formData.institution}, GPA: ${formData.gpa}`,
        personal_statement: formData.personalStatement,
        documents_url: formData.documents ? [formData.documents] : null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      navigate('/dashboard/applications');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedUniversity = universities.find(u => u.id === formData.universityId);
  const selectedProgram = programs.find(p => p.id === formData.programId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">EduPath</span>
          </Link>
          <Link to="/universities" className="text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep > step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : currentStep === step.id 
                      ? 'border-primary text-primary' 
                      : 'border-border text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">{steps[currentStep - 1].name}</h2>
            <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="John Doe"
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 234 567 890"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter your full address"
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Academic History */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label htmlFor="educationLevel">Education Level *</Label>
                <select
                  id="educationLevel"
                  value={formData.educationLevel}
                  onChange={(e) => updateField('educationLevel', e.target.value)}
                  className={`w-full h-10 px-3 rounded-md border bg-background text-foreground ${errors.educationLevel ? 'border-destructive' : 'border-input'}`}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's">Bachelor's Degree</option>
                  <option value="Master's">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
                {errors.educationLevel && <p className="text-sm text-destructive mt-1">{errors.educationLevel}</p>}
              </div>
              <div>
                <Label htmlFor="institution">Previous Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  placeholder="University of Example"
                  className={errors.institution ? 'border-destructive' : ''}
                />
                {errors.institution && <p className="text-sm text-destructive mt-1">{errors.institution}</p>}
              </div>
              <div>
                <Label htmlFor="gpa">GPA / Grades *</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => updateField('gpa', e.target.value)}
                  placeholder="3.8 / 4.0 or A"
                  className={errors.gpa ? 'border-destructive' : ''}
                />
                {errors.gpa && <p className="text-sm text-destructive mt-1">{errors.gpa}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Program Selection */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label htmlFor="university">Select University *</Label>
                <select
                  id="university"
                  value={formData.universityId}
                  onChange={(e) => {
                    updateField('universityId', e.target.value);
                    updateField('programId', '');
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="">Choose a university</option>
                  {universities.map(uni => (
                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="program">Select Program *</Label>
                <select
                  id="program"
                  value={formData.programId}
                  onChange={(e) => updateField('programId', e.target.value)}
                  className={`w-full h-10 px-3 rounded-md border bg-background text-foreground ${errors.program ? 'border-destructive' : 'border-input'}`}
                  disabled={!formData.universityId}
                >
                  <option value="">Choose a program</option>
                  {programs.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.name} ({prog.degree_type})</option>
                  ))}
                </select>
                {errors.program && <p className="text-sm text-destructive mt-1">{errors.program}</p>}
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <Label htmlFor="personalStatement">Personal Statement</Label>
                <Textarea
                  id="personalStatement"
                  value={formData.personalStatement}
                  onChange={(e) => updateField('personalStatement', e.target.value)}
                  placeholder="Tell us about yourself, your goals, and why you want to join this program..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 300-500 words</p>
              </div>
              <div>
                <Label htmlFor="documents">Document URL (Optional)</Label>
                <Input
                  id="documents"
                  value={formData.documents}
                  onChange={(e) => updateField('documents', e.target.value)}
                  placeholder="https://drive.google.com/your-documents"
                />
                <p className="text-xs text-muted-foreground mt-1">Share a link to your documents (transcript, CV, etc.)</p>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium text-foreground">{formData.fullName}</span></div>
                  <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{formData.phone}</span></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{formData.address}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Academic History</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Education:</span> <span className="font-medium text-foreground">{formData.educationLevel}</span></div>
                  <div><span className="text-muted-foreground">GPA:</span> <span className="font-medium text-foreground">{formData.gpa}</span></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Institution:</span> <span className="font-medium text-foreground">{formData.institution}</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b border-border pb-2">Program Selection</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">University:</span> <span className="font-medium text-foreground">{selectedUniversity?.name}</span></div>
                  <div><span className="text-muted-foreground">Program:</span> <span className="font-medium text-foreground">{selectedProgram?.name}</span></div>
                </div>
              </div>
              {formData.personalStatement && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground border-b border-border pb-2">Personal Statement</h3>
                  <p className="text-sm text-muted-foreground">{formData.personalStatement.slice(0, 200)}...</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </Button>
            {currentStep < 5 ? (
              <Button onClick={nextStep} className="gap-2">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} variant="hero" className="gap-2">
                {submitting ? 'Submitting...' : 'Submit Application'} <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
