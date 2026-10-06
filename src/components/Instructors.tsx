import { UserCircle2 } from 'lucide-react';

const instructors = [
  {
    name: '宋玖泽',
    title: '首席飞行教员',
    bio: 'CAAC 无人机驾驶员执照教员，累计安全飞行 5,000+ 小时。曾参与电力巡检、航拍测绘等多个行业项目，擅长零基础学员教学。',
  },
  {
    name: '张鑫鹏',
    title: '理论教学负责人',
    bio: '民航局认证理论教员，深耕飞行原理与航空气象教学 5 年。善于将复杂知识点拆解为易懂案例，帮助学员高效备考、一次通过。',
  },
  {
    name: '张凯',
    title: '行业应用导师',
    bio: '农业植保与航拍测绘方向资深讲师，持有多机型操作资质。曾为多家企业提供无人机作业培训，熟悉行业真实作业流程与就业需求。',
  },
];

export default function Instructors() {
  return (
    <section id="instructors" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
            Instructor Team
          </span>
          <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">
            资深教员团队，手把手带你飞
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            全部持证上岗，平均飞行时长超 3,000 小时，理论与实操双轨教学
          </p>
        </div>

        {/* Instructor Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((inst) => (
            <div
              key={inst.name}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-nbyte-200/40"
            >
              {/* Photo placeholder */}
              <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-nbyte-50 to-nbyte-100">
                <UserCircle2 className="h-20 w-20 text-nbyte-300 transition-colors group-hover:text-nbyte-400" />
              </div>

              {/* Info */}
              <div className="p-7">
                <h3 className="text-xl font-bold text-nbyte-900">
                  {inst.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-accent-cyan">
                  {inst.title}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {inst.bio}
                </p>
              </div>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-nbyte-500 to-accent-cyan transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>

        {/* Closing line */}
        <div className="mt-14 text-center">
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-500">
            每位学员配备专属教员，小班制教学，理论 + 模拟 + 实飞三阶段循序渐进，确保学得会、考得过、用得上。
          </p>
        </div>
      </div>
    </section>
  );
}
