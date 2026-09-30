import { courseModules, applicationIcons } from '@/data';

export default function Courses() {
  return (
    <section id="courses" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
            Training Courses
          </span>
          <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">
            系统化课程体系
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            从理论基础到行业实操，四大模块层层递进，全面覆盖无人机驾驶员所需技能。
          </p>
        </div>

        {/* Course Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courseModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <div
                key={module.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-nbyte-200/40"
              >
                {/* Number watermark */}
                <span className="absolute right-5 top-3 text-5xl font-bold text-gray-100 transition-colors group-hover:text-nbyte-100">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-nbyte-50 text-nbyte-600 transition-colors group-hover:bg-nbyte-600 group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-nbyte-900">
                    {module.title}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {module.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm text-gray-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-nbyte-500 to-accent-cyan transition-all duration-300 group-hover:w-full" />
              </div>
            );
          })}
        </div>

        {/* Industry Applications */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-nbyte-800 to-nbyte-950 p-8 lg:p-12">
          <h3 className="text-center text-xl font-bold text-white">
            行业应用方向
          </h3>
          <p className="mt-2 text-center text-sm text-nbyte-200">
            学成即就业，覆盖五大热门领域
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:gap-12">
            {applicationIcons.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.label}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-all hover:bg-accent-cyan/20 hover:ring-accent-cyan/40">
                    <Icon className="h-8 w-8 text-accent-cyan" />
                  </div>
                  <span className="text-sm font-medium text-nbyte-100">
                    {app.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
