const statusChoices = (...extra) => [
  { text: '已发布', value: 'published' },
  { text: '草稿', value: 'draft' },
  ...extra,
]

const statusField = (choices = statusChoices()) => ({
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

export const CMS_COLLECTION_DEFINITIONS = [
  {
    name: 'homepage_stats',
    icon: 'bar_chart',
    fields: [
      statusField(),
      { field: 'sort', type: 'integer', meta: { width: 'half' } },
      { field: 'value', type: 'string', meta: { required: true } },
      { field: 'label', type: 'string', meta: { required: true } },
      { field: 'unit', type: 'string' },
      { field: 'detail', type: 'string' },
    ],
  },
  {
    name: 'services',
    icon: 'room_service',
    fields: [
      statusField(),
      { field: 'sort', type: 'integer', meta: { width: 'half' } },
      { field: 'slug', type: 'string', meta: { required: true } },
      { field: 'icon', type: 'string' },
      { field: 'name', type: 'string', meta: { required: true } },
      { field: 'subtitle', type: 'string' },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
      {
        field: 'features',
        type: 'json',
        meta: { interface: 'list', options: { template: '{{item}}' } },
      },
    ],
  },
  {
    name: 'warehouses',
    icon: 'warehouse',
    fields: [
      statusField(statusChoices({ text: '归档', value: 'archived' })),
      { field: 'sort', type: 'integer', meta: { width: 'half' } },
      { field: 'name', type: 'string', meta: { required: true } },
      { field: 'city', type: 'string' },
      { field: 'since', type: 'string' },
      { field: 'address', type: 'string' },
      { field: 'park', type: 'string', meta: { note: '园区总面积（㎡）' } },
      { field: 'rent', type: 'string', meta: { note: '可租面积（㎡）' } },
      { field: 'height', type: 'string', meta: { note: '层高' } },
      {
        field: 'highlight',
        type: 'text',
        meta: { interface: 'input-multiline', note: '核心优势描述' },
      },
    ],
  },
]
