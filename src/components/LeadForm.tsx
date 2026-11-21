import { useState } from 'react';
import { CheckCircle2, Copy, Send } from 'lucide-react';

import { leadFormConfig } from '@/data';

/**
 * 留资表单
 * ---------------------------------------------------------------------------
 * 默认不依赖任何后端：提交后生成一段结构化咨询信息并复制到剪贴板，
 * 用户加顾问微信直接粘贴发送即可。
 * 若在 leadFormConfig.endpoint 填入真实接口地址，提交会额外 POST 一份 JSON：
 * { name, phone, intent, message, consent, hp }
 *
 * 合规：手机号属个人信息，收集前必须取得单独同意（《个人信息保护法》第十三条、
 * 第十七条）。所以「同意告知书」勾选框默认不勾选，未勾选不提交。
 * 蜜罐字段 hp 对真人不可见、不填写；机器人批量提交会填上它，服务端据此拒收。
 */

type Status = 'idle' | 'submitting' | 'done';

const PHONE_RE = /^1[3-9]\d{9}$/;

export default function LeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [intent, setIntent] = useState(leadFormConfig.intents[0]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'name' | 'phone' | 'consent' | null>(null);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const buildSummary = () =>
    [
      '【新字节航空 · 课程咨询】',
      `姓名：${name.trim()}`,
      `手机：${phone.trim()}`,
      `意向：${intent}`,
      message.trim() ? `留言：${message.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 剪贴板 API 不可用时回退到 execCommand
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorField(null);

    if (!name.trim()) {
      setError('请填写称呼，方便顾问称呼你。');
      setErrorField('name');
      return;
    }
    if (!PHONE_RE.test(phone.trim())) {
      setError('手机号格式不对，请填 11 位大陆手机号。');
      setErrorField('phone');
      return;
    }
    if (!consent) {
      setError('请先阅读并勾选《学员咨询信息处理告知书》，我们才能收集你的联系方式。');
      setErrorField('consent');
      return;
    }

    setStatus('submitting');
    setSubmitError('');
    const text = buildSummary();
    setSummary(text);
    const ok = await copyText(text);
    setCopied(ok);

    let submitted = false;
    if (leadFormConfig.endpoint) {
      try {
        const res = await fetch(leadFormConfig.endpoint, {
          method: 'POST',
          // 用 text/plain 发，避开 CORS 预检：
          // 带 application/json 会触发 OPTIONS 预检，部分网关对预检的响应不完整，
          // 浏览器会直接判定跨域失败（fetch 抛异常，POST 根本发不出去）。
          // 服务端是自己 JSON.parse 请求体的，不看 Content-Type，这里改成 text/plain 一样能解析。
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            intent,
            message: message.trim(),
            source: window.location.href,
            // 合规：明确记录用户已勾选同意
            consent: true,
            // 蜜罐：真人看不到也填不了，机器人会填
            hp,
          }),
        });
        submitted = res.ok;
        if (!res.ok) {
          setSubmitError('提交没成功，可能是网络或接口异常。信息已复制，请直接发给顾问或拨打热线。');
        }
      } catch {
        // 端点不可用不阻断主流程，摘要已复制，用户仍可发给顾问
        setSubmitError('网络有点问题，暂时没提交成功。信息已复制，请发给顾问或拨打热线。');
      }
    }

    setStatus('done');
  };

  if (status === 'done') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-2xl lg:p-10">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-nbyte-900">
              {submitError
                ? '信息已复制，请发给顾问'
                : leadFormConfig.endpoint
                  ? '已收到，顾问今天内联系你'
                  : copied
                    ? '咨询信息已复制，去加顾问微信发送即可'
                    : '咨询信息已生成，请手动复制'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {submitError || '招生顾问在潍坊本地，通常当天回复。若急，也可以直接拨打'}{' '}
              <a href="tel:15610090090" className="font-semibold text-nbyte-600">
                156-1009-0090
              </a>
              （微信同号）。
            </p>
          </div>
        </div>

        <textarea
          readOnly
          value={summary}
          rows={6}
          className="mt-6 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 focus:border-nbyte-400 focus:outline-none focus:ring-2 focus:ring-nbyte-200"
          onFocus={(e) => e.currentTarget.select()}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={async () => {
              const ok = await copyText(summary);
              setCopied(ok);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-nbyte-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-nbyte-700"
          >
            <Copy className="h-4 w-4" />
            再次复制
          </button>
          <a
            href="#contact"
            onClick={() => {
              setStatus('idle');
              setSummary('');
              setCopied(false);
              setSubmitError('');
              setName('');
              setPhone('');
              setMessage('');
              setConsent(false);
              setHp('');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-nbyte-400 hover:text-nbyte-700"
          >
            重新填写
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-8 shadow-2xl lg:p-10"
    >
      <div className="flex items-center gap-2.5">
        <Send className="h-5 w-5 text-nbyte-600" />
        <h3 className="text-xl font-bold text-nbyte-900">留下联系方式，顾问主动找你</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        填完生成一段咨询信息，添加顾问微信粘贴发送即可。不收费，不强推。
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className="mb-2 block text-sm font-semibold text-nbyte-900">
            称呼 <span className="text-accent-orange">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="怎么称呼你"
            autoComplete="name"
            aria-invalid={errorField === 'name'}
            aria-describedby={errorField === 'name' ? 'lead-error' : undefined}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-nbyte-400 focus:outline-none focus:ring-2 focus:ring-nbyte-200"
          />
        </div>

        <div>
          <label htmlFor="lead-phone" className="mb-2 block text-sm font-semibold text-nbyte-900">
            手机号 <span className="text-accent-orange">*</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="11 位手机号，方便回电"
            autoComplete="tel"
            aria-invalid={errorField === 'phone'}
            aria-describedby={errorField === 'phone' ? 'lead-error' : undefined}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-nbyte-400 focus:outline-none focus:ring-2 focus:ring-nbyte-200"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="lead-intent" className="mb-2 block text-sm font-semibold text-nbyte-900">
            想了解
          </label>
          <select
            id="lead-intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-nbyte-400 focus:outline-none focus:ring-2 focus:ring-nbyte-200"
          >
            {leadFormConfig.intents.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="lead-message" className="mb-2 block text-sm font-semibold text-nbyte-900">
            补充说明
          </label>
          <textarea
            id="lead-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="比如：在职 / 学生、想考视距内还是超视距、有没有飞行基础"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:border-nbyte-400 focus:outline-none focus:ring-2 focus:ring-nbyte-200"
          />
        </div>
      </div>

      {error && (
        <p
          id="lead-error"
          role="alert"
          className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      {/* 蜜罐：真人看不到（移出视口）也填不了，脚本批量提交会填它 */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto' }}>
        <label htmlFor="lead-hp">请勿填写</label>
        <input
          id="lead-hp"
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      {/* 个人信息处理单独同意（《个人信息保护法》第十三条） */}
      <div className="mt-5">
        <label
          htmlFor="lead-consent"
          className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-gray-700"
        >
          <input
            id="lead-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked && errorField === 'consent') {
                setError('');
                setErrorField(null);
              }
            }}
            aria-required="true"
            aria-invalid={errorField === 'consent'}
            aria-describedby="lead-consent-note"
            className="mt-1 h-4 w-4 shrink-0 accent-[#FF6B35]"
          />
          <span>
            我已阅读并同意
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-nbyte-600 underline underline-offset-2 hover:text-nbyte-700"
            >
              《学员咨询信息处理告知书》
            </a>
            ，同意山东新字节航空科技有限公司为回复我的咨询并安排课程，处理我的称呼、手机号、
            意向班型与咨询内容。
          </span>
        </label>
        <p id="lead-consent-note" className="mt-1.5 pl-7 text-xs leading-relaxed text-gray-500">
          手机号仅用于招生联系，不会用于其他用途，也不会提供给无关第三方。咨询信息默认保存 6 个月，
          你可随时电话撤回同意。
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-orange px-8 py-3.5 text-base font-semibold text-[#1A1A1A] shadow-lg shadow-accent-orange/25 transition-all hover:bg-[#E8551F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting'
          ? '提交中…'
          : leadFormConfig.endpoint
            ? '提交，顾问联系我'
            : '生成咨询信息'}
        <Send className="h-4 w-4" />
      </button>

      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        提交即表示你已阅读并同意
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-nbyte-600 underline underline-offset-2 hover:text-nbyte-700"
        >
          《学员咨询信息处理告知书》
        </a>
        。
      </p>
    </form>
  );
}
