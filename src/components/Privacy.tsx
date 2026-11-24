import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * 学员咨询信息处理告知书
 *
 * 用 hash 路由（/#privacy）而非独立静态页面：
 * Cloudflare Pages 会把 /privacy 系列路径拦截成 404，
 * 而 hash 不会发到服务器，请求永远是首页（200），由本组件接管渲染。
 * 正文涵盖 PIPL 第十七条全部告知事项，与留资表单的勾选提示对应。
 */
export default function Privacy({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto bg-nbyte-950/70 px-4 py-8 backdrop-blur-sm sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      onClick={onClose}
    >
      <article
        className="relative mx-auto max-w-3xl rounded-2xl bg-white px-6 py-9 text-[#0c1645] shadow-2xl sm:px-10 sm:py-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭告知书"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-nbyte-50 text-nbyte-700 transition-colors hover:bg-nbyte-100 sm:right-6 sm:top-6"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="mb-2 text-xs text-slate-500">
          山东新字节航空科技有限公司 · 版本 1.0 · 生效日期 2026 年 11 月 21 日
        </p>
        <h1 id="privacy-title" className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
          学员咨询信息处理告知书
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-slate-600">
          本告知书说明我们在你通过本网站的「课程咨询」表单提交信息时，如何收集和使用这些信息。
          依据《中华人民共和国个人信息保护法》第十七条向你告知下列事项。
        </p>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">一、我们是谁</h2>
          <p className="text-sm leading-7 text-slate-700">
            个人信息处理者：<strong>山东新字节航空科技有限公司</strong>（下称"我们"或"本机构"）
            <br />
            经营地址：山东省潍坊市奎文区
            <br />
            咨询电话：
            <a href="tel:15610090090" className="font-medium text-nbyte-600 underline underline-offset-2">
              156-1009-0090
            </a>
            （微信同号）
            <br />
            备用电话：
            <a href="tel:19806112859" className="font-medium text-nbyte-600 underline underline-offset-2">
              198-0611-2859
            </a>
            （微信同号）
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">二、我们收集哪些信息</h2>
          <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead className="bg-nbyte-50">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2.5 font-semibold">信息项</th>
                  <th className="px-3 py-2.5 font-semibold">说明</th>
                  <th className="px-3 py-2.5 font-semibold">是否必填</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-3 py-2.5">称呼</td>
                  <td className="px-3 py-2.5">你填写的姓名或昵称，仅用于顾问称呼你</td>
                  <td className="px-3 py-2.5">必填</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-3 py-2.5">手机号</td>
                  <td className="px-3 py-2.5">用于回电、发送课程安排与考试提醒</td>
                  <td className="px-3 py-2.5">必填</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-3 py-2.5">意向班型</td>
                  <td className="px-3 py-2.5">你在下拉框中选择的咨询方向，用于匹配顾问</td>
                  <td className="px-3 py-2.5">选填</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-3 py-2.5">补充说明</td>
                  <td className="px-3 py-2.5">你主动填写的学情、基础、报考方向等文字</td>
                  <td className="px-3 py-2.5">选填</td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-3 py-2.5">来源页面</td>
                  <td className="px-3 py-2.5">你从哪个页面提交的表单，用于统计来源渠道</td>
                  <td className="px-3 py-2.5">系统自动</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            我们不会在你未勾选同意的情况下收集上述信息。若你未勾选同意仍点击提交，页面会提示你完成勾选。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">三、我们为什么收集、怎么处理</h2>
          <p className="mb-2 text-sm leading-7 text-slate-700">
            <strong>处理目的：</strong>回复你的课程咨询、介绍匹配的培训方案与开班安排、必要时发送考试与开训提醒。
          </p>
          <p className="mb-2 text-sm leading-7 text-slate-700">
            <strong>处理方式：</strong>由招生顾问人工查看，并通过企业内部办公工具传递给你指定的联系人。
            整个过程限于人工处理与电话、微信沟通，不做自动化决策，不用于用户画像。
          </p>
          <p className="text-sm leading-7 text-slate-700">
            <strong>不会做的事：</strong>不出售你的个人信息，不向无关第三方提供，不用于其他用途，
            不在你未另行同意的情况下用于营销推广。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">四、保存期限</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-7 text-slate-700">
            <li>
              <strong>仅咨询、未报名：</strong>自你提交之日起保存 6 个月，期满后删除或匿名化。
            </li>
            <li>
              <strong>已报名参训：</strong>自你提交之日起保存至培训合同履行完毕，并按法律法规规定保留
              会计、税务等必要档案的保存期限。
            </li>
            <li>撤回同意后，我们将停止除法律法规要求必须保留之外的处理，并在合理期限内删除。</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">五、你可以怎样行使权利</h2>
          <p className="mb-2 text-sm leading-7 text-slate-700">
            依据《个人信息保护法》，你有权查阅、复制、更正、补充、删除你的个人信息，
            并有权撤回你的同意。撤回同意不影响撤回前基于同意已进行的处理活动。
          </p>
          <p className="mb-2 text-sm leading-7 text-slate-700">
            行使方式：拨打
            <a href="tel:15610090090" className="font-medium text-nbyte-600 underline underline-offset-2">
              156-1009-0090
            </a>
            （微信同号），或通过微信联系招生顾问，说明"撤回咨询信息的收集"即可。
            我们会在收到你的请求后 3 个工作日内答复并处理。
          </p>
          <p className="text-sm leading-7 text-slate-700">
            若你认为我们的处理侵害了你的权益，也可以通过上述方式与我们联系，或依法向有管辖权的
            个人信息保护主管部门投诉、举报。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-bold">六、数据存储与跨境</h2>
          <p className="text-sm leading-7 text-slate-700">
            我们收集的个人信息存储在中华人民共和国境内的服务器上，<strong>不向境外提供</strong>，
            不涉及个人信息跨境传输。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-base font-bold">七、未成年人</h2>
          <p className="text-sm leading-7 text-slate-700">
            本网站面向 CAAC 民用无人驾驶航空器驾驶员培训，学员须年满 16 周岁且具备完全民事行为能力。
            若你未满 16 周岁，请在监护人陪同下阅读本告知书，并由监护人代为提交信息。
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-accent-orange px-7 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:bg-[#E8551F]"
          >
            我已阅读，返回表单
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-nbyte-600 underline underline-offset-2"
          >
            关闭
          </button>
        </div>
      </article>
    </div>
  );
}
