import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { navLinks } from '@/data';
import BrandMark from '@/components/BrandMark';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    // 尊重系统「减少动态效果」设置
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-nbyte-950/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <nav aria-label="主导航" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <button onClick={() => scrollTo('hero')} aria-label="新字节航空，返回页面顶部" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8 text-white" />
          <div className="text-left leading-tight">
            <span className="block text-lg font-bold text-white">新字节航空</span>
            <span className="block text-xs font-medium tracking-widest text-nbyte-200">
              NBYTE AIR
            </span>
          </div>
        </button>

        {/* Desktop Menu */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-nbyte-100 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CTA Button (Desktop) */}
        <button
          onClick={() => scrollTo('contact')}
          className="hidden rounded-full bg-accent-orange px-6 py-2.5 text-sm font-semibold text-[#1A1A1A] shadow-lg shadow-accent-orange/30 transition-all hover:scale-105 hover:bg-[#E8551F] lg:block"
        >
          立即咨询
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white lg:hidden"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-nbyte-950/98 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-nbyte-100 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li className="mt-2">
              <button
                onClick={() => scrollTo('contact')}
                className="w-full rounded-full bg-accent-orange px-6 py-3 text-sm font-semibold text-[#1A1A1A]"
              >
                立即咨询
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
