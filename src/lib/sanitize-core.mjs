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

const transformImage = sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true)

export function sanitizeRichText(input, options = {}) {
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
      img: (tagName, attribs) => {
        const transformed = transformImage(tagName, attribs)
        const source = transformed.attribs.src
        const srcset = transformed.attribs.srcset
        const image = {
          src: typeof source === 'string' ? source : undefined,
          srcset: typeof srcset === 'string' ? srcset : undefined,
        }

        if (image.src) options.onImageSource?.(image.src)
        options.onImage?.(image)
        const replacement =
          options.rewriteImage?.(image) ??
          (image.src ? options.rewriteImageSource?.(image.src) : undefined)
        if (typeof replacement === 'string') {
          transformed.attribs.src = replacement
          delete transformed.attribs.srcset
        }
        return transformed
      },
    },
  })
}
