import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, Building, Users, FileText, LogOut, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/auth/admin');
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-foreground">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = [
    { label: 'Universities', count: 6, icon: Building, color: 'bg-primary/10 text-primary' },
    { label: 'Students', count: 0, icon: Users, color: 'bg-success/10 text-success' },
    { label: 'Applications', count: 0, icon: FileText, color: 'bg-warning/10 text-warning' },
    { label: 'Pending Review', count: 0, icon: FileText, color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-foreground text-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">Admin Portal</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-background/80 hover:text-background hover:bg-background/10">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Button variant="hero"><Plus className="h-4 w-4 mr-2" /> Add University</Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 bg-card rounded-2xl border border-border">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold text-foreground">{stat.count}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Manage Universities</h2>
            <p className="text-muted-foreground mb-4">Add, edit, or remove partner universities and their programs.</p>
            <Button variant="outline">View All Universities</Button>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Review Applications</h2>
            <p className="text-muted-foreground mb-4">Process pending applications and schedule interviews.</p>
            <Button variant="outline">View Applications</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
