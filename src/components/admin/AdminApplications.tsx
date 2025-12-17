import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Clock, CheckCircle, XCircle, Video, Building, User, Calendar, Link as LinkIcon, MessageSquare, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

type ApplicationStatus = 'pending' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected';

interface Application {
  id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
  interview_date: string | null;
  interview_link: string | null;
  academic_history: string | null;
  personal_statement: string | null;
  user_id: string;
  profile: { full_name: string | null; email: string } | null;
  university: { id: string; name: string } | null;
  program: { id: string; name: string; degree_type: string } | null;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-warning/10 text-warning', icon: FileText },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-purple-500/10 text-purple-500', icon: Video },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

const ITEMS_PER_PAGE = 10;

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form states for editing
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('pending');
  const [editNotes, setEditNotes] = useState('');
  const [editInterviewDate, setEditInterviewDate] = useState('');
  const [editInterviewLink, setEditInterviewLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id, status, created_at, updated_at, admin_notes, interview_date, interview_link,
        academic_history, personal_statement, user_id,
        profile:profiles!fk_applications_user_id(full_name, email),
        university:universities!applications_university_id_fkey(id, name),
        program:programs!applications_program_id_fkey(id, name, degree_type)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const transformedData = data.map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile,
        university: Array.isArray(item.university) ? item.university[0] : item.university,
        program: Array.isArray(item.program) ? item.program[0] : item.program,
      })) as Application[];
      setApplications(transformedData);
    }
    setLoading(false);
  };

  const openEditDialog = (app: Application) => {
    setSelectedApp(app);
    setEditStatus(app.status);
    setEditNotes(app.admin_notes || '');
    setEditInterviewDate(app.interview_date ? new Date(app.interview_date).toISOString().slice(0, 16) : '');
    setEditInterviewLink(app.interview_link || '');
    setShowDialog(true);
  };

  const quickStatusUpdate = async (appId: string, newStatus: ApplicationStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', appId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`);
      fetchApplications();
    }
  };

  const saveApplication = async () => {
    if (!selectedApp) return;
    setSaving(true);

    const updateData: any = {
      status: editStatus,
      admin_notes: editNotes || null,
    };

    if (editStatus === 'interview_scheduled') {
      if (!editInterviewDate) {
        toast.error('Please set an interview date');
        setSaving(false);
        return;
      }
      updateData.interview_date = new Date(editInterviewDate).toISOString();
      updateData.interview_link = editInterviewLink || null;
    } else {
      updateData.interview_date = null;
      updateData.interview_link = null;
    }

    const { error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', selectedApp.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Application updated');
      setShowDialog(false);
      fetchApplications();
    }
    setSaving(false);
  };

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Applications</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | 'all')}
            className="h-9 px-3 rounded-md border border-input bg-background text-foreground text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Found</h3>
          <p className="text-muted-foreground">
            {filterStatus === 'all' ? 'No applications have been submitted yet.' : `No ${filterStatus.replace('_', ' ')} applications.`}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedApps.map((app) => {
              const config = statusConfig[app.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={app.id}
                  className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => openEditDialog(app)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{app.profile?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-muted-foreground">{app.profile?.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {app.university?.name}</span>
                          <span>{app.program?.name} ({app.program?.degree_type})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {app.status === 'interview_scheduled' && app.interview_date && (
                    <div className="mt-4 p-3 bg-purple-500/5 rounded-xl border border-purple-500/20 flex items-center gap-3">
                      <Video className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Interview: {new Date(app.interview_date).toLocaleString()}</p>
                        {app.interview_link && <p className="text-xs text-muted-foreground truncate">{app.interview_link}</p>}
                      </div>
                    </div>
                  )}

                  {app.admin_notes && (
                    <div className="mt-4 p-3 bg-secondary/50 rounded-xl flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{app.admin_notes}</p>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  {app.status !== 'accepted' && app.status !== 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-success border-success/30 hover:bg-success/10"
                        onClick={(e) => quickStatusUpdate(app.id, 'accepted', e)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={(e) => quickStatusUpdate(app.id, 'rejected', e)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); openEditDialog(app); }}
                      >
                        More Options
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length} applications
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Update Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6 mt-4">
              {/* Applicant Info */}
              <div className="p-4 bg-secondary/50 rounded-xl">
                <h4 className="font-medium text-foreground mb-2">Applicant Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{selectedApp.profile?.full_name}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selectedApp.profile?.email}</span></div>
                  <div><span className="text-muted-foreground">University:</span> <span className="text-foreground">{selectedApp.university?.name}</span></div>
                  <div><span className="text-muted-foreground">Program:</span> <span className="text-foreground">{selectedApp.program?.name}</span></div>
                </div>
                {selectedApp.academic_history && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Academic History</p>
                    <p className="text-sm text-foreground">{selectedApp.academic_history}</p>
                  </div>
                )}
                {selectedApp.personal_statement && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Personal Statement</p>
                    <p className="text-sm text-foreground line-clamp-3">{selectedApp.personal_statement}</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <Label>Status</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Interview Fields */}
              {editStatus === 'interview_scheduled' && (
                <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 space-y-4">
                  <h4 className="font-medium text-foreground flex items-center gap-2"><Video className="w-4 h-4 text-purple-500" /> Schedule Interview</h4>
                  <div>
                    <Label>Interview Date & Time *</Label>
                    <Input
                      type="datetime-local"
                      value={editInterviewDate}
                      onChange={(e) => setEditInterviewDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Meeting Link (Zoom/Google Meet)</Label>
                    <Input
                      value={editInterviewLink}
                      onChange={(e) => setEditInterviewLink(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label>Admin Notes (visible to student)</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={saveApplication} disabled={saving}>{saving ? 'Saving...' : 'Update Application'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
