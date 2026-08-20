import {
  dateCreatedField,
  dateUpdatedField,
  stableKeyField,
  statusField,
} from './cms-field-builders.mjs'

export const CASE_PUBLICATION_COLLECTION_DEFINITIONS = [
  {
    name: 'case_details',
    icon: 'assignment',
    meta: {
      hidden: true,
      group: 'brand_content',
      note: '旧版案例详情备份；请在“合作案例”中维护。',
    },
    fields: [
      statusField(),
      { field: 'label', type: 'string', meta: { required: true, width: 'half' } },
      {
        field: 'slug',
        type: 'string',
        meta: { required: true, width: 'half' },
        schema: { is_unique: true },
      },
      { field: 'name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'full_name', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'accent', type: 'string', meta: { interface: 'select-color', width: 'half' } },
      {
        field: 'description',
        type: 'text',
        meta: { required: true, interface: 'input-multiline' },
      },
      dateCreatedField(),
      dateUpdatedField(),
    ],
  },
  {
    name: 'case_stats',
    icon: 'analytics',
    meta: {
      hidden: true,
      group: 'brand_content',
      sort_field: 'sort',
      note: '旧版案例指标备份；请在“合作案例”中维护。',
    },
    fields: [
      statusField(),
      stableKeyField('metric_key'),
      { field: 'case_slug', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      { field: 'label', type: 'string', meta: { required: true } },
      { field: 'value', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'unit', type: 'string', meta: { width: 'half' } },
    ],
  },
  {
    name: 'publications',
    icon: 'menu_book',
    meta: { sort_field: 'sort', group: 'brand_content' },
    fields: [
      statusField(),
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      {
        field: 'issue',
        type: 'integer',
        meta: { required: true, width: 'half' },
        schema: { is_nullable: false, is_unique: true },
      },
      { field: 'title', type: 'string', meta: { required: true } },
      { field: 'season', type: 'string', meta: { width: 'half' } },
      { field: 'date', type: 'string', meta: { width: 'half' } },
      { field: 'summary', type: 'text', meta: { required: true, interface: 'input-multiline' } },
      {
        field: 'cover_file',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          display: 'image',
          width: 'half',
          note: '上传或从文件库选择期刊封面；建议 JPG/WebP 竖版图片。',
        },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
      {
        field: 'pdf_file',
        type: 'uuid',
        meta: {
          interface: 'file',
          display: 'file',
          width: 'half',
          note: '上传或从文件库选择 PDF 附件。',
        },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
      {
        field: 'cover',
        type: 'string',
        meta: { hidden: true, note: '旧版静态封面路径，仅用于兼容回退。' },
      },
      {
        field: 'pdf',
        type: 'string',
        meta: { hidden: true, note: '旧版静态 PDF 路径，仅用于兼容回退。' },
      },
      { field: 'is_latest', type: 'boolean', schema: { default_value: false } },
      dateCreatedField(),
      dateUpdatedField(),
    ],
    relations: [
      {
        collection: 'publications',
        field: 'cover_file',
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: {
          many_collection: 'publications',
          many_field: 'cover_file',
          one_collection: 'directus_files',
          one_field: null,
          one_deselect_action: 'nullify',
        },
      },
      {
        collection: 'publications',
        field: 'pdf_file',
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: {
          many_collection: 'publications',
          many_field: 'pdf_file',
          one_collection: 'directus_files',
          one_field: null,
          one_deselect_action: 'nullify',
        },
      },
    ],
  },
]
