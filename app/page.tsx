import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import Stats from '@/components/Stats';
import ParticlesBackground from '@/components/ParticlesBackground';

export default function Home() {
  return (
    <main className="min-h-screen relative" style={{ backgroundColor: 'var(--background)' }}>
      <ParticlesBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <About />
        <TechStack />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
        
        <footer className="py-8 text-center border-t border-primary/20" style={{ backgroundColor: 'var(--card)', color: 'var(--foreground)' }}>
          <p className="opacity-70">Created By <span className="text-primary font-medium">MF-DEVELOPER</span> &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </main>
  );
}
