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
  GraduationCap,
  CalendarDays,
  Clock,
  Coins,
} from 'lucide-react';

export const navLinks = [
  { label: '首页', id: 'hero' },
  { label: '培训课程', id: 'courses' },
  { label: '实训基地', id: 'base' },
  { label: '关于我们', id: 'about' },
  { label: '常见问题', id: 'faq' },
  { label: '联系我们', id: 'contact' },
  { label: '学习资源', id: 'resources' },
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
  { icon: Award, label: '资深教员带飞' },
  { icon: Briefcase, label: '就业推荐' },
];

export const aboutHighlights = [
  { icon: ShieldCheck, title: 'CAAC 执照考前培训', desc: '按民航局考纲组织教学，覆盖多旋翼全等级' },
  { icon: Cog, title: '设备组装与出口', desc: '专业组装能力，面向国内外市场' },
  { icon: Award, title: '技术先行者', desc: '深耕低空经济领域，行业经验丰富' },
];

/**
 * 课程总览：把意向学员真正会问的三件事摆在明面上
 * ---------------------------------------------------------------------------
 * value 为空字符串时，页面显示「详询招生顾问」——留出数据槽位，但不编造数字。
 * 填入真实数据后无需改代码即可生效。
 */
export type CourseFact = {
  icon: typeof BookOpen;
  label: string;
  value: string;
};

export const courseFacts: CourseFact[] = [
  {
    icon: GraduationCap,
    label: '证书类型',
    value: 'CAAC《民用无人驾驶航空器操控员执照》',
  },
  {
    icon: Award,
    label: '执照等级',
    value: '视距内 / 超视距 全等级覆盖',
  },
  {
    icon: BookOpen,
    label: '教学形式',
    value: '理论授课 + 真机实操 + 教员一对一带飞',
  },
  { icon: CalendarDays, label: '开班日期', value: '' },
  { icon: Clock, label: '学制（理论 + 实操）', value: '' },
  { icon: Coins, label: '学费', value: '' },
];

/** 事实型 FAQ：答案全部取自站内已有信息，不做超出机构口径的承诺 */
export const faqItems: { q: string; a: string }[] = [
  {
    q: '拿的是什么证？全国通用吗？',
    a: '结业后可考取 CAAC《民用无人驾驶航空器操控员执照》，分视距内与超视距两个等级。执照由民航局颁发，全国通用、官网可查；考试报名与学籍登记由民航局授权培训机构统一受理。',
  },
  {
    q: '你们是什么资质？需要自己去报名考试吗？',
    a: '本机构持有民航局《民用无人驾驶航空器运营合格证》（UMOC-0-HQ-20250507079，经营种类含培训类，有效期 2025-05 至 2027-05），可在民航局 UOM 平台查询。执照由民航局颁发，理论与实操考试的报名受理、学籍登记由民航局授权培训机构统一办理；我们承担全部理论教学、真机实操与考前辅导，报名环节有专人跟进，不需要学员自己折腾。',
  },
  {
    q: '课程具体包含哪些内容？',
    a: '四个模块递进：基础理论（系统组成、飞行原理、气象学）、法规与安全（空中交通管制、法律法规、飞行手册）、实操技术（起降与巡航阶段操纵、装调检修）、行业应用（植保、测绘、电力巡检、物流、应急救援）。',
  },
  {
    q: '实操是怎么上的？',
    a: '潍坊奎文实训基地配备多种型号真机设备，标准化实飞场地，小班制教学，教员一对一全程带飞指导，确保每位学员都能获得充分的实操训练时间。',
  },
  {
    q: '理论要学多久？总共多少天？',
    a: '学制随班型安排，具体天数请直接咨询招生顾问（156-1009-0090 / 198-0611-2859，微信同号）。',
  },
  {
    q: '学费大概多少？',
    a: '费用随班型与人数不同，咨询顾问可给出当期准确报价。也可以先加顾问微信拿课程大纲，看完再决定。',
  },
  {
    q: '学完能做什么？',
    a: '五个方向：农业植保、航拍测绘、电力巡检、物流运输、应急救援。基地同时提供就业推荐，已合作 20+ 家企业与用人单位。',
  },
  {
    q: '在哪儿上课？外地学员怎么安排？',
    a: '潍坊奎文实训基地（山东省潍坊市奎文区）。基地具备空域申请能力与标准化实飞场地，可为外地学员统一安排理论与实操的时间衔接；住宿与到站接驳请咨询顾问。',
  },
  {
    q: '报名前想先把理论学一学，有免费的地方吗？',
    a: '有。官网配套「低空原理实验室」（lab.nbyteair.com），用可交互的实验把飞行原理讲透，报名前的理论准备可以先在上面完成，不收费。',
  },
];

/**
 * 五端矩阵入口
 * ---------------------------------------------------------------------------
 * 官网是「所有流量的终点」，也是「对外分发内容的起点」。
 * href 为空表示该端暂无可跳转链接（例如微信小程序需小程序码），改为展示说明文案。
 */
export type EcosystemLink = {
  title: string;
  desc: string;
  href: string;
  tag: string;
  /** 无链接时展示的提示文案 */
  hint?: string;
  /** 卡片底部的动作文案（点下去会发生什么） */
  action?: string;
};

export const ecosystemLinks: EcosystemLink[] = [
  {
    title: '低空原理实验室',
    desc: '10 个交互实验 · 106 条考点索引 · 5 张原理速查卡',
    href: 'https://lab.nbyteair.com/',
    tag: '免费公开',
    action: '前往实验室',
  },
  {
    // 备案期：链接直拨热线，小程序上线后只改这一处数据即可切回
    title: '学员小程序',
    desc: '1953 道真题 · 12+1 类目 · 错题一键回溯原理',
    href: 'tel:15610090090',
    tag: '即将开放',
    hint: '小程序备案中，先打电话领自测清单；微信搜索「UAV-NEWSKY」',
    action: '领取自测清单',
  },
];

/**
 * 留资表单
 * ---------------------------------------------------------------------------
 * endpoint 留空时，表单降级为「生成咨询摘要 + 一键复制」，无需后端即可用；
 * 配置为真实接口地址后，提交会同时 POST JSON：{ name, phone, intent, message }。
 */
export const leadFormConfig = {
  /**
   * 留资接口地址
   * ---------------------------------------------------------------------------
   * 优先级：环境变量 VITE_LEAD_ENDPOINT > 下面的默认地址。
   * 这个 URL 本身是公开的（浏览器要直接调它），写进代码不算泄密；
   * 真正的密钥是云函数里的企微 webhook，只存在于腾讯云环境变量中。
   * 换接口时改这里，或在 Cloudflare Pages 环境变量里配 VITE_LEAD_ENDPOINT（推荐，可不改代码）。
   */
  endpoint:
    import.meta.env.VITE_LEAD_ENDPOINT ||
    'https://1499488717-cndmzvtany.ap-shanghai.tencentscf.com',
  intents: [
    '多旋翼视距内执照',
    '多旋翼超视距执照',
    '企业合作 / 团培',
    '设备组装与出口',
    '其他咨询',
  ],
};

