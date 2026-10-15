import { ChevronRight, Phone } from 'lucide-react';
import { heroImage } from '@/data';

export default function Hero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="无人机飞行训练"
          width={1600}
          height={1067}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-nbyte-950/90 via-nbyte-900/70 to-nbyte-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-nbyte-300/30 bg-nbyte-800/40 px-4 py-1.5 text-sm font-medium text-nbyte-100 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent-cyan" />
            低空经济人才培养计划
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            专业多旋翼无人机
            <br />
            <span className="bg-gradient-to-r from-nbyte-200 to-accent-cyan bg-clip-text text-transparent">
              驾驶员培训基地
            </span>
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-nbyte-100/90">
            立足潍坊，辐射全国。从理论到实操，助您掌握低空经济核心技能。
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => scrollTo('courses')}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent-orange px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-accent-orange/30 transition-all hover:scale-105 hover:bg-orange-500"
            >
              查看课程大纲
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Phone className="h-5 w-5" />
              联系招生办
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
          <div className="h-2 w-1 animate-bounce rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
