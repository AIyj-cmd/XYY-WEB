import {
  dateCreatedField,
  dateUpdatedField,
  stableKeyField,
  statusField,
} from './cms-field-builders.mjs'

export const SERVICE_CONTENT_COLLECTION_DEFINITIONS = [
  {
    name: 'service_pages',
    icon: 'web',
    meta: { group: 'website_content' },
    fields: [
      statusField(),
      {
        field: 'slug',
        type: 'string',
        meta: { required: true },
        schema: { is_unique: true },
      },
      { field: 'title', type: 'string', meta: { required: true } },
      {
        field: 'description',
        type: 'text',
        meta: { required: true, interface: 'input-multiline' },
      },
      { field: 'breadcrumb_label', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'features_label', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'eyebrow', type: 'string', meta: { required: true } },
      { field: 'h1', type: 'string', meta: { required: true } },
      { field: 'h1sub', type: 'string', meta: { required: true } },
      { field: 'hero_desc', type: 'text', meta: { required: true, interface: 'input-multiline' } },
      { field: 'img_src', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'img_alt', type: 'string', meta: { required: true, width: 'half' } },
      {
        field: 'content_desc',
        type: 'text',
        meta: { required: true, interface: 'input-multiline' },
      },
      {
        field: 'stats',
        type: 'json',
        meta: {
          interface: 'list',
          note: '在当前专题页内统一维护4项核心数据，可拖动调整顺序。',
          options: {
            template: '{{stat}}｜{{label}}',
            fields: [
              {
                field: 'stat',
                name: '指标数值',
                type: 'string',
                meta: { interface: 'input', width: 'half', required: true },
              },
              {
                field: 'label',
                name: '指标名称',
                type: 'string',
                meta: { interface: 'input', width: 'half', required: true },
              },
              {
                field: 'sub',
                name: '指标说明',
                type: 'string',
                meta: { interface: 'input', required: true },
              },
            ],
          },
        },
      },
      {
        field: 'features',
        type: 'json',
        meta: {
          interface: 'list',
          note: '在当前专题页内统一维护服务能力，可拖动调整顺序。',
          options: {
            template: '{{title}}',
            fields: [
              {
                field: 'title',
                name: '能力名称',
                type: 'string',
                meta: { interface: 'input', required: true },
              },
              {
                field: 'desc',
                name: '能力说明',
                type: 'text',
                meta: { interface: 'input-multiline', required: true },
              },
            ],
          },
        },
      },
      {
        field: 'hero_image',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          display: 'image',
          width: 'half',
          note: '上传后优先使用；未上传时继续使用旧版静态图片路径。',
        },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
      dateCreatedField(),
      dateUpdatedField(),
    ],
    relations: [
      {
        collection: 'service_pages',
        field: 'hero_image',
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: {
          many_collection: 'service_pages',
          many_field: 'hero_image',
          one_collection: 'directus_files',
          one_field: null,
          one_deselect_action: 'nullify',
        },
      },
    ],
  },
  {
    name: 'service_stats',
    icon: 'query_stats',
    meta: {
      hidden: true,
      group: 'website_content',
      sort_field: 'sort',
      note: '旧版专题指标备份；请在“服务专题页”中统一维护。',
    },
    fields: [
      statusField(),
      stableKeyField('metric_key'),
      { field: 'service_slug', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      { field: 'stat', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'label', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'sub', type: 'string', meta: { required: true } },
    ],
  },
  {
    name: 'service_features',
    icon: 'checklist',
    meta: {
      hidden: true,
      group: 'website_content',
      sort_field: 'sort',
      note: '旧版服务能力备份；请在“服务专题页”中统一维护。',
    },
    fields: [
      statusField(),
      stableKeyField(),
      { field: 'service_slug', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      { field: 'title', type: 'string', meta: { required: true } },
      { field: 'desc', type: 'text', meta: { required: true, interface: 'input-multiline' } },
    ],
  },
]
