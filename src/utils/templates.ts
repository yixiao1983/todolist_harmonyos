/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectTemplate } from '../types';

export const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'hm-release',
    name: 'HarmonyOS 原生上架准备清单',
    description: '适配 HarmonyOS NEXT 纯血系统的核心上架审核标准，助力一次上架成功。',
    tasks: [
      {
        title: '提供公网可访问的《隐私政策》URL',
        description: '华为审核严查，需包含收集个人数据的具体场景，以及注销账号的明确说明。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['政策', '审核', '必填'],
        subtasks: ['确认隐私条款中包含一键物理注销方法', '部署生产环境公网静态URL', '后台配置免扫码隐私查看页面']
      },
      {
        title: '生成符合 NEXT 规范的桌面自适应图标',
        description: '系统提供圆形、和异形裁切。需上传背景层 (204% 放大比例) 与前景 Logo 层分离的 SVG 或 PNG。',
        priority: 'HIGH',
        quadrant: 2,
        tags: ['视觉', '基础'],
        subtasks: ['生成 204% 背景图层', '生成独立透明前景 Logo 关键物透明图', '在 AppGallery 填报自适应裁剪参数']
      },
      {
        title: '配置后台通知与常驻卡片能力',
        description: '需要接入 `@ohos.notificationManager`，测试在应用被杀死或睡眠状态下定时弹窗是否符合体验指标。',
        priority: 'MEDIUM',
        quadrant: 2,
        tags: ['技术', '优化'],
        subtasks: ['初始化本地事件代理唤醒', '设置通知分类为 TRANSACTIONAL (事务型)', '真机锁屏模拟通知弹出测试']
      },
      {
        title: '适配多款代表性真机截图',
        description: '需要提供折叠屏、普通直板机、Pad 平板这三种主流分辨率的应用首屏及核心看板截图。',
        priority: 'LOW',
        quadrant: 3,
        tags: ['资产', '上架'],
        subtasks: ['准备 1080x2340 手机实机图 (3张)', '准备折叠流转截图 (2张)', '准备 2K Pad 适配截图 (2张)']
      }
    ]
  },
  {
    id: 'weekly-efficiency',
    name: '高效周计划工作模版',
    description: '通过经典四象限理论分配任务，深度结合番茄时钟帮助快速进入办公流。',
    tasks: [
      {
        title: '撰写核心业务重构方案',
        description: '整理老旧模块，减少状态依赖，并将公共方法提取。',
        priority: 'HIGH',
        quadrant: 2,
        tags: ['工作', '重构'],
        subtasks: ['梳理旧组件层级结构图', '重置 state 穿透不合规依赖', '提取 3 个核心 utility 方法到 libs 目录']
      },
      {
        title: '处理线上严重白屏卡死反馈',
        description: '紧急修复移动端在特定浏览器下渲染不当或闪退 bug。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['缺陷', '紧急'],
        subtasks: ['排查 webpack 循环引用错误', '补充 boundary 降级 UI 拦截', '打包发布 v1.0.4 补丁包']
      },
      {
        title: '下半年度团队技术分享会 PPT',
        description: '分享 HarmonyOS 原生开发踩坑心得和跨端流转的最佳实践。',
        priority: 'MEDIUM',
        quadrant: 4,
        tags: ['技术', '成长'],
        subtasks: ['完成框架部分第一章讲解大纲', '撰写 linear haptics 案例源码', '预定下周四下午的大型会议室准备发言']
      },
      {
        title: '周五下班前发每周简报汇报进度',
        description: '向部门主管总结本周产出、消耗的番茄钟数量、下周核心攻坚路线图。',
        priority: 'LOW',
        quadrant: 3,
        tags: ['周报', '日常'],
        subtasks: ['导出 Focus-stats 专注时数看板', '撰写已交付的 3 个敏捷颗粒详情', '在协同系统上提交工单']
      }
    ]
  },
  {
    id: 'travel-packing',
    name: '华为差旅与极简会议打包清单',
    description: '专为高频商务出差、拜访客户和设备调试设计的快速检查工具。',
    tasks: [
      {
        title: '开发者测试设备与连接线材',
        description: '适配多机型调试和无线通信投屏需要。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['装备', '出差'],
        subtasks: ['HarmonyOS 真机开发调试样机 (Mate60 Pro)', '100W GAN 三口快充旅行充电头', 'Type-C 高速数据线以及 HDMI 二合一投屏转接器']
      },
      {
        title: '常用会议必备实体材料',
        description: '客户宣讲、面谈签单与隐私资质签署。',
        priority: 'MEDIUM',
        quadrant: 2,
        tags: ['材料', '会议'],
        subtasks: ['双方公司盖章版纸质 NDA 原件两份', '华为开发者联盟企业账号安全密钥', '防窥钢化保护膜及备用证件照片']
      }
    ]
  }
];
