import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Shield, Building, Users, FileText, LogOut, LayoutDashboard, GraduationCap } from 'lucide-react';
import AdminUniversities from '@/components/admin/AdminUniversities';
import AdminApplications from '@/components/admin/AdminApplications';
import AdminStudents from '@/components/admin/AdminStudents';

interface Stats {
  universities: number;
  students: number;
  applications: number;
  pending: number;
}

function DashboardHome() {
  const [stats, setStats] = useState<Stats>({ universities: 0, students: 0, applications: 0, pending: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [uniRes, profilesRes, appsRes, pendingRes] = await Promise.all([
      supabase.from('universities').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }),
      supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setStats({
      universities: uniRes.count || 0,
      students: profilesRes.count || 0,
      applications: appsRes.count || 0,
      pending: pendingRes.count || 0,
    });
  };

  const statCards = [
    { label: 'Universities', count: stats.universities, icon: Building, color: 'bg-primary/10 text-primary', href: '/admin/universities' },
    { label: 'Students', count: stats.students, icon: Users, color: 'bg-success/10 text-success', href: '/admin/students' },
    { label: 'Applications', count: stats.applications, icon: FileText, color: 'bg-warning/10 text-warning', href: '/admin/applications' },
    { label: 'Pending Review', count: stats.pending, icon: FileText, color: 'bg-destructive/10 text-destructive', href: '/admin/applications' },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <div className="p-6 bg-card rounded-2xl border border-border hover:border-primary/20 transition-all">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/admin/universities" className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-4">Manage Universities</h2>
          <p className="text-muted-foreground mb-4">Add, edit, or remove partner universities and their programs.</p>
          <Button variant="outline">View All Universities</Button>
        </Link>
        <Link to="/admin/applications" className="bg-card rounded-2xl border border-border p-6 hover:border-primary/20 transition-all">
          <h2 className="text-xl font-semibold text-foreground mb-4">Review Applications</h2>
          <p className="text-muted-foreground mb-4">Process pending applications and schedule interviews.</p>
          <Button variant="outline">View Applications</Button>
        </Link>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/auth/admin');
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Universities', href: '/admin/universities', icon: Building },
    { label: 'Applications', href: '/admin/applications', icon: FileText },
    { label: 'Students', href: '/admin/students', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-foreground text-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">Admin Portal</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href))
                      ? 'bg-background/20 text-background'
                      : 'text-background/60 hover:text-background hover:bg-background/10'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-background/80 hover:text-background hover:bg-background/10">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="universities/*" element={<AdminUniversities />} />
          <Route path="applications/*" element={<AdminApplications />} />
          <Route path="students/*" element={<AdminStudents />} />
        </Routes>
      </main>
    </div>
  );
}
