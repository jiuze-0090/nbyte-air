import { ArrowUpRight, MapPin, Phone } from 'lucide-react';

import BrandMark from '@/components/BrandMark';
import { ecosystemLinks, navLinks } from '@/data';

/**
 * 备案号槽位
 * ---------------------------------------------------------------------------
 * 站点尚未完成 ICP 备案，因此此处留空、不展示。
 * 备案下来后，把工信部下发的号填进下面这个常量即可自动显示
 * （例如 '鲁ICP备XXXXXXXX号'），无需改动组件结构。
 */
const ICP_NUMBER = '';

const HOTLINES = [
  { num: '156-1009-0090', note: '招生咨询 · 微信同号' },
  { num: '198-0611-2859', note: '技术咨询 · 微信同号' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-nbyte-950">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* 品牌 */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-7 w-7 text-white" />
              <span className="text-lg font-bold text-white">新字节航空 Nbyte Air</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-nbyte-300/70">
              潍坊无人机驾驶员执照培训与实训基地。理论到实操一站式培养，并提供设备组装与出口服务。
            </p>
            <div className="mt-5 flex items-start gap-2.5 text-sm text-nbyte-300/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
              <span>
                山东省潍坊市奎文区
                <br />
                新字节航空实训基地
              </span>
            </div>
          </div>

          {/* 快速导航 */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white">快速导航</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="text-sm text-nbyte-300/75 transition-colors hover:text-accent-cyan"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-white">招生热线</h3>
            <ul className="mt-4 space-y-3">
              {HOTLINES.map((h) => (
                <li key={h.num}>
                  <a
                    href={`tel:${h.num.replace(/-/g, '')}`}
                    className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-accent-cyan"
                  >
                    <Phone className="h-3.5 w-3.5 text-accent-cyan" />
                    {h.num}
                  </a>
                  <p className="mt-0.5 pl-6 text-xs text-nbyte-400">{h.note}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* 学习资源区（五端矩阵入口） */}
          <div id="resources" className="scroll-mt-24 lg:col-span-4">
            <h3 className="text-sm font-semibold text-white">学习资源</h3>
            <ul className="mt-4 space-y-3">
              {ecosystemLinks.map((item) => {
                const inner = (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      <span className="rounded-full bg-accent-cyan/15 px-2 py-0.5 text-xs font-medium text-accent-cyan">
                        {item.tag}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-nbyte-300/70">
                      {item.desc}
                    </span>
                    {item.hint && (
                      <span className="mt-1.5 block text-xs text-nbyte-400">{item.hint}</span>
                    )}
                  </>
                );

                return (
                  <li key={item.title}>
                    {item.href ? (
                      <a
                        href={item.href}
                        // 外链才开新窗；电话直拨留在当前页，避免手机上跳到空白标签
                        {...(item.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="block rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-accent-cyan/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan"
                      >
                        {inner}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-cyan">
                          {item.action || '前往'}
                          {item.href.startsWith('http') ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <Phone className="h-3 w-3" />
                          )}
                        </span>
                      </a>
                    ) : (
                      // 无链接：明确做成不可点的禁用态，不能和可点卡片长得一样
                      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 opacity-80">
                        {inner}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-nbyte-400">
                          {item.action || '暂未开放'}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* 版权行 */}
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-nbyte-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} 新字节航空 Nbyte Air · 山东新字节航空科技有限公司 · 专业的多旋翼无人机驾驶员执照培训与实训基地
          </p>
          {ICP_NUMBER && (
            <p>
              <a
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {ICP_NUMBER}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
