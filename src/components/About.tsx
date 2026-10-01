import { aboutImage, aboutHighlights } from '@/data';

export default function About() {
  return (
    <section id="about" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
              About Us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">
              关于新字节航空
            </h2>
            <p className="mt-6 text-base leading-relaxed text-gray-600">
              新字节航空致力于无人机人才培养与技术服务。我们不仅提供专业的
              CAAC 无人机执照培训，还具备专业的无人机设备组装与出口能力，
              是行业内的技术先行者。
            </p>

            {/* Highlights */}
            <div className="mt-8 space-y-5">
              {aboutHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-nbyte-600 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-nbyte-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={aboutImage}
                alt="无人机培训实操"
                className="h-[400px] w-full object-cover lg:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-nbyte-900/20 to-transparent" />
            </div>
            {/* Floating stat card */}
            <div className="relative -mt-12 ml-6 rounded-xl bg-white p-5 shadow-xl ring-1 ring-gray-100 sm:ml-12">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-nbyte-600">100%</div>
                <div className="text-sm text-gray-600">
                  覆盖 CAAC 视距内 超视距
                  <br />
                  全等级培训认证
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
