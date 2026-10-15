import { MapPin, Check } from 'lucide-react';
import { baseImages, baseFeatures } from '@/data';

export default function Base() {
  return (
    <section id="base" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image Mosaic: 1 large + 2 small */}
          <div className="flex flex-col gap-3 lg:gap-4">
            {/* Desktop / tablet: grid layout */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-2 sm:gap-4">
              {/* Large image — spans both rows on sm+ */}
              <figure className="sm:row-span-2">
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={baseImages[0].src}
                    alt={baseImages[0].alt}
                    width={1280}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover sm:h-full sm:min-h-[420px]"
                  />
                </div>
                <figcaption className="mt-1.5 text-xs text-gray-400">
                  {baseImages[0].caption}
                </figcaption>
              </figure>

              {/* Small image 1 */}
              <figure>
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={baseImages[1].src}
                    alt={baseImages[1].alt}
                    width={1280}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover sm:h-[200px]"
                  />
                </div>
                <figcaption className="mt-1.5 text-xs text-gray-400">
                  {baseImages[1].caption}
                </figcaption>
              </figure>

              {/* Small image 2 */}
              <figure>
                <div className="overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={baseImages[2].src}
                    alt={baseImages[2].alt}
                    width={1280}
                    height={960}
                    loading="lazy"
                    decoding="async"
                    className="h-40 w-full object-cover sm:h-[200px]"
                  />
                </div>
                <figcaption className="mt-1.5 text-xs text-gray-400">
                  {baseImages[2].caption}
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-nbyte-500">
              Training Base
            </span>
            <h2 className="mt-3 text-3xl font-bold text-nbyte-900 sm:text-4xl">
              潍坊奎文实训基地
            </h2>
            <p className="mt-6 text-base leading-relaxed text-gray-600">
              位于山东省潍坊市奎文区，拥有专业的空域申请能力和标准化的实飞场地。
              基地配备多种型号真机设备，由资深教员全程带飞指导，确保每位学员都能获得充分的实操训练时间。
            </p>

            {/* Feature Tags */}
            <div className="mt-8 flex flex-wrap gap-3">
              {baseFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="inline-flex items-center gap-2 rounded-full border border-nbyte-100 bg-nbyte-50 px-5 py-2.5"
                  >
                    <Icon className="h-4 w-4 text-nbyte-600" />
                    <span className="text-sm font-semibold text-nbyte-700">
                      #{feature.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Highlights list */}
            <div className="mt-8 space-y-3">
              {[
                '标准化实飞场地，空域审批流程完善',
                '多型号真机实操，贴合实际作业场景',
                '小班制教学，教员一对一指导带飞',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-cyan/15">
                    <Check className="h-3.5 w-3.5 text-accent-cyan" />
                  </div>
                  <span className="text-sm leading-relaxed text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
