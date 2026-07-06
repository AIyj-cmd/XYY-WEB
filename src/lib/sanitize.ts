import sanitizeHtml from 'sanitize-html'

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'figure',
  'figcaption',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'mark',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
])

export function sanitizeRichText(input: string) {
  return sanitizeHtml(input || '', {
    allowedTags,
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      '*': ['class', 'id', 'aria-label'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow' }, true),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true),
    },
  })
}
