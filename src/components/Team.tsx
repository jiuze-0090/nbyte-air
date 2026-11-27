import { Award, Layers } from 'lucide-react';

import { systemInfo, teamMembers } from '@/data';

/**
 * 教学团队与体系署名栏
 * ---------------------------------------------------------------------------
 * 数据源头在 data.ts 的 teamMembers / systemInfo，本组件只负责渲染。
 * credentials 为空的成员不显示资质栏——宁可留白，不摆空壳、不堆未经核验的头衔。
 * 岗位与教学方向属客观信息；获奖/协会职务/政府聘任必须有原件才写进 data.ts。
 */
export default function Team() {
  return (
    <section id="team" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-2xl">
          <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
            Our Team
          </span>
          <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">
            教学团队与体系署名
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            教研、教学与内容更新由本地团队完成。岗位与教学方向如实列出；
            资质与荣誉以可核验原件为准，未提供证明的一律不列。
          </p>
        </div>

        {/* 教练卡片 */}
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {teamMembers.map((member) => (
            <li
              key={member.name}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-nbyte-600 text-lg font-bold text-white">
                  {member.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-nbyte-900">{member.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-nbyte-600">{member.role}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">{member.bio}</p>

              {member.credentials.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-nbyte-700">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    资质与荣誉
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {member.credentials.map((cred) => (
                      <li
                        key={cred.label}
                        className="flex items-baseline justify-between gap-3 text-xs text-gray-600"
                      >
                        <span>{cred.label}</span>
                        {cred.year && (
                          <span className="tnum shrink-0 text-gray-400">{cred.year}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* 体系署名：岗位归属的可迁移骨架 */}
        <div className="mt-10 rounded-xl bg-gray-50 p-6 ring-1 ring-gray-100 sm:p-8">
          <h3 className="flex items-center gap-2 text-base font-bold text-nbyte-900">
            <Layers className="h-4 w-4 text-nbyte-600" aria-hidden="true" />
            体系版本与更新记录
          </h3>
          <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-500">版本号</dt>
              <dd className="tnum mt-1 text-sm font-semibold text-nbyte-900">
                {systemInfo.version} · {systemInfo.updatedAt}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">版权主体</dt>
              <dd className="mt-1 text-sm font-semibold text-nbyte-900">
                {systemInfo.copyrightOwner}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">体系负责人</dt>
              <dd className="mt-1 text-sm font-semibold text-nbyte-900">
                {teamMembers[0]?.name ?? '—'}
              </dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-1.5 border-t border-gray-200 pt-4">
            {systemInfo.changelog.map((entry) => (
              <li key={entry.date + entry.text} className="flex gap-3 text-xs text-gray-600">
                <span className="tnum shrink-0 font-semibold text-nbyte-600">{entry.date}</span>
                <span>{entry.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
