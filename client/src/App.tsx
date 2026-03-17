import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experiences from './components/Experiences';
import Contact from './components/Contact';
import Footer from './components/Footer';
import MaintenancePage from './components/MaintenancePage';
import { useApi } from './hooks/useApi';
import type { Profile } from './types';

function App() {
  const { data: profile, loading } = useApi<Profile>('/api/profile');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Check if admin is logged in (token set in localStorage by admin panel — Phase 2)
  const isAdminLoggedIn = !!localStorage.getItem('admin_token');

  // Show maintenance page if enabled and admin is not logged in
  if (!loading && profile?.maintenance_mode && !isAdminLoggedIn) {
    return <MaintenancePage profile={profile} />;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar profile={profile} />
      <main>
        <Hero profile={profile} profileLoading={loading} />
        <About profile={profile} profileLoading={loading} />
        <Skills />
        <Projects
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />
        <Experiences />
        <Contact profile={profile} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
