import {
  BookOpen,
  Scale,
  Cog,
  Sprout,
  Camera,
  Zap,
  Truck,
  LifeBuoy,
  Plane,
  ShieldCheck,
  Award,
  Briefcase,
} from 'lucide-react';

export const navLinks = [
  { label: '首页', id: 'hero' },
  { label: '培训课程', id: 'courses' },
  { label: '实训基地', id: 'base' },
  { label: '关于我们', id: 'about' },
  { label: '联系我们', id: 'contact' },
];

export const heroImage = '/images/hero.webp';

export const baseImages = [
  { src: '/images/base-practice.webp', alt: '户外真机实操训练', caption: '户外真机实操训练', loading: 'lazy' },
  { src: '/images/base-flight.webp', alt: '实飞演示与考核', caption: '实飞演示与考核', loading: 'lazy' },
  { src: '/images/base-classroom.webp', alt: '理论授课与设备装调', caption: '理论授课与设备装调', loading: 'lazy' },
];

export const aboutImage = '/images/about.webp';

export type CourseModule = {
  icon: typeof BookOpen;
  title: string;
  items: string[];
};

export const courseModules: CourseModule[] = [
  {
    icon: BookOpen,
    title: '基础理论',
    items: ['概述', '系统组成', '飞行原理', '气象学'],
  },
  {
    icon: Scale,
    title: '法规与安全',
    items: ['空中交通管制', '法律法规', '飞行手册'],
  },
  {
    icon: Cog,
    title: '实操技术',
    items: ['起降阶段操纵', '巡航阶段操纵', '装调检修'],
  },
  {
    icon: Plane,
    title: '行业应用',
    items: ['农业植保', '航拍测绘', '电力巡检', '物流运输', '应急救援'],
  },
];

export const applicationIcons = [
  { icon: Sprout, label: '农业植保' },
  { icon: Camera, label: '航拍测绘' },
  { icon: Zap, label: '电力巡检' },
  { icon: Truck, label: '物流运输' },
  { icon: LifeBuoy, label: '应急救援' },
];

export const baseFeatures = [
  { icon: Plane, label: '真机实操' },
  { icon: Award, label: '考证通过率高' },
  { icon: Briefcase, label: '就业推荐' },
];

export const aboutHighlights = [
  { icon: ShieldCheck, title: 'CAAC 执照培训', desc: '官方认证课程体系，覆盖多旋翼全等级' },
  { icon: Cog, title: '设备组装与出口', desc: '专业组装能力，面向国内外市场' },
  { icon: Award, title: '技术先行者', desc: '深耕低空经济领域，行业经验丰富' },
];
