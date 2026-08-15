import { dateUpdatedField, statusField } from './cms-field-builders.mjs'
import { FAQ_PAGE_OPTIONS } from './faq-page-options.mjs'

export const CMS_NAVIGATION_GROUP_DEFINITIONS = [
  { name: 'website_content', icon: 'web', schema: null },
  { name: 'brand_content', icon: 'apartment', schema: null },
  { name: 'operations_content', icon: 'settings_suggest', schema: null },
]

export const FAQ_PAGE_SEEDS = FAQ_PAGE_OPTIONS.map(({ text, value }, index) => ({
  status: 'published',
  sort: index + 1,
  key: value,
  name: text,
}))

const structuredList = (template, fields) => ({
  interface: 'list',
  options: { template, fields },
})

export const CONTENT_MANAGEMENT_COLLECTION_DEFINITIONS = [
  {
    name: 'homepage_content',
    icon: 'home',
    meta: { singleton: true, group: 'website_content' },
    fields: [
      statusField(),
      {
        field: 'key',
        type: 'string',
        meta: { required: true, readonly: true },
        schema: { is_unique: true },
      },
      {
        field: 'stats',
        type: 'json',
        meta: {
          ...structuredList('{{value}}｜{{label}}', [
            {
              field: 'value',
              name: '数值',
              type: 'string',
              meta: { interface: 'input', width: 'half', required: true },
            },
            {
              field: 'unit',
              name: '单位',
              type: 'string',
              meta: { interface: 'input', width: 'half' },
            },
            {
              field: 'label',
              name: '数据名称',
              type: 'string',
              meta: { interface: 'input', width: 'half', required: true },
            },
            {
              field: 'detail',
              name: '补充说明',
              type: 'string',
              meta: { interface: 'input', width: 'half' },
            },
          ]),
          note: '首页8项业务数据集中维护，公开数字以审核事实注册表为准。',
        },
      },
      dateUpdatedField(),
    ],
  },
  {
    name: 'faq_pages',
    icon: 'help_center',
    meta: {
      sort_field: 'sort',
      group: 'website_content',
      note: '进入对应页面后，可集中新增、编辑和拖动排序该页面的常见问题。',
    },
    fields: [
      statusField(),
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      {
        field: 'key',
        type: 'string',
        meta: { required: true, width: 'half', readonly: true },
        schema: { is_unique: true },
      },
      { field: 'name', type: 'string', meta: { required: true } },
    ],
    aliases: [
      {
        field: 'items',
        type: 'alias',
        meta: {
          special: ['o2m'],
          interface: 'list-o2m',
          display: 'related-values',
          options: {
            template: '{{sort}}. {{question}}',
            enableCreate: true,
            enableSelect: true,
          },
        },
      },
    ],
  },
]
