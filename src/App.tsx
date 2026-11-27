import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Courses from '@/components/Courses';
import Base from '@/components/Base';
import About from '@/components/About';
import Team from '@/components/Team';
import Faq from '@/components/Faq';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Privacy from '@/components/Privacy';

function App() {
  // 告知书用 hash 路由：/#privacy 打开。hash 不发往服务器，绕开 CF Pages 对 /privacy 的 404 拦截。
  const [privacyOpen, setPrivacyOpen] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#privacy',
  );

  useEffect(() => {
    const onHashChange = () => setPrivacyOpen(window.location.hash === '#privacy');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const closePrivacy = useCallback(() => {
    // 清掉 hash 但保留当前路径，避免关闭后 URL 残留 #privacy
    if (window.location.hash === '#privacy') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setPrivacyOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* 跳到主要内容：键盘用户第一下 Tab 就能越过导航，默认藏在屏幕外 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-nbyte-900 focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        跳到主要内容
      </a>

      <Navbar />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Stats />
        <Courses />
        <Base />
        <About />
        <Team />
        <Faq />
        <Contact />
      </main>
      <Footer />
      {privacyOpen && <Privacy onClose={closePrivacy} />}
    </div>
  );
}

export default App;
