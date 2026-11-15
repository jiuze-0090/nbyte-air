import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Courses from '@/components/Courses';
import Base from '@/components/Base';
import About from '@/components/About';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Courses />
        <Base />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
