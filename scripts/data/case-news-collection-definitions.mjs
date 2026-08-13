import { dateCreatedField, dateUpdatedField, statusField } from './cms-field-builders.mjs'

const fileRelation = (collection, field) => ({
  collection,
  field,
  related_collection: 'directus_files',
  schema: { on_delete: 'SET NULL' },
  meta: {
    many_collection: collection,
    many_field: field,
    one_collection: 'directus_files',
    one_field: null,
    one_deselect_action: 'nullify',
  },
})

export const CASE_NEWS_COLLECTION_DEFINITIONS = [
  {
    name: 'cases',
    icon: 'business_center',
    meta: { sort_field: 'sort', group: 'brand_content' },
    fields: [
      statusField(),
      { field: 'sort', type: 'integer', meta: { width: 'half' } },
      {
        field: 'slug',
        type: 'string',
        meta: { width: 'half', note: '案例详情 URL 标识，发布后慎改' },
        schema: { is_unique: true },
      },
      { field: 'category', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'label', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'name', type: 'string', meta: { width: 'half' } },
      { field: 'full_name', type: 'string', meta: { width: 'half' } },
      { field: 'accent', type: 'string', meta: { interface: 'select-color', width: 'half' } },
      {
        field: 'details',
        type: 'text',
        meta: { interface: 'input-multiline', note: '用于案例列表卡片的简短介绍。' },
      },
      {
        field: 'case_description',
        type: 'text',
        meta: { interface: 'input-multiline', note: '用于案例详情页的完整品牌与合作介绍。' },
      },
      {
        field: 'stats',
        type: 'json',
        meta: {
          interface: 'list',
          note: '在同一品牌下新增、删除或拖动排序业务指标。',
          options: {
            template: '{{label}}：{{value}}',
            fields: [
              {
                field: 'label',
                name: '指标名称',
                type: 'string',
                meta: { interface: 'input', width: 'half', required: true },
              },
              {
                field: 'value',
                name: '指标数值',
                type: 'string',
                meta: { interface: 'input', width: 'half', required: true },
              },
              {
                field: 'unit',
                name: '单位',
                type: 'string',
                meta: { interface: 'input', width: 'half' },
              },
            ],
          },
        },
      },
      {
        field: 'metrics',
        type: 'text',
        meta: { hidden: true, interface: 'input-multiline', note: '旧版指标摘要，仅兼容回退。' },
      },
      {
        field: 'tags',
        type: 'json',
        meta: { interface: 'list', options: { template: '{{item}}' } },
      },
      {
        field: 'img',
        type: 'string',
        meta: { hidden: true, note: '旧版静态封面路径，仅兼容回退。' },
      },
      {
        field: 'image_file',
        type: 'uuid',
        meta: { interface: 'file-image', display: 'image', note: '上传或从文件库选择案例封面。' },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
      dateCreatedField(),
      dateUpdatedField(),
    ],
    relations: [fileRelation('cases', 'image_file')],
  },
  {
    name: 'news',
    icon: 'article',
    meta: { group: 'website_content' },
    fields: [
      statusField(),
      { field: 'title', type: 'string', meta: { required: true } },
      {
        field: 'slug',
        type: 'string',
        meta: { required: true, width: 'half', note: '英文或拼音 URL 标识，发布后慎改' },
        schema: { is_unique: true },
      },
      {
        field: 'category',
        type: 'string',
        meta: {
          required: true,
          width: 'half',
          interface: 'select-dropdown',
          options: {
            choices: ['行业资讯', '物流干货', '政策解读', '新亦源动态'].map((value) => ({
              text: value,
              value,
            })),
          },
        },
      },
      { field: 'summary', type: 'text', meta: { interface: 'input-multiline', required: true } },
      { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html' } },
      {
        field: 'cover_image',
        type: 'uuid',
        meta: { interface: 'file-image', display: 'image', special: ['file'] },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
      {
        field: 'published_at',
        type: 'timestamp',
        meta: { interface: 'datetime', display: 'datetime', width: 'half' },
      },
      dateCreatedField(),
      dateUpdatedField(),
    ],
    relations: [fileRelation('news', 'cover_image')],
  },
]
