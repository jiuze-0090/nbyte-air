import { ChevronDown } from 'lucide-react';

import { faqItems } from '@/data';

/**
 * 常见问题
 * ---------------------------------------------------------------------------
 * 用原生 <details>/<summary> 实现折叠：无需 JS 状态，答案始终在 DOM 中。
 * FAQPage 结构化数据已静态写入 index.html 的 <head>（非渲染爬虫可读），
 * 这里不再运行时重复注入，避免页面出现两份 FAQPage schema。
 */
export default function Faq() {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">报名之前，你可能想问</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            把最常被问到的问题直接摆在这里。查不到的，直接加顾问微信问，比电话省事。
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 lg:grid-cols-2 lg:gap-5">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-gray-200 bg-white transition-colors open:border-nbyte-200 open:bg-nbyte-50/40"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-base font-bold leading-snug text-nbyte-900">
                  {item.q}
                </span>
                <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-nbyte-400 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="px-6 pb-6 text-sm leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
