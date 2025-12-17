import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building, MapPin, GraduationCap, X, ChevronRight } from 'lucide-react';

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  logo_url: string | null;
  description: string | null;
  requirements: string | null;
  deadlines: string | null;
  status: string;
}

interface Program {
  id: string;
  name: string;
  department: string | null;
  degree_type: string;
  duration: string | null;
  tuition_fee: string | null;
  description: string | null;
  requirements: string | null;
}

const emptyUniversity: Omit<University, 'id'> = {
  name: '',
  country: '',
  city: '',
  logo_url: '',
  description: '',
  requirements: '',
  deadlines: '',
  status: 'active',
};

const emptyProgram: Omit<Program, 'id'> = {
  name: '',
  department: '',
  degree_type: 'Bachelor',
  duration: '',
  tuition_fee: '',
  description: '',
  requirements: '',
};

export default function AdminUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showUniDialog, setShowUniDialog] = useState(false);
  const [showProgDialog, setShowProgDialog] = useState(false);
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [uniForm, setUniForm] = useState<Omit<University, 'id'>>(emptyUniversity);
  const [progForm, setProgForm] = useState<Omit<Program, 'id'>>(emptyProgram);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUni) fetchPrograms(selectedUni.id);
  }, [selectedUni]);

  const fetchUniversities = async () => {
    const { data } = await supabase.from('universities').select('*').order('name');
    if (data) setUniversities(data);
    setLoading(false);
  };

  const fetchPrograms = async (universityId: string) => {
    const { data } = await supabase.from('programs').select('*').eq('university_id', universityId).order('name');
    if (data) setPrograms(data);
  };

  const openAddUni = () => {
    setEditingUni(null);
    setUniForm(emptyUniversity);
    setShowUniDialog(true);
  };

  const openEditUni = (uni: University) => {
    setEditingUni(uni);
    setUniForm({
      name: uni.name,
      country: uni.country,
      city: uni.city,
      logo_url: uni.logo_url || '',
      description: uni.description || '',
      requirements: uni.requirements || '',
      deadlines: uni.deadlines || '',
      status: uni.status,
    });
    setShowUniDialog(true);
  };

  const saveUniversity = async () => {
    if (!uniForm.name || !uniForm.country || !uniForm.city) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);

    const payload = {
      ...uniForm,
      logo_url: uniForm.logo_url || null,
      description: uniForm.description || null,
      requirements: uniForm.requirements || null,
      deadlines: uniForm.deadlines || null,
    };

    if (editingUni) {
      const { error } = await supabase.from('universities').update(payload).eq('id', editingUni.id);
      if (error) toast.error(error.message);
      else toast.success('University updated');
    } else {
      const { error } = await supabase.from('universities').insert(payload);
      if (error) toast.error(error.message);
      else toast.success('University added');
    }

    setSaving(false);
    setShowUniDialog(false);
    fetchUniversities();
  };

  const deleteUniversity = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all programs.')) return;
    const { error } = await supabase.from('universities').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('University deleted');
      if (selectedUni?.id === id) setSelectedUni(null);
      fetchUniversities();
    }
  };

  const openAddProg = () => {
    setEditingProg(null);
    setProgForm(emptyProgram);
    setShowProgDialog(true);
  };

  const openEditProg = (prog: Program) => {
    setEditingProg(prog);
    setProgForm({
      name: prog.name,
      department: prog.department || '',
      degree_type: prog.degree_type,
      duration: prog.duration || '',
      tuition_fee: prog.tuition_fee || '',
      description: prog.description || '',
      requirements: prog.requirements || '',
    });
    setShowProgDialog(true);
  };

  const saveProgram = async () => {
    if (!selectedUni || !progForm.name || !progForm.degree_type) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);

    const payload = {
      ...progForm,
      university_id: selectedUni.id,
      department: progForm.department || null,
      duration: progForm.duration || null,
      tuition_fee: progForm.tuition_fee || null,
      description: progForm.description || null,
      requirements: progForm.requirements || null,
    };

    if (editingProg) {
      const { error } = await supabase.from('programs').update(payload).eq('id', editingProg.id);
      if (error) toast.error(error.message);
      else toast.success('Program updated');
    } else {
      const { error } = await supabase.from('programs').insert(payload);
      if (error) toast.error(error.message);
      else toast.success('Program added');
    }

    setSaving(false);
    setShowProgDialog(false);
    fetchPrograms(selectedUni.id);
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('Delete this program?')) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Program deleted');
      if (selectedUni) fetchPrograms(selectedUni.id);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Universities List */}
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Universities</h2>
          <Button size="sm" onClick={openAddUni}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <div className="space-y-2">
          {universities.map((uni) => (
            <div
              key={uni.id}
              onClick={() => setSelectedUni(uni)}
              className={`p-4 bg-card rounded-xl border cursor-pointer transition-all ${
                selectedUni?.id === uni.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    {uni.logo_url ? <img src={uni.logo_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <Building className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{uni.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {uni.city}, {uni.country}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${selectedUni?.id === uni.id ? 'rotate-90' : ''}`} />
              </div>
            </div>
          ))}
          {universities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No universities yet</div>
          )}
        </div>
      </div>

      {/* University Details & Programs */}
      <div className="lg:col-span-2">
        {selectedUni ? (
          <div className="space-y-6">
            {/* University Details */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                    {selectedUni.logo_url ? <img src={selectedUni.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : <Building className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedUni.name}</h2>
                    <p className="text-muted-foreground">{selectedUni.city}, {selectedUni.country}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditUni(selectedUni)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => deleteUniversity(selectedUni.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {selectedUni.description && <p className="text-sm text-muted-foreground mb-4">{selectedUni.description}</p>}
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {selectedUni.requirements && <div><span className="text-muted-foreground">Requirements:</span> <span className="text-foreground">{selectedUni.requirements}</span></div>}
                {selectedUni.deadlines && <div><span className="text-muted-foreground">Deadlines:</span> <span className="text-foreground">{selectedUni.deadlines}</span></div>}
                <div><span className="text-muted-foreground">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${selectedUni.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>{selectedUni.status}</span></div>
              </div>
            </div>

            {/* Programs */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Programs</h3>
                <Button size="sm" onClick={openAddProg}><Plus className="h-4 w-4 mr-1" /> Add Program</Button>
              </div>
              <div className="space-y-3">
                {programs.map((prog) => (
                  <div key={prog.id} className="p-4 bg-secondary/50 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{prog.name}</h4>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{prog.degree_type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {prog.department && `${prog.department} • `}{prog.duration && `${prog.duration} • `}{prog.tuition_fee}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditProg(prog)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProgram(prog.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {programs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No programs added yet</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a University</h3>
            <p className="text-muted-foreground">Choose a university from the list to view and manage its programs</p>
          </div>
        )}
      </div>

      {/* University Dialog */}
      <Dialog open={showUniDialog} onOpenChange={setShowUniDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUni ? 'Edit University' : 'Add University'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Name *</Label>
              <Input value={uniForm.name} onChange={(e) => setUniForm(f => ({ ...f, name: e.target.value }))} placeholder="University name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country *</Label>
                <Input value={uniForm.country} onChange={(e) => setUniForm(f => ({ ...f, country: e.target.value }))} placeholder="Country" />
              </div>
              <div>
                <Label>City *</Label>
                <Input value={uniForm.city} onChange={(e) => setUniForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
              </div>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={uniForm.logo_url || ''} onChange={(e) => setUniForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={uniForm.description || ''} onChange={(e) => setUniForm(f => ({ ...f, description: e.target.value }))} placeholder="About the university" />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input value={uniForm.requirements || ''} onChange={(e) => setUniForm(f => ({ ...f, requirements: e.target.value }))} placeholder="General requirements" />
            </div>
            <div>
              <Label>Deadlines</Label>
              <Input value={uniForm.deadlines || ''} onChange={(e) => setUniForm(f => ({ ...f, deadlines: e.target.value }))} placeholder="Application deadlines" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={uniForm.status} onChange={(e) => setUniForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowUniDialog(false)}>Cancel</Button>
              <Button onClick={saveUniversity} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog open={showProgDialog} onOpenChange={setShowProgDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProg ? 'Edit Program' : 'Add Program'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Program Name *</Label>
              <Input value={progForm.name} onChange={(e) => setProgForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Degree Type *</Label>
                <select value={progForm.degree_type} onChange={(e) => setProgForm(f => ({ ...f, degree_type: e.target.value }))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground">
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={progForm.department || ''} onChange={(e) => setProgForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g., Engineering" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration</Label>
                <Input value={progForm.duration || ''} onChange={(e) => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g., 4 years" />
              </div>
              <div>
                <Label>Tuition Fee</Label>
                <Input value={progForm.tuition_fee || ''} onChange={(e) => setProgForm(f => ({ ...f, tuition_fee: e.target.value }))} placeholder="e.g., $15,000/year" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={progForm.description || ''} onChange={(e) => setProgForm(f => ({ ...f, description: e.target.value }))} placeholder="About the program" />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input value={progForm.requirements || ''} onChange={(e) => setProgForm(f => ({ ...f, requirements: e.target.value }))} placeholder="Specific requirements" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowProgDialog(false)}>Cancel</Button>
              <Button onClick={saveProgram} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
