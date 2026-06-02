/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectTemplate } from '../types';

export const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'weekly-meeting',
    name: '周会汇报与总结模版',
    description: '高效组织和复盘每周工作进度，让开会不再流于形式。',
    tasks: [
      {
        title: '梳理本周核心产出数据',
        description: '量化本周的工作成果，提取最关键的业务指标进行汇报。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['数据', '周会'],
        subtasks: ['导出本周任务完成量', '整理核心业务增长指标', '制作可视化图表']
      },
      {
        title: '记录下周重点待办项',
        description: '与团队对齐下周的工作重心，明确关键路径。',
        priority: 'HIGH',
        quadrant: 2,
        tags: ['规划', '对齐'],
        subtasks: ['列出下周Top3优先级任务', '评估所需资源和风险', '更新至团队协同文档']
      },
      {
        title: '整理需跨部门协助的事项',
        description: '提前沟通，减少信息差和等待时间。',
        priority: 'MEDIUM',
        quadrant: 2,
        tags: ['沟通', '协助'],
        subtasks: ['汇总本部门无法独立解决的问题', '标注对接人和预计交付时间']
      }
    ]
  },
  {
    id: 'onboarding-guide',
    name: '新员工高效入职指南',
    description: '帮助新成员在第一周快速融入团队并进入工作状态。',
    tasks: [
      {
        title: '配置基础开发与办公环境',
        description: '领用设备、安装软件、申请系统权限。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['入职', '环境'],
        subtasks: ['申请内网VPN权限', '安装必备代码编辑器及插件', '配置企业邮箱及通讯软件']
      },
      {
        title: '熟悉团队规范与核心业务流程',
        description: '了解代码规范、提交流程和业务生命周期。',
        priority: 'HIGH',
        quadrant: 2,
        tags: ['学习', '规范'],
        subtasks: ['阅读《代码规范白皮书》', '熟悉Git分支管理与代码审查流程', '了解当前季度的OKRs']
      },
      {
        title: '与Mentor及关键同事破冰交流',
        description: '建立良好的工作人际网络。',
        priority: 'MEDIUM',
        quadrant: 2,
        tags: ['沟通', '团队'],
        subtasks: ['与直属主管进行1v1对齐期望', '请教Mentor开发环境中的坑', '参与团队破冰午餐']
      }
    ]
  },
  {
    id: 'travel-packing',
    name: '高频出差极简打包清单',
    description: '专为高频商务出差、拜访客户和设备调试设计的快速检查工具。',
    tasks: [
      {
        title: '电子设备与电源管理',
        description: '确保在途和现场的电力供应。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['装备', '出差'],
        subtasks: ['生产力笔记本电脑及充电器', '大容量充电宝及多合一数据线', '降噪耳机']
      },
      {
        title: '会议与业务必备材料',
        description: '客户宣讲、面谈签单与隐私资质签署。',
        priority: 'HIGH',
        quadrant: 1,
        tags: ['材料', '会议'],
        subtasks: ['双方公司盖章版纸质NDA原件', '纸质版名片夹', 'U盘备份的核心宣讲PPT']
      },
      {
        title: '个人洗漱与差旅证件',
        description: '生活保障，舒适出行。',
        priority: 'MEDIUM',
        quadrant: 2,
        tags: ['生活', '证件'],
        subtasks: ['身份证/护照等核心证件', '分装洗漱用品', '换洗衣物及防风外套']
      }
    ]
  }
];

