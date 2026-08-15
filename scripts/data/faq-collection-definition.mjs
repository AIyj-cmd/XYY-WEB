import {
  dateCreatedField,
  dateUpdatedField,
  stableKeyField,
  statusField,
} from './cms-field-builders.mjs'
import { FAQ_PAGE_OPTIONS } from './faq-page-options.mjs'

export const FAQ_COLLECTION_DEFINITION = {
  name: 'faqs',
  icon: 'quiz',
  meta: {
    hidden: true,
    group: 'website_content',
    sort_field: 'sort',
    note: '常见问题明细；请从“FAQ页面”进入并集中维护。',
  },
  fields: [
    statusField(),
    stableKeyField(),
    {
      field: 'page_key',
      type: 'string',
      meta: {
        required: true,
        readonly: true,
        width: 'half',
        interface: 'select-dropdown',
        options: { choices: FAQ_PAGE_OPTIONS, allowOther: true },
        note: '旧版页面标识，仅用于迁移核对；页面归属以 FAQ 页面关系为准。',
      },
    },
    {
      field: 'faq_page',
      type: 'integer',
      meta: {
        width: 'half',
        interface: 'select-dropdown-m2o',
        display: 'related-values',
        special: ['m2o'],
        options: { template: '{{name}}' },
      },
      schema: { foreign_key_table: 'faq_pages', foreign_key_column: 'id' },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: { required: true, width: 'half', note: '同一页面内的显示顺序' },
    },
    { field: 'question', type: 'string', meta: { required: true } },
    {
      field: 'answer',
      type: 'text',
      meta: {
        required: true,
        interface: 'input-multiline',
        note: '纯文本答案；可使用 {{partnerBrands}} 等已审核事实占位符。',
      },
    },
    dateCreatedField(),
    dateUpdatedField(),
  ],
  relations: [
    {
      collection: 'faqs',
      field: 'faq_page',
      related_collection: 'faq_pages',
      schema: { on_delete: 'SET NULL' },
      meta: {
        many_collection: 'faqs',
        many_field: 'faq_page',
        one_collection: 'faq_pages',
        one_field: 'items',
        one_deselect_action: 'nullify',
      },
    },
  ],
}
