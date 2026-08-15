export const statusChoices = (...extra) => [
  { text: '已发布', value: 'published' },
  { text: '草稿', value: 'draft' },
  ...extra,
]

export const statusField = (choices = statusChoices()) => ({
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    required: true,
    width: 'half',
    options: { choices },
  },
})

export const dateCreatedField = () => ({
  field: 'date_created',
  type: 'timestamp',
  meta: {
    interface: 'datetime',
    display: 'datetime',
    readonly: true,
    hidden: true,
    special: ['date-created'],
  },
})

export const dateUpdatedField = () => ({
  field: 'date_updated',
  type: 'timestamp',
  meta: {
    interface: 'datetime',
    display: 'datetime',
    readonly: true,
    hidden: true,
    special: ['date-updated'],
  },
})

export const stableKeyField = (field = 'content_key') => ({
  field,
  type: 'string',
  meta: {
    required: true,
    readonly: true,
    width: 'half',
    note: '稳定内容标识；初始化后不可随标题、排序或年份修改。',
  },
  schema: { is_nullable: false, is_unique: true },
})

export const leadStatusField = () => ({
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    required: true,
    width: 'half',
    options: {
      choices: [
        { text: '新线索', value: 'new' },
        { text: '跟进中', value: 'contacted' },
        { text: '已完成', value: 'closed' },
        { text: '无效', value: 'invalid' },
      ],
    },
  },
  schema: { default_value: 'new' },
})
