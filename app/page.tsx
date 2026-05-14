import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Contact />
      
      <footer className="py-8 text-center text-gray-500 border-t border-primary/20 bg-card">
        <p>Created By <span className="text-primary font-medium">MF-DEVELOPER</span> &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
