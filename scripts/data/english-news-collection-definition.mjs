import {
  dateCreatedField,
  dateUpdatedField,
  statusChoices,
  statusField,
} from './cms-field-builders.mjs'

const categoryChoices = [
  ['Industry news', 'industry-news'],
  ['Logistics guides', 'logistics-guides'],
  ['Policy updates', 'policy-updates'],
  ['XINYIYUAN news', 'xinyiyuan-news'],
].map(([text, value]) => ({ text, value }))

const fileRelation = {
  collection: 'english_news',
  field: 'cover_image',
  related_collection: 'directus_files',
  schema: { on_delete: 'SET NULL' },
  meta: {
    many_collection: 'english_news',
    many_field: 'cover_image',
    one_collection: 'directus_files',
    one_field: null,
    one_deselect_action: 'nullify',
  },
}

export const ENGLISH_NEWS_COLLECTION_DEFINITION = {
  name: 'english_news',
  icon: 'translate',
  meta: {
    singleton: false,
    group: 'website_content',
    note: '独立维护英文文章，不依赖中文文章字段。',
  },
  fields: [
    {
      ...statusField(statusChoices({ text: '已归档', value: 'archived' })),
      schema: { default_value: 'draft' },
    },
    { field: 'title', type: 'string', meta: { required: true } },
    {
      field: 'slug',
      type: 'string',
      meta: {
        required: true,
        width: 'half',
        interface: 'input',
        options: { trim: true, slug: true },
        note: '英文文章 URL 标识，发布后慎改。',
        validation: { slug: { _regex: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } },
      },
      schema: { is_nullable: false, is_unique: true },
    },
    {
      field: 'category',
      type: 'string',
      meta: {
        required: true,
        width: 'half',
        interface: 'select-dropdown',
        options: { choices: categoryChoices },
      },
      schema: { is_nullable: false },
    },
    {
      field: 'summary',
      type: 'text',
      meta: { required: true, interface: 'input-multiline' },
      schema: { is_nullable: false },
    },
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
      meta: {
        interface: 'datetime',
        display: 'datetime',
        width: 'half',
        note: '发布时必须填写；未来时间将在到点后公开。',
        conditions: [
          { name: '发布时必填', rule: { status: { _eq: 'published' } }, required: true },
        ],
      },
    },
    {
      field: 'legacy_news_id',
      type: 'integer',
      meta: { hidden: true, readonly: true, note: '旧 news 英文字段迁移锚点，请勿编辑。' },
      schema: { is_nullable: true, is_unique: true },
    },
    dateCreatedField(),
    dateUpdatedField(),
  ],
  relations: [fileRelation],
}
