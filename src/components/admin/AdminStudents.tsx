import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, GraduationCap, MapPin, DollarSign, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  education_level: string | null;
  gpa: string | null;
  interests: string[] | null;
  skills: string[] | null;
  preferred_countries: string[] | null;
  budget_range: string | null;
  created_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStudents(data);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Students List */}
      <div className="lg:col-span-1">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Students ({students.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 bg-card rounded-xl border cursor-pointer transition-all ${
                selectedStudent?.id === student.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate">{student.full_name || 'No name'}</h3>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {search ? 'No students found' : 'No students registered yet'}
            </div>
          )}
        </div>
      </div>

      {/* Student Details */}
      <div className="lg:col-span-2">
        {selectedStudent ? (
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedStudent.full_name || 'No name'}</h2>
                <p className="text-muted-foreground">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedStudent.email}</span>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedStudent.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Academic Information</h3>
                <div className="space-y-3 text-sm">
                  {selectedStudent.education_level && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedStudent.education_level}</span>
                    </div>
                  )}
                  {selectedStudent.gpa && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">GPA:</span>
                      <span className="text-foreground">{selectedStudent.gpa}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedStudent.preferred_countries && selectedStudent.preferred_countries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Preferences</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.preferred_countries.map((country, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary text-foreground text-xs rounded-full">{country}</span>
                      ))}
                    </div>
                  </div>
                  {selectedStudent.budget_range && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground text-sm">{selectedStudent.budget_range}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedStudent.interests && selectedStudent.interests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Interests</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedStudent.interests.map((interest, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{interest}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div className="space-y-4 sm:col-span-2">
                  <h3 className="font-semibold text-foreground">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedStudent.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground">
              Registered on {new Date(selectedStudent.created_at).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Student</h3>
            <p className="text-muted-foreground">Choose a student from the list to view their profile details</p>
          </div>
        )}
      </div>
    </div>
  );
}
