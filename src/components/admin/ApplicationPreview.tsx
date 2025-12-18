import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Download, FileText, User, MapPin, GraduationCap, Briefcase, 
  Upload, CheckCircle, X, ExternalLink, FileArchive, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

interface ApplicationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  profile: { full_name: string | null; email: string } | null;
}

// Helper to safely parse JSON
const safeParseJson = (data: any) => {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Get file name from URL
const getFileName = (url: string) => {
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]);
  } catch {
    return 'document';
  }
};

export default function ApplicationPreview({ open, onOpenChange, application, profile }: ApplicationPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  
  if (!application) return null;

  const formData = safeParseJson(application.personal_statement) || {};
  
  // Extract all document URLs from the application
  const getDocumentUrls = (): { category: string; url: string }[] => {
    const docs: { category: string; url: string }[] = [];
    const documentFields = [
      'cv', 'passportCopy', 'transcript', 'aLevel', 'appScreenshots', 'casCopy',
      'chatUpload', 'disability', 'englishTest', 'euSettle', 'oLevel', 'otherCerts',
      'others', 'pgDegree', 'portfolio', 'postBrp', 'postDeposit', 'postVisa',
      'refLetter', 'sop', 'ugDegree', 'uniApp', 'visaRefusal', 'workCert'
    ];
    
    documentFields.forEach(field => {
      const urls = formData[field];
      if (Array.isArray(urls)) {
        urls.forEach(url => docs.push({ category: field, url }));
      }
    });
    
    return docs;
  };

  const documents = getDocumentUrls();

  // Generate PDF with form data
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const pageHeight = 280;
    
    const addLine = (text: string, isBold = false) => {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      if (isBold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach((line: string) => {
        if (y > pageHeight) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += lineHeight;
      });
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFontSize(14);
      addLine(title, true);
      doc.setFontSize(10);
      y += 2;
    };

    // Header
    doc.setFontSize(18);
    addLine('LinkD Student Portal - Application Form', true);
    doc.setFontSize(10);
    y += 5;
    addLine(`Generated: ${new Date().toLocaleString()}`);
    addLine(`Application ID: ${application.id}`);
    addLine(`Status: ${application.status.replace('_', ' ').toUpperCase()}`);
    
    // Personal Information
    addSection('PERSONAL INFORMATION');
    addLine(`Name: ${formData.firstName || ''} ${formData.familyName || ''}`);
    addLine(`Email: ${formData.email || profile?.email || ''}`);
    addLine(`Mobile: ${formData.mobile || ''}`);
    addLine(`Date of Birth: ${formData.dob || ''}`);
    addLine(`Gender: ${formData.gender || ''}`);
    addLine(`Nationality: ${formData.nationality || ''}`);
    addLine(`Country of Birth: ${formData.countryBirth || ''}`);
    addLine(`Native Language: ${formData.nativeLang || ''}`);

    // Passport Details
    addSection('PASSPORT DETAILS');
    addLine(`Name on Passport: ${formData.passportName || ''}`);
    addLine(`Passport Number: ${formData.passportNumber || ''}`);
    addLine(`Issue Location: ${formData.passportIssueLoc || ''}`);
    addLine(`Issue Date: ${formData.passportIssueDate || ''}`);
    addLine(`Expiry Date: ${formData.passportExpiryDate || ''}`);

    // Permanent Address
    addSection('PERMANENT ADDRESS');
    addLine(`${formData.permAdd1 || ''} ${formData.permAdd2 || ''}`);
    addLine(`${formData.permCity || ''}, ${formData.permState || ''} ${formData.permPost || ''}`);
    addLine(`${formData.permCountry || ''}`);

    // Current Address
    addSection('CURRENT ADDRESS');
    addLine(`${formData.currAdd1 || ''} ${formData.currAdd2 || ''}`);
    addLine(`${formData.currCity || ''}, ${formData.currState || ''} ${formData.currPost || ''}`);
    addLine(`${formData.currCountry || ''}`);

    // Destination Countries
    addSection('DESTINATION COUNTRIES');
    const destCountries = formData.destCountries || [];
    addLine(Array.isArray(destCountries) ? destCountries.join(', ') : destCountries);

    // Education
    addSection('EDUCATION HISTORY');
    const academicCountries = formData['acad_country[]'] || formData.acad_country || [];
    const academicInstitutions = formData['acad_institution[]'] || formData.acad_institution || [];
    const academicCourses = formData['acad_course[]'] || formData.acad_course || [];
    const academicLevels = formData['acad_level[]'] || formData.acad_level || [];
    const academicScores = formData['acad_score[]'] || formData.acad_score || [];
    
    const eduCount = Array.isArray(academicInstitutions) ? academicInstitutions.length : 1;
    for (let i = 0; i < eduCount; i++) {
      const inst = Array.isArray(academicInstitutions) ? academicInstitutions[i] : academicInstitutions;
      const country = Array.isArray(academicCountries) ? academicCountries[i] : academicCountries;
      const course = Array.isArray(academicCourses) ? academicCourses[i] : academicCourses;
      const level = Array.isArray(academicLevels) ? academicLevels[i] : academicLevels;
      const score = Array.isArray(academicScores) ? academicScores[i] : academicScores;
      
      if (inst) {
        addLine(`${i + 1}. ${inst} (${country || 'N/A'})`);
        addLine(`   Course: ${course || 'N/A'} | Level: ${level || 'N/A'} | Score: ${score || 'N/A'}`);
      }
    }

    // Academic Interest
    addSection('ACADEMIC INTEREST');
    addLine(`Study Level: ${formData.studyLevel || ''}`);
    addLine(`Discipline: ${formData.discipline || ''}`);
    addLine(`Programme: ${formData.programme || ''}`);
    addLine(`Start Date: ${formData.academicStart || ''}`);
    addLine(`Location: ${formData.academicLocation || ''}`);

    // Travel History
    addSection('TRAVEL & IMMIGRATION');
    addLine(`Applied for permission to remain: ${formData.appliedRemain || 'No'}`);
    addLine(`Visa needed: ${Array.isArray(formData.visaNeeded) ? formData.visaNeeded.join(', ') : formData.visaNeeded || 'None'}`);
    addLine(`Visa ever refused: ${formData.visaRefused || 'No'}`);

    // Referees
    addSection('REFEREES');
    const refNames = formData['ref_name[]'] || formData.ref_name || [];
    const refPositions = formData['ref_position[]'] || formData.ref_position || [];
    const refEmails = formData['ref_email[]'] || formData.ref_email || [];
    const refInsts = formData['ref_inst[]'] || formData.ref_inst || [];
    
    const refCount = Array.isArray(refNames) ? refNames.length : 1;
    for (let i = 0; i < refCount; i++) {
      const name = Array.isArray(refNames) ? refNames[i] : refNames;
      const position = Array.isArray(refPositions) ? refPositions[i] : refPositions;
      const email = Array.isArray(refEmails) ? refEmails[i] : refEmails;
      const inst = Array.isArray(refInsts) ? refInsts[i] : refInsts;
      
      if (name) {
        addLine(`${i + 1}. ${name} - ${position || ''}`);
        addLine(`   Email: ${email || ''} | Institution: ${inst || ''}`);
      }
    }

    // Work Experience
    if (!formData.noWorkExp) {
      addSection('WORK EXPERIENCE');
      const workTitles = formData['work_title[]'] || formData.work_title || [];
      const workOrgs = formData['work_org[]'] || formData.work_org || [];
      const workDescs = formData['work_desc[]'] || formData.work_desc || [];
      
      const workCount = Array.isArray(workTitles) ? workTitles.length : 1;
      for (let i = 0; i < workCount; i++) {
        const title = Array.isArray(workTitles) ? workTitles[i] : workTitles;
        const org = Array.isArray(workOrgs) ? workOrgs[i] : workOrgs;
        const desc = Array.isArray(workDescs) ? workDescs[i] : workDescs;
        
        if (title) {
          addLine(`${i + 1}. ${title} at ${org || 'N/A'}`);
          if (desc) addLine(`   ${desc}`);
        }
      }
    }

    // English Test
    addSection('ENGLISH PROFICIENCY');
    addLine(`English First Language: ${formData.englishFirst || 'No'}`);
    addLine(`Test Type: ${formData.engTestType || ''}`);
    addLine(`Score: ${formData.engScore || ''}`);
    addLine(`Date Taken: ${formData.engDate || ''}`);

    // Accommodation
    addSection('ACCOMMODATION');
    addLine(`Requires Assistance: ${formData.accom || 'No'}`);

    // Documents
    addSection('UPLOADED DOCUMENTS');
    if (documents.length > 0) {
      documents.forEach((doc, idx) => {
        addLine(`${idx + 1}. [${doc.category}] ${getFileName(doc.url)}`);
      });
    } else {
      addLine('No documents uploaded');
    }

    return doc;
  };

  // Download PDF only
  const downloadPDF = () => {
    try {
      const doc = generatePDF();
      doc.save(`Application_${formData.firstName || 'Student'}_${formData.familyName || ''}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error(error);
    }
  };

  // Download full package (PDF + documents as ZIP)
  const downloadFullPackage = async () => {
    if (documents.length === 0) {
      downloadPDF();
      return;
    }

    setDownloading(true);
    try {
      const zip = new JSZip();
      
      // Add PDF to zip
      const doc = generatePDF();
      const pdfBlob = doc.output('blob');
      zip.file(`Application_Form_${formData.firstName || 'Student'}_${formData.familyName || ''}.pdf`, pdfBlob);
      
      // Create documents folder
      const docsFolder = zip.folder('Documents');
      
      // Download and add each document
      for (const doc of documents) {
        try {
          const response = await fetch(doc.url);
          if (response.ok) {
            const blob = await response.blob();
            const fileName = `${doc.category}_${getFileName(doc.url)}`;
            docsFolder?.file(fileName, blob);
          }
        } catch (err) {
          console.warn(`Failed to download: ${doc.url}`);
        }
      }
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Application_Package_${formData.firstName || 'Student'}_${formData.familyName || ''}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast.success('Application package downloaded');
    } catch (error) {
      toast.error('Failed to create package');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  // Render field with label
  const Field = ({ label, value }: { label: string; value: any }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
      <div className="py-2 border-b border-border/50 last:border-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{Array.isArray(value) ? value.join(', ') : value}</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Application Details</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button size="sm" onClick={downloadFullPackage} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileArchive className="w-4 h-4 mr-2" />
                )}
                {downloading ? 'Preparing...' : 'Download All (ZIP)'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="p-6 pt-4">
            {/* Status Badge */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Applicant</p>
                <p className="text-lg font-semibold text-foreground">
                  {formData.firstName || ''} {formData.familyName || profile?.full_name || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">{formData.email || profile?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'accepted' ? 'bg-success/10 text-success' :
                  application.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  application.status === 'interview_scheduled' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-warning/10 text-warning'
                }`}>
                  {application.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="personal" className="text-xs sm:text-sm">
                  <User className="w-4 h-4 mr-1 hidden sm:inline" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">
                  <GraduationCap className="w-4 h-4 mr-1 hidden sm:inline" />
                  Education
                </TabsTrigger>
                <TabsTrigger value="references" className="text-xs sm:text-sm">
                  <User className="w-4 h-4 mr-1 hidden sm:inline" />
                  References
                </TabsTrigger>
                <TabsTrigger value="work" className="text-xs sm:text-sm">
                  <Briefcase className="w-4 h-4 mr-1 hidden sm:inline" />
                  Work
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-xs sm:text-sm">
                  <Upload className="w-4 h-4 mr-1 hidden sm:inline" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Personal Information
                    </h4>
                    <Field label="First Name" value={formData.firstName} />
                    <Field label="Family Name" value={formData.familyName} />
                    <Field label="Email" value={formData.email} />
                    <Field label="Mobile" value={formData.mobile} />
                    <Field label="Date of Birth" value={formData.dob} />
                    <Field label="Gender" value={formData.gender} />
                    <Field label="Nationality" value={formData.nationality} />
                    <Field label="Country of Birth" value={formData.countryBirth} />
                    <Field label="Native Language" value={formData.nativeLang} />
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Passport Details
                    </h4>
                    <Field label="Name on Passport" value={formData.passportName} />
                    <Field label="Passport Number" value={formData.passportNumber} />
                    <Field label="Issue Location" value={formData.passportIssueLoc} />
                    <Field label="Issue Date" value={formData.passportIssueDate} />
                    <Field label="Expiry Date" value={formData.passportExpiryDate} />
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Permanent Address
                    </h4>
                    <Field label="Address Line 1" value={formData.permAdd1} />
                    <Field label="Address Line 2" value={formData.permAdd2} />
                    <Field label="City" value={formData.permCity} />
                    <Field label="State" value={formData.permState} />
                    <Field label="Post Code" value={formData.permPost} />
                    <Field label="Country" value={formData.permCountry} />
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Current Address
                    </h4>
                    <Field label="Address Line 1" value={formData.currAdd1} />
                    <Field label="Address Line 2" value={formData.currAdd2} />
                    <Field label="City" value={formData.currCity} />
                    <Field label="State" value={formData.currState} />
                    <Field label="Post Code" value={formData.currPost} />
                    <Field label="Country" value={formData.currCountry} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-3">Destination Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(formData.destCountries) ? formData.destCountries : [formData.destCountries]).filter(Boolean).map((c: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-3">Academic Interest</h4>
                  <div className="grid md:grid-cols-2 gap-x-6">
                    <Field label="Study Level" value={formData.studyLevel} />
                    <Field label="Discipline" value={formData.discipline} />
                    <Field label="Programme" value={formData.programme} />
                    <Field label="Start Date" value={formData.academicStart} />
                    <Field label="Location" value={formData.academicLocation} />
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-3">Education History</h4>
                  {(() => {
                    const institutions = formData['acad_institution[]'] || formData.acad_institution || [];
                    const countries = formData['acad_country[]'] || formData.acad_country || [];
                    const courses = formData['acad_course[]'] || formData.acad_course || [];
                    const levels = formData['acad_level[]'] || formData.acad_level || [];
                    const scores = formData['acad_score[]'] || formData.acad_score || [];
                    const starts = formData['acad_start[]'] || formData.acad_start || [];
                    const ends = formData['acad_end[]'] || formData.acad_end || [];
                    
                    const count = Array.isArray(institutions) ? institutions.length : (institutions ? 1 : 0);
                    
                    return Array.from({ length: count }).map((_, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-lg mb-2 last:mb-0">
                        <p className="font-medium text-foreground">
                          {Array.isArray(institutions) ? institutions[i] : institutions}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(countries) ? countries[i] : countries}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                          <span className="text-muted-foreground">Course: <span className="text-foreground">{Array.isArray(courses) ? courses[i] : courses}</span></span>
                          <span className="text-muted-foreground">Level: <span className="text-foreground">{Array.isArray(levels) ? levels[i] : levels}</span></span>
                          <span className="text-muted-foreground">Score: <span className="text-foreground">{Array.isArray(scores) ? scores[i] : scores}</span></span>
                          <span className="text-muted-foreground">Period: <span className="text-foreground">{Array.isArray(starts) ? starts[i] : starts} - {Array.isArray(ends) ? ends[i] : ends}</span></span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium text-foreground mb-3">Travel & Immigration</h4>
                  <Field label="Applied for permission to remain (last 10 years)" value={formData.appliedRemain} />
                  <Field label="Visa needed for" value={formData.visaNeeded} />
                  <Field label="Ever refused visa/asylum or deported" value={formData.visaRefused} />
                </div>
              </TabsContent>

              <TabsContent value="references" className="space-y-4">
                {(() => {
                  const names = formData['ref_name[]'] || formData.ref_name || [];
                  const positions = formData['ref_position[]'] || formData.ref_position || [];
                  const titles = formData['ref_title[]'] || formData.ref_title || [];
                  const emails = formData['ref_email[]'] || formData.ref_email || [];
                  const knowns = formData['ref_known[]'] || formData.ref_known || [];
                  const contacts = formData['ref_contact[]'] || formData.ref_contact || [];
                  const relations = formData['ref_relation[]'] || formData.ref_relation || [];
                  const insts = formData['ref_inst[]'] || formData.ref_inst || [];
                  const addrs = formData['ref_inst_addr[]'] || formData.ref_inst_addr || [];
                  
                  const count = Array.isArray(names) ? names.length : (names ? 1 : 0);
                  
                  return Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-4">
                      <h4 className="font-medium text-foreground mb-3">Referee {i + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-x-6">
                        <Field label="Name" value={Array.isArray(names) ? names[i] : names} />
                        <Field label="Title" value={Array.isArray(titles) ? titles[i] : titles} />
                        <Field label="Position" value={Array.isArray(positions) ? positions[i] : positions} />
                        <Field label="Email" value={Array.isArray(emails) ? emails[i] : emails} />
                        <Field label="Contact Number" value={Array.isArray(contacts) ? contacts[i] : contacts} />
                        <Field label="How long known" value={Array.isArray(knowns) ? knowns[i] : knowns} />
                        <Field label="Relationship" value={Array.isArray(relations) ? relations[i] : relations} />
                        <Field label="Institution" value={Array.isArray(insts) ? insts[i] : insts} />
                        <Field label="Institution Address" value={Array.isArray(addrs) ? addrs[i] : addrs} />
                      </div>
                    </div>
                  ));
                })()}
              </TabsContent>

              <TabsContent value="work" className="space-y-4">
                {formData.noWorkExp ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No work experience declared</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const titles = formData['work_title[]'] || formData.work_title || [];
                      const orgs = formData['work_org[]'] || formData.work_org || [];
                      const addrs = formData['work_addr[]'] || formData.work_addr || [];
                      const descs = formData['work_desc[]'] || formData.work_desc || [];
                      const refs = formData['work_ref[]'] || formData.work_ref || [];
                      const refEmails = formData['work_ref_email[]'] || formData.work_ref_email || [];
                      const starts = formData['work_start[]'] || formData.work_start || [];
                      const ends = formData['work_end[]'] || formData.work_end || [];
                      const currents = formData['work_current[]'] || formData.work_current || [];
                      
                      const count = Array.isArray(titles) ? titles.length : (titles ? 1 : 0);
                      
                      if (count === 0) {
                        return (
                          <div className="bg-card rounded-xl border border-border p-8 text-center">
                            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No work experience entries</p>
                          </div>
                        );
                      }
                      
                      return Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl border border-border p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">{Array.isArray(titles) ? titles[i] : titles}</h4>
                              <p className="text-sm text-muted-foreground">{Array.isArray(orgs) ? orgs[i] : orgs}</p>
                            </div>
                            {(Array.isArray(currents) ? currents[i] : currents) === 'Yes' && (
                              <span className="px-2 py-1 bg-success/10 text-success rounded text-xs">Current</span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-x-6">
                            <Field label="Address" value={Array.isArray(addrs) ? addrs[i] : addrs} />
                            <Field label="Period" value={`${Array.isArray(starts) ? starts[i] : starts} - ${Array.isArray(ends) ? ends[i] : ends || 'Present'}`} />
                            <Field label="Reference Contact" value={Array.isArray(refs) ? refs[i] : refs} />
                            <Field label="Reference Email" value={Array.isArray(refEmails) ? refEmails[i] : refEmails} />
                          </div>
                          {(Array.isArray(descs) ? descs[i] : descs) && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-1">Job Description</p>
                              <p className="text-sm text-foreground">{Array.isArray(descs) ? descs[i] : descs}</p>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </>
                )}

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium text-foreground mb-3">English Proficiency</h4>
                  <div className="grid md:grid-cols-2 gap-x-6">
                    <Field label="English First Language" value={formData.englishFirst} />
                    <Field label="Test Type" value={formData.engTestType} />
                    <Field label="Overall Score" value={formData.engScore} />
                    <Field label="Date Taken" value={formData.engDate} />
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium text-foreground mb-3">Accommodation</h4>
                  <Field label="Requires Assistance" value={formData.accom} />
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {documents.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground truncate max-w-xs md:max-w-md">
                              {getFileName(doc.url)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{doc.category.replace(/([A-Z])/g, ' $1').trim()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} download>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Declarations */}
                <div className="bg-card rounded-xl border border-border p-4 mt-6">
                  <h4 className="font-medium text-foreground mb-3">Declarations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {formData.dec1 ? <CheckCircle className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
                      <span className="text-sm text-muted-foreground">Declaration 1 accepted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.dec2 ? <CheckCircle className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
                      <span className="text-sm text-muted-foreground">Declaration 2 accepted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.dec3 ? <CheckCircle className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
                      <span className="text-sm text-muted-foreground">Declaration 3 accepted</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
