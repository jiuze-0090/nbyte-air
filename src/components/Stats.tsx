const stats = [
  { value: '3+', unit: '年', label: '深耕无人机行业，专注培训与技术服务' },
  { value: '500+', unit: '名', label: '累计培训学员，覆盖全国多省市' },
  { value: 'CAAC', unit: '', label: '持民航局运营合格证，执照全国通用、官网可查' },
  { value: '20+', unit: '家', label: '合作企业与就业推荐单位' },
];

export default function Stats() {
  return (
    <section className="bg-nbyte-950 py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-8 sm:gap-10 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-lg font-semibold text-nbyte-300 sm:text-xl">
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-nbyte-200/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* 资质与考试口径：资质编号写明、责任边界讲清，避免使用受管制的机构类别称谓 */}
        <div className="mt-12 border-t border-nbyte-800/60 pt-8 text-center">
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-nbyte-300/70">
            山东新字节航空科技有限公司持有民航局《民用无人驾驶航空器运营合格证》
            <span className="font-medium text-nbyte-200">（UMOC-0-HQ-20250507079）</span>
            ，经营种类含培训类，有效期 2025-05 至 2027-05，可在民航局 UOM 平台查询。
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-nbyte-300/60">
            执照由民航局颁发，理论与实操考试的报名受理、学籍登记由民航局授权培训机构统一办理；
            本机构承担全部理论教学、真机实操与考前辅导。报考条件与考试规则，
            以中国民用航空局及当地民航地区管理局最新公布为准。
          </p>
        </div>
      </div>
    </section>
  );
}
