export const ENGLISH_NEWS_FIELDS = [
  {
    field: 'title_en',
    type: 'string',
    meta: { group: 'english_content', width: 'half', note: '人工审核后的英文标题。' },
    schema: { is_nullable: true },
  },
  {
    field: 'summary_en',
    type: 'text',
    meta: {
      group: 'english_content',
      interface: 'input-multiline',
      note: '人工审核后的英文摘要。',
    },
    schema: { is_nullable: true },
  },
  {
    field: 'content_en',
    type: 'text',
    meta: {
      group: 'english_content',
      interface: 'input-rich-text-html',
      note: '人工审核后的英文正文；发布前需确认清洗后仍有可见内容。',
    },
    schema: { is_nullable: true },
  },
  {
    field: 'english_status',
    type: 'string',
    meta: {
      group: 'english_content',
      interface: 'select-dropdown',
      display: 'labels',
      width: 'half',
      options: {
        choices: [
          { text: '英文草稿', value: 'draft' },
          { text: '英文已发布', value: 'published' },
          { text: '英文已归档', value: 'archived' },
        ],
      },
      note: '英文版默认草稿；中文撤下时英文不会公开。',
    },
    schema: { is_nullable: true, default_value: 'draft' },
  },
  {
    field: 'english_published_at',
    type: 'timestamp',
    meta: {
      group: 'english_content',
      interface: 'datetime',
      display: 'datetime',
      width: 'half',
      note: '英文发布必须填写；未来时间将在到点后公开。',
      conditions: [
        {
          name: '英文发布时必填',
          rule: { english_status: { _eq: 'published' } },
          required: true,
        },
      ],
    },
    schema: { is_nullable: true },
  },
]

export const ENGLISH_NEWS_ALIASES = [
  {
    field: 'english_content',
    type: 'alias',
    meta: {
      special: ['group'],
      interface: 'group-detail',
      options: { start: 'closed' },
      note: '英文精选文章须人工审核；默认草稿，不会自动翻译或发布。',
    },
  },
]
