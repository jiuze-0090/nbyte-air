import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Instructors from '@/components/Instructors';
import Courses from '@/components/Courses';
import Base from '@/components/Base';
import About from '@/components/About';
import Contact from '@/components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Instructors />
        <Courses />
        <Base />
        <About />
        <Contact />
      </main>
    </div>
  );
}

export default App;
