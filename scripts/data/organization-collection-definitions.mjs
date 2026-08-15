import { dateUpdatedField, stableKeyField, statusField } from './cms-field-builders.mjs'

export const ORGANIZATION_COLLECTION_DEFINITIONS = [
  {
    name: 'about_content',
    icon: 'domain',
    meta: { singleton: true, group: 'brand_content' },
    fields: [
      statusField(),
      {
        field: 'key',
        type: 'string',
        meta: { required: true, readonly: true },
        schema: { is_unique: true },
      },
      { field: 'overview', type: 'text', meta: { required: true, interface: 'input-multiline' } },
      {
        field: 'hero_description',
        type: 'text',
        meta: { required: true, interface: 'input-multiline' },
      },
      dateUpdatedField(),
    ],
  },
  {
    name: 'about_history',
    icon: 'timeline',
    meta: { sort_field: 'sort', group: 'brand_content' },
    fields: [
      statusField(),
      stableKeyField(),
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      { field: 'year', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'subtitle', type: 'string', meta: { required: true } },
      { field: 'text', type: 'text', meta: { required: true, interface: 'input-multiline' } },
      {
        field: 'img',
        type: 'string',
        meta: { hidden: true, note: '旧版静态图片路径，仅兼容回退。' },
      },
      {
        field: 'image_file',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          display: 'image',
          note: '上传或从文件库选择历程图片。',
        },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
    ],
    relations: [
      {
        collection: 'about_history',
        field: 'image_file',
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: {
          many_collection: 'about_history',
          many_field: 'image_file',
          one_collection: 'directus_files',
          one_field: null,
          one_deselect_action: 'nullify',
        },
      },
    ],
  },
  {
    name: 'about_honors',
    icon: 'workspace_premium',
    meta: { sort_field: 'sort', group: 'brand_content' },
    fields: [
      statusField(),
      stableKeyField(),
      { field: 'sort', type: 'integer', meta: { required: true, width: 'half' } },
      { field: 'title', type: 'string', meta: { required: true } },
      {
        field: 'image',
        type: 'string',
        meta: { hidden: true, required: true, note: '旧版静态图片路径，仅兼容回退。' },
      },
      {
        field: 'image_file',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          display: 'image',
          note: '上传或从文件库选择荣誉证书图片。',
        },
        schema: { foreign_key_table: 'directus_files', foreign_key_column: 'id' },
      },
    ],
    relations: [
      {
        collection: 'about_honors',
        field: 'image_file',
        related_collection: 'directus_files',
        schema: { on_delete: 'SET NULL' },
        meta: {
          many_collection: 'about_honors',
          many_field: 'image_file',
          one_collection: 'directus_files',
          one_field: null,
          one_deselect_action: 'nullify',
        },
      },
    ],
  },
  {
    name: 'site_settings',
    icon: 'settings',
    meta: { singleton: true, group: 'operations_content' },
    fields: [
      statusField(),
      {
        field: 'key',
        type: 'string',
        meta: { required: true, readonly: true },
        schema: { is_unique: true },
      },
      { field: 'phone', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'icp', type: 'string', meta: { required: true, width: 'half' } },
      { field: 'headquarters_label', type: 'string', meta: { required: true } },
      { field: 'headquarters_address', type: 'string', meta: { required: true } },
      {
        field: 'footer_description',
        type: 'text',
        meta: { required: true, interface: 'input-multiline' },
      },
      dateUpdatedField(),
    ],
  },
]
