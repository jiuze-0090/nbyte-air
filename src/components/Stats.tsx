const stats = [
  { value: '10+', unit: '年', label: '深耕无人机行业，专注培训与技术服务' },
  { value: '5,000+', unit: '名', label: '累计培训学员，覆盖全国多省市' },
  { value: '98%', unit: '', label: '考证综合通过率，教学成果经得起检验' },
  { value: '100+', unit: '家', label: '合作企业与就业推荐单位' },
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

        {/* Trust endorsement */}
        <div className="mt-12 border-t border-nbyte-800/60 pt-8 text-center">
          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-nbyte-300/60">
            新字节航空具备 CAAC 民用无人机驾驶员训练机构资质，培训体系符合民航局标准，证书全国通用、官网可查。
          </p>
          <p className="mt-3 text-xs text-nbyte-400/40">
            * 以上数据为示例占位，后续可替换为真实数据
          </p>
        </div>
      </div>
    </section>
  );
}
