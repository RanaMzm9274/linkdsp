import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { GraduationCap, ArrowLeft, ArrowRight, Check, Plus, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { FormSection } from '@/components/application/FormSection';
import { CountrySelect } from '@/components/application/CountrySelect';
import { FileUploadField } from '@/components/application/FileUploadField';
import { countries, destinationCountries, studyLevels, genderOptions } from '@/lib/countries';

interface Education {
  acad_country: string;
  acad_institution: string;
  acad_course: string;
  acad_level: string;
  acad_start: string;
  acad_end: string;
  acad_fulltime: string;
  acad_score: string;
  acad_current: string;
}

interface Referee {
  ref_name: string;
  ref_position: string;
  ref_title: string;
  ref_email: string;
  ref_known: string;
  ref_contact: string;
  ref_relation: string;
  ref_inst: string;
  ref_inst_addr: string;
}

interface Work {
  work_title: string;
  work_org: string;
  work_addr: string;
  work_desc: string;
  work_ref: string;
  work_ref_email: string;
  work_start: string;
  work_end: string;
  work_current: string;
}

interface FileUploads {
  cv: File[];
  passportCopy: File[];
  transcript: File[];
  aLevel: File[];
  appScreenshots: File[];
  casCopy: File[];
  chatUpload: File[];
  disability: File[];
  englishTest: File[];
  euSettle: File[];
  oLevel: File[];
  otherCerts: File[];
  others: File[];
  pgDegree: File[];
  portfolio: File[];
  postBrp: File[];
  postDeposit: File[];
  postVisa: File[];
  refLetter: File[];
  sop: File[];
  ugDegree: File[];
  uniApp: File[];
  visaRefusal: File[];
  workCert: File[];
}

const emptyEducation: Education = {
  acad_country: '',
  acad_institution: '',
  acad_course: '',
  acad_level: '',
  acad_start: '',
  acad_end: '',
  acad_fulltime: '',
  acad_score: '',
  acad_current: 'No',
};

const emptyReferee: Referee = {
  ref_name: '',
  ref_position: '',
  ref_title: '',
  ref_email: '',
  ref_known: '',
  ref_contact: '',
  ref_relation: '',
  ref_inst: '',
  ref_inst_addr: '',
};

const emptyWork: Work = {
  work_title: '',
  work_org: '',
  work_addr: '',
  work_desc: '',
  work_ref: '',
  work_ref_email: '',
  work_start: '',
  work_end: '',
  work_current: 'No',
};

const initialFiles: FileUploads = {
  cv: [], passportCopy: [], transcript: [], aLevel: [], appScreenshots: [],
  casCopy: [], chatUpload: [], disability: [], englishTest: [], euSettle: [],
  oLevel: [], otherCerts: [], others: [], pgDegree: [], portfolio: [],
  postBrp: [], postDeposit: [], postVisa: [], refLetter: [], sop: [],
  ugDegree: [], uniApp: [], visaRefusal: [], workCert: [],
};

export default function ApplicationForm() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  // Part 1 - Personal
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [countryBirth, setCountryBirth] = useState('');
  const [nativeLang, setNativeLang] = useState('');
  const [passportName, setPassportName] = useState('');
  const [passportIssueLoc, setPassportIssueLoc] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState('');
  const [passportExpiryDate, setPassportExpiryDate] = useState('');

  // Permanent Address
  const [permCountry, setPermCountry] = useState('');
  const [permCity, setPermCity] = useState('');
  const [permAdd1, setPermAdd1] = useState('');
  const [permAdd2, setPermAdd2] = useState('');
  const [permPost, setPermPost] = useState('');
  const [permState, setPermState] = useState('');

  // Current Address
  const [currCountry, setCurrCountry] = useState('');
  const [currCity, setCurrCity] = useState('');
  const [currAdd1, setCurrAdd1] = useState('');
  const [currAdd2, setCurrAdd2] = useState('');
  const [currPost, setCurrPost] = useState('');
  const [currState, setCurrState] = useState('');

  // Part 2 - Destinations & Education
  const [destCountries, setDestCountries] = useState<string[]>([]);
  const [educations, setEducations] = useState<Education[]>([{ ...emptyEducation }]);
  const [studyLevel, setStudyLevel] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [programme, setProgramme] = useState('');
  const [academicStart, setAcademicStart] = useState('');
  const [academicLocation, setAcademicLocation] = useState('');
  const [appliedRemain, setAppliedRemain] = useState('No');
  const [visaNeeded, setVisaNeeded] = useState<string[]>([]);
  const [visaRefused, setVisaRefused] = useState('No');

  // Part 3 - Referees, Work, Documents
  const [referees, setReferees] = useState<Referee[]>([{ ...emptyReferee }, { ...emptyReferee }]);
  const [noWorkExp, setNoWorkExp] = useState(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [files, setFiles] = useState<FileUploads>(initialFiles);
  const [englishFirst, setEnglishFirst] = useState('No');
  const [engTestType, setEngTestType] = useState('');
  const [engScore, setEngScore] = useState('');
  const [engDate, setEngDate] = useState('');
  const [accom, setAccom] = useState('No');
  const [dec1, setDec1] = useState(false);
  const [dec2, setDec2] = useState(false);
  const [dec3, setDec3] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('email, full_name, phone').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setEmail(data.email || '');
          if (data.full_name) {
            const parts = data.full_name.split(' ');
            setFirstName(parts[0] || '');
            setFamilyName(parts.slice(1).join(' ') || '');
          }
          setMobile(data.phone || '');
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (sameAsPermanent) {
      setCurrCountry(permCountry);
      setCurrCity(permCity);
      setCurrAdd1(permAdd1);
      setCurrAdd2(permAdd2);
      setCurrPost(permPost);
      setCurrState(permState);
    } else {
      setCurrCountry('');
      setCurrCity('');
      setCurrAdd1('');
      setCurrAdd2('');
      setCurrPost('');
      setCurrState('');
    }
  }, [sameAsPermanent, permCountry, permCity, permAdd1, permAdd2, permPost, permState]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!familyName.trim()) newErrors.familyName = 'Family name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
      if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
      if (!nationality) newErrors.nationality = 'Nationality is required';
      if (!countryBirth) newErrors.countryBirth = 'Country of birth is required';
      if (!permCountry) newErrors.permCountry = 'Permanent country is required';
      if (!permCity.trim()) newErrors.permCity = 'Permanent city is required';
      if (!permAdd1.trim()) newErrors.permAdd1 = 'Permanent address is required';
      if (!permPost.trim()) newErrors.permPost = 'Permanent post code is required';
      if (!permState.trim()) newErrors.permState = 'Permanent state is required';
      if (!currCountry) newErrors.currCountry = 'Current country is required';
      if (!currCity.trim()) newErrors.currCity = 'Current city is required';
      if (!currAdd1.trim()) newErrors.currAdd1 = 'Current address is required';
      if (!currPost.trim()) newErrors.currPost = 'Current post code is required';
      if (!currState.trim()) newErrors.currState = 'Current state is required';
    }

    if (step === 2) {
      if (destCountries.length === 0) newErrors.destCountries = 'Select at least one destination country';
      
      educations.forEach((edu, i) => {
        if (!edu.acad_country) newErrors[`edu_${i}_country`] = 'Country is required';
        if (!edu.acad_institution.trim()) newErrors[`edu_${i}_institution`] = 'Institution is required';
        if (!edu.acad_course.trim()) newErrors[`edu_${i}_course`] = 'Course is required';
        if (!edu.acad_level) newErrors[`edu_${i}_level`] = 'Level is required';
        if (!edu.acad_start) newErrors[`edu_${i}_start`] = 'Start date is required';
        if (!edu.acad_end) newErrors[`edu_${i}_end`] = 'End date is required';
        if (!edu.acad_fulltime) newErrors[`edu_${i}_fulltime`] = 'Study mode is required';
        if (!edu.acad_score.trim()) newErrors[`edu_${i}_score`] = 'Score is required';
      });

      if (!studyLevel) newErrors.studyLevel = 'Level of study is required';
      if (!discipline.trim()) newErrors.discipline = 'Discipline is required';
      if (!academicStart) newErrors.academicStart = 'Start date is required';
      if (!academicLocation.trim()) newErrors.academicLocation = 'Location is required';
    }

    if (step === 3) {
      if (referees.length < 2) newErrors.referees = 'At least 2 referees are required';
      
      if (files.cv.length === 0) newErrors.cv = 'CV is required';
      if (files.passportCopy.length === 0) newErrors.passportCopy = 'Passport copy is required';
      if (files.transcript.length === 0) newErrors.transcript = 'Transcript is required';

      if (!dec1) newErrors.dec1 = 'Declaration 1 is required';
      if (!dec2) newErrors.dec2 = 'Declaration 2 is required';
      if (!dec3) newErrors.dec3 = 'Declaration 3 is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      setMessage(null);
      window.scrollTo(0, 0);
    } else {
      setMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setMessage(null);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFirstName(''); setFamilyName(''); setEmail(''); setMobile('');
    setDob(''); setGender(''); setNationality(''); setCountryBirth('');
    setNativeLang(''); setPassportName(''); setPassportIssueLoc('');
    setPassportNumber(''); setPassportIssueDate(''); setPassportExpiryDate('');
    setPermCountry(''); setPermCity(''); setPermAdd1(''); setPermAdd2('');
    setPermPost(''); setPermState(''); setCurrCountry(''); setCurrCity('');
    setCurrAdd1(''); setCurrAdd2(''); setCurrPost(''); setCurrState('');
    setSameAsPermanent(false);
    setDestCountries([]); setEducations([{ ...emptyEducation }]);
    setStudyLevel(''); setDiscipline(''); setProgramme('');
    setAcademicStart(''); setAcademicLocation('');
    setAppliedRemain('No'); setVisaNeeded([]); setVisaRefused('No');
    setReferees([{ ...emptyReferee }, { ...emptyReferee }]);
    setNoWorkExp(false); setWorks([]);
    setFiles(initialFiles);
    setEnglishFirst('No'); setEngTestType(''); setEngScore(''); setEngDate('');
    setAccom('No'); setDec1(false); setDec2(false); setDec3(false);
    setErrors({}); setMessage(null);
  };

  const uploadFiles = async (fileList: File[], folder: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of fileList) {
      const path = `${user!.id}/${folder}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('application-documents').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('application-documents').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateStep(3)) {
      setMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // Upload all files
      const uploadedFiles: Record<string, string[]> = {};
      for (const [key, fileList] of Object.entries(files)) {
        if (fileList.length > 0) {
          uploadedFiles[key] = await uploadFiles(fileList, key);
        }
      }

      // Build form data object
      const formDataObj = {
        // Personal
        firstName, familyName, email, mobile, dob, gender, nationality, countryBirth,
        nativeLang, passportName, passportIssueLoc, passportNumber, passportIssueDate, passportExpiryDate,
        // Permanent Address
        permCountry, permCity, permAdd1, permAdd2, permPost, permState,
        // Current Address
        currCountry, currCity, currAdd1, currAdd2, currPost, currState,
        // Destinations
        destCountries,
        // Education arrays
        acad_country: educations.map(e => e.acad_country),
        acad_institution: educations.map(e => e.acad_institution),
        acad_course: educations.map(e => e.acad_course),
        acad_level: educations.map(e => e.acad_level),
        acad_start: educations.map(e => e.acad_start),
        acad_end: educations.map(e => e.acad_end),
        acad_fulltime: educations.map(e => e.acad_fulltime),
        acad_score: educations.map(e => e.acad_score),
        acad_current: educations.map(e => e.acad_current),
        // Academic Interest
        studyLevel, discipline, programme, academicStart, academicLocation,
        // Travel
        appliedRemain, visaNeeded, visaRefused,
        // Referees arrays
        ref_name: referees.map(r => r.ref_name),
        ref_position: referees.map(r => r.ref_position),
        ref_title: referees.map(r => r.ref_title),
        ref_email: referees.map(r => r.ref_email),
        ref_known: referees.map(r => r.ref_known),
        ref_contact: referees.map(r => r.ref_contact),
        ref_relation: referees.map(r => r.ref_relation),
        ref_inst: referees.map(r => r.ref_inst),
        ref_inst_addr: referees.map(r => r.ref_inst_addr),
        // Work arrays
        noWorkExp,
        work_title: works.map(w => w.work_title),
        work_org: works.map(w => w.work_org),
        work_addr: works.map(w => w.work_addr),
        work_desc: works.map(w => w.work_desc),
        work_ref: works.map(w => w.work_ref),
        work_ref_email: works.map(w => w.work_ref_email),
        work_start: works.map(w => w.work_start),
        work_end: works.map(w => w.work_end),
        work_current: works.map(w => w.work_current),
        // English
        englishFirst, engTestType, engScore, engDate,
        // Accommodation
        accom,
        // Declarations
        dec1, dec2, dec3,
        // Uploaded file URLs
        ...uploadedFiles,
      };

      // Get first university and program for application record
      const { data: universities } = await supabase.from('universities').select('id').limit(1);
      const { data: programs } = await supabase.from('programs').select('id').limit(1);

      if (!universities?.length || !programs?.length) {
        throw new Error('No universities or programs available');
      }

      // Save application
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        university_id: universities[0].id,
        program_id: programs[0].id,
        academic_history: JSON.stringify(formDataObj),
        personal_statement: `Full application: ${firstName} ${familyName}`,
        status: 'pending',
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Your application has been submitted successfully! We will contact you soon.' });
      toast.success('Application submitted successfully!');
      resetForm();
    } catch (error: any) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to submit application' });
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setEducations(prev => prev.map((edu, i) => i === index ? { ...edu, [field]: value } : edu));
  };

  const addEducation = () => setEducations(prev => [...prev, { ...emptyEducation }]);
  const removeEducation = (index: number) => {
    if (educations.length > 1) setEducations(prev => prev.filter((_, i) => i !== index));
  };

  const updateReferee = (index: number, field: keyof Referee, value: string) => {
    setReferees(prev => prev.map((ref, i) => i === index ? { ...ref, [field]: value } : ref));
  };

  const addReferee = () => setReferees(prev => [...prev, { ...emptyReferee }]);
  const removeReferee = (index: number) => {
    if (referees.length > 2) setReferees(prev => prev.filter((_, i) => i !== index));
  };

  const updateWork = (index: number, field: keyof Work, value: string) => {
    setWorks(prev => prev.map((w, i) => i === index ? { ...w, [field]: value } : w));
  };

  const addWork = () => setWorks(prev => [...prev, { ...emptyWork }]);
  const removeWork = (index: number) => setWorks(prev => prev.filter((_, i) => i !== index));

  const toggleDestCountry = (country: string) => {
    setDestCountries(prev => 
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const toggleVisaNeeded = (option: string) => {
    setVisaNeeded(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const updateFiles = (key: keyof FileUploads, newFiles: File[]) => {
    setFiles(prev => ({ ...prev, [key]: newFiles }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all
                  ${currentStep > step ? 'bg-primary border-primary text-primary-foreground' :
                    currentStep === step ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${currentStep > step ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-lg font-medium text-foreground">Step {currentStep} of 3</p>
          <p className="text-center text-sm text-muted-foreground">
            {currentStep === 1 && 'Personal + Passport + Addresses'}
            {currentStep === 2 && 'Destinations + Education + Academic Interest + Travel'}
            {currentStep === 3 && 'Referees + Work + Uploads + Accommodation + Declaration'}
          </p>
        </div>

        {/* Message Area */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
            'bg-destructive/10 text-destructive border border-destructive/20'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <FormSection title="1. Personal Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className={errors.firstName ? 'text-destructive' : ''}>First Name (Full Legal Name) *</Label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} className={errors.firstName ? 'border-destructive' : ''} />
                  {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label className={errors.familyName ? 'text-destructive' : ''}>Family Name *</Label>
                  <Input value={familyName} onChange={e => setFamilyName(e.target.value)} className={errors.familyName ? 'border-destructive' : ''} />
                  {errors.familyName && <p className="text-sm text-destructive mt-1">{errors.familyName}</p>}
                </div>
                <div>
                  <Label className={errors.email ? 'text-destructive' : ''}>Email *</Label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'border-destructive' : ''} />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <Label className={errors.mobile ? 'text-destructive' : ''}>Mobile Number *</Label>
                  <Input value={mobile} onChange={e => setMobile(e.target.value)} className={errors.mobile ? 'border-destructive' : ''} />
                  {errors.mobile && <p className="text-sm text-destructive mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                    <option value="">Select gender</option>
                    {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <CountrySelect label="Nationality" name="nationality" value={nationality} onChange={setNationality} required error={errors.nationality} />
                <CountrySelect label="Country of Birth" name="countryBirth" value={countryBirth} onChange={setCountryBirth} required error={errors.countryBirth} />
                <div>
                  <Label>Native Language</Label>
                  <Input value={nativeLang} onChange={e => setNativeLang(e.target.value)} />
                </div>
              </div>
            </FormSection>

            <FormSection title="Passport Details">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Name as in Passport</Label><Input value={passportName} onChange={e => setPassportName(e.target.value)} /></div>
                <div><Label>Passport Issue Location</Label><Input value={passportIssueLoc} onChange={e => setPassportIssueLoc(e.target.value)} /></div>
                <div><Label>Passport Number</Label><Input value={passportNumber} onChange={e => setPassportNumber(e.target.value)} /></div>
                <div><Label>Passport Issue Date</Label><Input type="date" value={passportIssueDate} onChange={e => setPassportIssueDate(e.target.value)} /></div>
                <div><Label>Passport Expiry Date</Label><Input type="date" value={passportExpiryDate} onChange={e => setPassportExpiryDate(e.target.value)} /></div>
              </div>
            </FormSection>

            <FormSection title="Permanent Address">
              <div className="grid sm:grid-cols-2 gap-4">
                <CountrySelect label="Country" name="permCountry" value={permCountry} onChange={setPermCountry} required error={errors.permCountry} />
                <div><Label className={errors.permCity ? 'text-destructive' : ''}>City *</Label><Input value={permCity} onChange={e => setPermCity(e.target.value)} className={errors.permCity ? 'border-destructive' : ''} />{errors.permCity && <p className="text-sm text-destructive mt-1">{errors.permCity}</p>}</div>
                <div className="sm:col-span-2"><Label className={errors.permAdd1 ? 'text-destructive' : ''}>Address Line 1 *</Label><Input value={permAdd1} onChange={e => setPermAdd1(e.target.value)} className={errors.permAdd1 ? 'border-destructive' : ''} />{errors.permAdd1 && <p className="text-sm text-destructive mt-1">{errors.permAdd1}</p>}</div>
                <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={permAdd2} onChange={e => setPermAdd2(e.target.value)} /></div>
                <div><Label className={errors.permPost ? 'text-destructive' : ''}>Post Code *</Label><Input value={permPost} onChange={e => setPermPost(e.target.value)} className={errors.permPost ? 'border-destructive' : ''} />{errors.permPost && <p className="text-sm text-destructive mt-1">{errors.permPost}</p>}</div>
                <div><Label className={errors.permState ? 'text-destructive' : ''}>State / Territory *</Label><Input value={permState} onChange={e => setPermState(e.target.value)} className={errors.permState ? 'border-destructive' : ''} />{errors.permState && <p className="text-sm text-destructive mt-1">{errors.permState}</p>}</div>
              </div>
            </FormSection>

            <FormSection title="Current Address">
              <div className="flex items-center gap-2 mb-4">
                <Checkbox id="sameAddr" checked={sameAsPermanent} onCheckedChange={(checked) => setSameAsPermanent(checked as boolean)} />
                <Label htmlFor="sameAddr" className="cursor-pointer">Same as permanent address</Label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <CountrySelect label="Country of Residence" name="currCountry" value={currCountry} onChange={setCurrCountry} required error={errors.currCountry} />
                <div><Label className={errors.currCity ? 'text-destructive' : ''}>City *</Label><Input value={currCity} onChange={e => setCurrCity(e.target.value)} disabled={sameAsPermanent} className={errors.currCity ? 'border-destructive' : ''} />{errors.currCity && <p className="text-sm text-destructive mt-1">{errors.currCity}</p>}</div>
                <div className="sm:col-span-2"><Label className={errors.currAdd1 ? 'text-destructive' : ''}>Address Line 1 *</Label><Input value={currAdd1} onChange={e => setCurrAdd1(e.target.value)} disabled={sameAsPermanent} className={errors.currAdd1 ? 'border-destructive' : ''} />{errors.currAdd1 && <p className="text-sm text-destructive mt-1">{errors.currAdd1}</p>}</div>
                <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={currAdd2} onChange={e => setCurrAdd2(e.target.value)} disabled={sameAsPermanent} /></div>
                <div><Label className={errors.currPost ? 'text-destructive' : ''}>Post Code *</Label><Input value={currPost} onChange={e => setCurrPost(e.target.value)} disabled={sameAsPermanent} className={errors.currPost ? 'border-destructive' : ''} />{errors.currPost && <p className="text-sm text-destructive mt-1">{errors.currPost}</p>}</div>
                <div><Label className={errors.currState ? 'text-destructive' : ''}>State / Territory *</Label><Input value={currState} onChange={e => setCurrState(e.target.value)} disabled={sameAsPermanent} className={errors.currState ? 'border-destructive' : ''} />{errors.currState && <p className="text-sm text-destructive mt-1">{errors.currState}</p>}</div>
              </div>
            </FormSection>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <FormSection title="2. Destination Countries">
              <Label className={errors.destCountries ? 'text-destructive' : ''}>Select Destination Countries *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {destinationCountries.map(country => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleDestCountry(country)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      destCountries.includes(country) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-secondary border-border hover:border-primary'}`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              {errors.destCountries && <p className="text-sm text-destructive mt-1">{errors.destCountries}</p>}
            </FormSection>

            <FormSection title="3. Education">
              {educations.map((edu, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-4 relative">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Qualification {index + 1}</h4>
                    {educations.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <CountrySelect label="Country" name={`edu_${index}_country`} value={edu.acad_country} onChange={v => updateEducation(index, 'acad_country', v)} required error={errors[`edu_${index}_country`]} />
                    <div><Label className={errors[`edu_${index}_institution`] ? 'text-destructive' : ''}>Institution *</Label><Input value={edu.acad_institution} onChange={e => updateEducation(index, 'acad_institution', e.target.value)} className={errors[`edu_${index}_institution`] ? 'border-destructive' : ''} /></div>
                    <div><Label className={errors[`edu_${index}_course`] ? 'text-destructive' : ''}>Course *</Label><Input value={edu.acad_course} onChange={e => updateEducation(index, 'acad_course', e.target.value)} className={errors[`edu_${index}_course`] ? 'border-destructive' : ''} /></div>
                    <div>
                      <Label className={errors[`edu_${index}_level`] ? 'text-destructive' : ''}>Level of Study *</Label>
                      <select value={edu.acad_level} onChange={e => updateEducation(index, 'acad_level', e.target.value)} className={`w-full h-10 px-3 rounded-md border bg-background ${errors[`edu_${index}_level`] ? 'border-destructive' : 'border-input'}`}>
                        <option value="">Select level</option>
                        {studyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div><Label className={errors[`edu_${index}_start`] ? 'text-destructive' : ''}>Start Date *</Label><Input type="date" value={edu.acad_start} onChange={e => updateEducation(index, 'acad_start', e.target.value)} className={errors[`edu_${index}_start`] ? 'border-destructive' : ''} /></div>
                    <div><Label className={errors[`edu_${index}_end`] ? 'text-destructive' : ''}>End Date *</Label><Input type="date" value={edu.acad_end} onChange={e => updateEducation(index, 'acad_end', e.target.value)} className={errors[`edu_${index}_end`] ? 'border-destructive' : ''} /></div>
                    <div>
                      <Label className={errors[`edu_${index}_fulltime`] ? 'text-destructive' : ''}>Study Mode *</Label>
                      <select value={edu.acad_fulltime} onChange={e => updateEducation(index, 'acad_fulltime', e.target.value)} className={`w-full h-10 px-3 rounded-md border bg-background ${errors[`edu_${index}_fulltime`] ? 'border-destructive' : 'border-input'}`}>
                        <option value="">Select mode</option>
                        <option value="Full time">Full time</option>
                        <option value="Part time">Part time</option>
                      </select>
                    </div>
                    <div><Label className={errors[`edu_${index}_score`] ? 'text-destructive' : ''}>Grading Score *</Label><Input value={edu.acad_score} onChange={e => updateEducation(index, 'acad_score', e.target.value)} className={errors[`edu_${index}_score`] ? 'border-destructive' : ''} /></div>
                    <div>
                      <Label>Currently Studying?</Label>
                      <select value={edu.acad_current} onChange={e => updateEducation(index, 'acad_current', e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEducation} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Another Qualification
              </Button>
            </FormSection>

            <FormSection title="4. Academic Interest">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className={errors.studyLevel ? 'text-destructive' : ''}>Level of Study *</Label>
                  <select value={studyLevel} onChange={e => setStudyLevel(e.target.value)} className={`w-full h-10 px-3 rounded-md border bg-background ${errors.studyLevel ? 'border-destructive' : 'border-input'}`}>
                    <option value="">Select level</option>
                    {studyLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {errors.studyLevel && <p className="text-sm text-destructive mt-1">{errors.studyLevel}</p>}
                </div>
                <div><Label className={errors.discipline ? 'text-destructive' : ''}>Discipline *</Label><Input value={discipline} onChange={e => setDiscipline(e.target.value)} className={errors.discipline ? 'border-destructive' : ''} />{errors.discipline && <p className="text-sm text-destructive mt-1">{errors.discipline}</p>}</div>
                <div><Label>Programme</Label><Input value={programme} onChange={e => setProgramme(e.target.value)} /></div>
                <div><Label className={errors.academicStart ? 'text-destructive' : ''}>Start Date *</Label><Input type="date" value={academicStart} onChange={e => setAcademicStart(e.target.value)} className={errors.academicStart ? 'border-destructive' : ''} />{errors.academicStart && <p className="text-sm text-destructive mt-1">{errors.academicStart}</p>}</div>
                <div className="sm:col-span-2"><Label className={errors.academicLocation ? 'text-destructive' : ''}>Location *</Label><Input value={academicLocation} onChange={e => setAcademicLocation(e.target.value)} className={errors.academicLocation ? 'border-destructive' : ''} />{errors.academicLocation && <p className="text-sm text-destructive mt-1">{errors.academicLocation}</p>}</div>
              </div>
            </FormSection>

            <FormSection title="5. Travel History">
              <div>
                <Label>Has the student applied for permission to remain in specific countries in the past 10 years?</Label>
                <select value={appliedRemain} onChange={e => setAppliedRemain(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </FormSection>

            <FormSection title="6. Travel & Immigration">
              <div className="space-y-4">
                <div>
                  <Label>Does the student need a visa to stay in the listed countries?</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['United Kingdom', 'None', 'Other'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleVisaNeeded(opt)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          visaNeeded.includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border hover:border-primary'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Has the student ever been refused a visa, asylum, or deported?</Label>
                  <select value={visaRefused} onChange={e => setVisaRefused(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </FormSection>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <FormSection title="7. Referees (Minimum 2 Required)">
              {errors.referees && <p className="text-sm text-destructive mb-2">{errors.referees}</p>}
              {referees.map((ref, index) => (
                <div key={index} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Referee {index + 1}</h4>
                    {referees.length > 2 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeReferee(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input value={ref.ref_name} onChange={e => updateReferee(index, 'ref_name', e.target.value)} /></div>
                    <div><Label>Position</Label><Input value={ref.ref_position} onChange={e => updateReferee(index, 'ref_position', e.target.value)} /></div>
                    <div><Label>Title</Label><Input value={ref.ref_title} onChange={e => updateReferee(index, 'ref_title', e.target.value)} /></div>
                    <div><Label>Work Email</Label><Input type="email" value={ref.ref_email} onChange={e => updateReferee(index, 'ref_email', e.target.value)} /></div>
                    <div><Label>How long known?</Label><Input value={ref.ref_known} onChange={e => updateReferee(index, 'ref_known', e.target.value)} /></div>
                    <div><Label>Contact Number</Label><Input value={ref.ref_contact} onChange={e => updateReferee(index, 'ref_contact', e.target.value)} /></div>
                    <div><Label>Relationship</Label><Input value={ref.ref_relation} onChange={e => updateReferee(index, 'ref_relation', e.target.value)} /></div>
                    <div><Label>Institution Name</Label><Input value={ref.ref_inst} onChange={e => updateReferee(index, 'ref_inst', e.target.value)} /></div>
                    <div className="sm:col-span-2"><Label>Institution Address</Label><Textarea value={ref.ref_inst_addr} onChange={e => updateReferee(index, 'ref_inst_addr', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addReferee} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Another Referee
              </Button>
            </FormSection>

            <FormSection title="8. Work Details">
              <div className="flex items-center gap-2 mb-4">
                <Checkbox id="noWork" checked={noWorkExp} onCheckedChange={(checked) => { setNoWorkExp(checked as boolean); if (checked) setWorks([]); }} />
                <Label htmlFor="noWork" className="cursor-pointer">No work experience</Label>
              </div>
              {!noWorkExp && (
                <>
                  {works.map((work, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Work Experience {index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeWork(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label>Job Title</Label><Input value={work.work_title} onChange={e => updateWork(index, 'work_title', e.target.value)} /></div>
                        <div><Label>Organisation</Label><Input value={work.work_org} onChange={e => updateWork(index, 'work_org', e.target.value)} /></div>
                        <div className="sm:col-span-2"><Label>Address</Label><Input value={work.work_addr} onChange={e => updateWork(index, 'work_addr', e.target.value)} /></div>
                        <div className="sm:col-span-2"><Label>Job Description</Label><Textarea value={work.work_desc} onChange={e => updateWork(index, 'work_desc', e.target.value)} /></div>
                        <div><Label>Reference Contact</Label><Input value={work.work_ref} onChange={e => updateWork(index, 'work_ref', e.target.value)} /></div>
                        <div><Label>Reference Email</Label><Input type="email" value={work.work_ref_email} onChange={e => updateWork(index, 'work_ref_email', e.target.value)} /></div>
                        <div><Label>Start Date</Label><Input type="date" value={work.work_start} onChange={e => updateWork(index, 'work_start', e.target.value)} /></div>
                        <div><Label>End Date</Label><Input type="date" value={work.work_end} onChange={e => updateWork(index, 'work_end', e.target.value)} /></div>
                        <div>
                          <Label>Currently Working?</Label>
                          <select value={work.work_current} onChange={e => updateWork(index, 'work_current', e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addWork} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Work Experience
                  </Button>
                </>
              )}
            </FormSection>

            <FormSection title="9. Documents Upload">
              <p className="text-sm text-muted-foreground mb-4">Accepted formats: PDF, DOC, DOCX, PNG, JPG, JPEG. Max 5MB per file.</p>
              
              <h4 className="font-medium text-foreground mb-3">Mandatory Uploads</h4>
              <div className="grid gap-4 mb-6">
                <FileUploadField label="CV / Resume" name="cv" files={files.cv} onChange={(f) => updateFiles('cv', f)} maxFiles={2} required error={errors.cv} />
                <FileUploadField label="Passport Copy" name="passportCopy" files={files.passportCopy} onChange={(f) => updateFiles('passportCopy', f)} maxFiles={2} required error={errors.passportCopy} />
                <FileUploadField label="Transcript" name="transcript" files={files.transcript} onChange={(f) => updateFiles('transcript', f)} maxFiles={10} required error={errors.transcript} />
              </div>

              <h4 className="font-medium text-foreground mb-3">Optional Uploads</h4>
              <div className="grid gap-4">
                <FileUploadField label="A Level / Higher Secondary / 12th Grade" name="aLevel" files={files.aLevel} onChange={(f) => updateFiles('aLevel', f)} maxFiles={2} />
                <FileUploadField label="Application Screenshots" name="appScreenshots" files={files.appScreenshots} onChange={(f) => updateFiles('appScreenshots', f)} maxFiles={50} />
                <FileUploadField label="CAS Copy" name="casCopy" files={files.casCopy} onChange={(f) => updateFiles('casCopy', f)} maxFiles={2} />
                <FileUploadField label="Chat Upload" name="chatUpload" files={files.chatUpload} onChange={(f) => updateFiles('chatUpload', f)} maxFiles={10} />
                <FileUploadField label="Disability Documents" name="disability" files={files.disability} onChange={(f) => updateFiles('disability', f)} maxFiles={2} />
                
                <div className="border border-border rounded-lg p-4 space-y-4">
                  <h5 className="font-medium">English Test</h5>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Is English your first language?</Label>
                      <select value={englishFirst} onChange={e => setEnglishFirst(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div><Label>Test Type</Label><Input value={engTestType} onChange={e => setEngTestType(e.target.value)} placeholder="IELTS, TOEFL, etc." /></div>
                    <div><Label>Overall Score</Label><Input value={engScore} onChange={e => setEngScore(e.target.value)} /></div>
                    <div><Label>Date Taken</Label><Input type="date" value={engDate} onChange={e => setEngDate(e.target.value)} /></div>
                  </div>
                  <FileUploadField label="English Test Files" name="englishTest" files={files.englishTest} onChange={(f) => updateFiles('englishTest', f)} maxFiles={5} />
                </div>

                <FileUploadField label="EU Settle / Pre Settled Documents" name="euSettle" files={files.euSettle} onChange={(f) => updateFiles('euSettle', f)} maxFiles={3} />
                <FileUploadField label="O Level / Senior Secondary / 10th Grade" name="oLevel" files={files.oLevel} onChange={(f) => updateFiles('oLevel', f)} maxFiles={2} />
                <FileUploadField label="Other Certificates or Diplomas" name="otherCerts" files={files.otherCerts} onChange={(f) => updateFiles('otherCerts', f)} maxFiles={10} />
                <FileUploadField label="Others" name="others" files={files.others} onChange={(f) => updateFiles('others', f)} maxFiles={5} />
                <FileUploadField label="PG Provisional / Degree" name="pgDegree" files={files.pgDegree} onChange={(f) => updateFiles('pgDegree', f)} maxFiles={2} />
                <FileUploadField label="Portfolio" name="portfolio" files={files.portfolio} onChange={(f) => updateFiles('portfolio', f)} maxFiles={10} />
                <FileUploadField label="Post Admission – BRP" name="postBrp" files={files.postBrp} onChange={(f) => updateFiles('postBrp', f)} maxFiles={2} />
                <FileUploadField label="Post Admission – TT/Deposit Receipt" name="postDeposit" files={files.postDeposit} onChange={(f) => updateFiles('postDeposit', f)} maxFiles={2} />
                <FileUploadField label="Post Admission – Visa" name="postVisa" files={files.postVisa} onChange={(f) => updateFiles('postVisa', f)} maxFiles={2} />
                <FileUploadField label="Reference Letter" name="refLetter" files={files.refLetter} onChange={(f) => updateFiles('refLetter', f)} maxFiles={3} />
                <FileUploadField label="Statement of Purpose" name="sop" files={files.sop} onChange={(f) => updateFiles('sop', f)} maxFiles={8} />
                <FileUploadField label="UG Provisional / Degree" name="ugDegree" files={files.ugDegree} onChange={(f) => updateFiles('ugDegree', f)} maxFiles={2} />
                <FileUploadField label="University Application Documents" name="uniApp" files={files.uniApp} onChange={(f) => updateFiles('uniApp', f)} maxFiles={10} />
                <FileUploadField label="Visa Refusal" name="visaRefusal" files={files.visaRefusal} onChange={(f) => updateFiles('visaRefusal', f)} maxFiles={3} />
                <FileUploadField label="Work Experience Certificate" name="workCert" files={files.workCert} onChange={(f) => updateFiles('workCert', f)} maxFiles={3} />
              </div>
            </FormSection>

            <FormSection title="10. Accommodation">
              <div>
                <Label>Do you require accommodation assistance?</Label>
                <select value={accom} onChange={e => setAccom(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </FormSection>

            <FormSection title="11. Declaration">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox id="dec1" checked={dec1} onCheckedChange={(c) => setDec1(c as boolean)} className={errors.dec1 ? 'border-destructive' : ''} />
                  <Label htmlFor="dec1" className="cursor-pointer text-sm">
                    I confirm that all information provided is accurate and complete to the best of my knowledge. *
                  </Label>
                </div>
                {errors.dec1 && <p className="text-sm text-destructive">{errors.dec1}</p>}
                
                <div className="flex items-start gap-3">
                  <Checkbox id="dec2" checked={dec2} onCheckedChange={(c) => setDec2(c as boolean)} className={errors.dec2 ? 'border-destructive' : ''} />
                  <Label htmlFor="dec2" className="cursor-pointer text-sm">
                    I agree to the terms and conditions of the application process. *
                  </Label>
                </div>
                {errors.dec2 && <p className="text-sm text-destructive">{errors.dec2}</p>}
                
                <div className="flex items-start gap-3">
                  <Checkbox id="dec3" checked={dec3} onCheckedChange={(c) => setDec3(c as boolean)} className={errors.dec3 ? 'border-destructive' : ''} />
                  <Label htmlFor="dec3" className="cursor-pointer text-sm">
                    I authorize the processing of my personal data for the purpose of this application. *
                  </Label>
                </div>
                {errors.dec3 && <p className="text-sm text-destructive">{errors.dec3}</p>}
              </div>
            </FormSection>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 gap-4">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 sm:flex-none">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          ) : <div />}

          <div className="flex gap-3">
            {currentStep === 3 && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button onClick={nextStep} className="flex-1 sm:flex-none">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="min-w-[140px]">
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
