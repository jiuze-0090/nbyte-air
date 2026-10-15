import { Phone, MapPin, QrCode, Plane } from 'lucide-react';

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-gradient-to-br from-nbyte-900 via-nbyte-950 to-nbyte-900 py-24"
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-accent-cyan">
            Contact Us
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            开启您的飞行生涯
          </h2>
          <p className="mt-4 text-base leading-relaxed text-nbyte-200">
            立即联系我们，获取课程详情与报名优惠。专业团队为您全程规划。
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Phone Numbers */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Phone className="h-5 w-5 text-accent-cyan" />
              招生热线
            </h3>
            {[
              { num: '156-1009-0090', note: '微信同号' },
              { num: '198-0611-2859', note: '微信同号' },
            ].map((phone) => (
              <a
                key={phone.num}
                href={`tel:${phone.num.replace(/-/g, '')}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-accent-cyan/40 hover:bg-white/10"
              >
                <div className="text-2xl font-bold text-white">{phone.num}</div>
                <div className="mt-1 text-sm text-nbyte-200">{phone.note}</div>
              </a>
            ))}

            {/* Address */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <MapPin className="h-5 w-5 text-accent-cyan" />
                实训地址
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-nbyte-200">
                山东省潍坊市奎文区
                <br />
                新字节航空实训基地
              </p>
            </div>
          </div>

          {/* QR Codes */}
          <div className="lg:col-span-2">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
              <QrCode className="h-5 w-5 text-accent-cyan" />
              扫码添加专属顾问
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  label: '扫码添加招生老师',
                  sub: '课程咨询 · 报名指导',
                  image: '/images/qr-qingdao.png',
                },
                {
                  label: '扫码添加技术顾问',
                  sub: '设备咨询 · 技术支持',
                  image: '/images/qr-weifang.png',
                },
              ].map((qr) => (
                <div
                  key={qr.label}
                  className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-accent-cyan/30 hover:bg-white/10"
                >
                  <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl bg-white">
                    <img
                      src={qr.image}
                      alt={qr.label}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-5 text-base font-semibold text-white">
                    {qr.label}
                  </p>
                  <p className="mt-1 text-sm text-nbyte-300">{qr.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-20 border-t border-white/10 pt-8 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-nbyte-400 to-nbyte-600">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">新字节航空 Nbyte Air</span>
          </div>
          <p className="mt-3 text-sm text-nbyte-400">
            © 2026 新字节航空 · 专业的多旋翼无人机驾驶员培训基地
          </p>
        </div>
      </div>
    </section>
  );
}
