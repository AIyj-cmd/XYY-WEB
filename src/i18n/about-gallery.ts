import type { GalleryImageScene } from '@/data/about/gallery-catalog'
import type { SiteLocale } from '@/i18n/routes'

type AboutGalleryCopy = {
  eyebrow: string
  heading: string
  introduction: string
  hint: string
  dialogTitle: string
  close: string
  images: Record<GalleryImageScene, string>
}

export const aboutGallery: Record<SiteLocale, AboutGalleryCopy> = {
  en: {
    eyebrow: 'INSIDE 56XYY',
    heading: 'XINYIYUAN, in every frame',
    introduction:
      'From the warehouse floor to everyday team moments, get to know XINYIYUAN through real images.',
    hint: 'Hover to preview · Click or tap to view',
    dialogTitle: 'Photo viewer',
    close: 'Close',
    images: {
      activity: 'Colleagues taking part in an indoor group activity',
      archive: 'Activity and everyday imagery from the original XINYIYUAN gallery',
      awards: 'Colleagues displaying or receiving items of recognition',
      building: 'Exterior of the XINYIYUAN office building',
      cake: 'Colleagues gathered around a table to share a cake',
      'event-speaker': 'Colleague speaking into a microphone at a team event',
      food: 'Food and drinks arranged on an event table',
      'garment-care': 'Colleague checking or pressing a garment at a workstation',
      garments: 'Garments hanging in warehouse storage',
      lounge: 'Colleagues sitting together and talking on a sofa',
      meal: 'Colleagues sharing food and conversation around a table',
      meeting: 'Colleagues talking around a meeting table',
      'outdoor-team': 'Team members posing for a group photo outdoors',
      outdoors: 'Colleagues participating in a group activity outdoors',
      sewing: 'Colleague working on a garment with a sewing machine',
      team: 'Team members posing for a group photo indoors',
      'team-work': 'Colleagues discussing work inside the warehouse',
      training: 'Colleagues taking part in an indoor training session',
      warehouse: 'Warehouse shelving and storage aisles',
      'warehouse-team': 'Team members gathered for a photo inside the warehouse',
      'warehouse-work': 'Colleagues sorting items at warehouse workstations',
      workshop: 'Workstations and stock containers inside the warehouse',
      'workshop-training': 'Colleagues exchanging ideas and taking notes at a training table',
    },
  },
  'zh-CN': {
    eyebrow: 'INSIDE 56XYY',
    heading: '每一帧，都是新亦源',
    introduction: '从仓储一线到团队日常，用真实影像，认识新亦源。',
    hint: '悬停放大 · 点击查看完整照片',
    dialogTitle: '照片预览',
    close: '关闭',
    images: {
      activity: '同事在室内参与互动活动',
      archive: '新亦源原图库中的活动与日常影像',
      awards: '同事展示或领取表彰物品',
      building: '新亦源办公楼外景',
      cake: '同事围坐桌旁切分蛋糕',
      'event-speaker': '同事手持麦克风在活动现场发言',
      food: '活动餐桌上摆放的食物与饮品',
      'garment-care': '同事在工作台上检查或熨烫服装',
      garments: '仓储中整齐悬挂的服装',
      lounge: '同事坐在沙发上休息与交流',
      meal: '同事围坐餐桌分享食物与交流',
      meeting: '同事围坐会议桌交流',
      'outdoor-team': '团队成员在户外合影',
      outdoors: '同事参与户外集体活动',
      sewing: '同事使用缝纫机处理服装细节',
      team: '团队成员在室内合影',
      'team-work': '同事在仓储现场沟通工作',
      training: '同事参与室内培训与交流',
      warehouse: '仓储货架与货品通道',
      'warehouse-team': '团队成员在仓储现场合影',
      'warehouse-work': '同事在仓内工作台上整理货品',
      workshop: '仓内作业台与货品周转箱',
      'workshop-training': '同事在培训桌旁交流与记录',
    },
  },
}
