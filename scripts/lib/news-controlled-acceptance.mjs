export function createNewsAcceptanceSlug(runId, index = 1) {
  if (!/^[a-z0-9-]+$/i.test(runId)) throw new Error('invalid_news_acceptance_run_id')
  return `xyy-20261004-03-${runId}-${index}`.toLowerCase()
}

export async function runNewsControlledAcceptance({ admin, create, runId, now = new Date() }) {
  const slug = createNewsAcceptanceSlug(runId)
  const published_at = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
  const marker = `xyy-20261004-03-run=${runId}`
  const expected = {
    slug,
    title: marker,
    category: '行业资讯',
    summary: marker,
    content: `<!-- ${marker} -->`,
    cover_image: null,
    published_at,
  }
  if ((await admin.readByExactSlugs([slug])).length) {
    throw new Error(`news_acceptance_slug_already_exists slug=${slug}`)
  }
  let primaryError
  try {
    const response = await create({ ...expected })
    const article = response?.body?.data?.articles?.[0]
    if (
      response?.status !== 201 ||
      response?.body?.success !== true ||
      !Number.isSafeInteger(article?.id) ||
      article?.slug !== slug
    ) {
      primaryError = new Error(
        `news_acceptance_create_failed status=${response?.status ?? 'missing'}`
      )
    }
  } catch (error) {
    primaryError = error
  }
  let cleanupError
  try {
    const records = await admin.readByExactSlugs([slug])
    const ids = records.map((record) => {
      if (
        record.slug !== slug ||
        record.status !== 'published' ||
        record.title !== marker ||
        record.summary !== expected.summary ||
        record.content !== expected.content ||
        record.published_at !== published_at ||
        !Number.isSafeInteger(record.id) ||
        record.id <= 0
      ) {
        throw new Error(`news_acceptance_cleanup_mismatch slug=${slug}`)
      }
      return record.id
    })
    if (!primaryError && ids.length !== 1) {
      throw new Error(`news_acceptance_created_record_missing slug=${slug}`)
    }
    for (const id of ids) await admin.deleteByExactId(id)
    if ((await admin.readByExactSlugs([slug])).length) {
      throw new Error(`news_acceptance_cleanup_remaining slug=${slug}`)
    }
  } catch (error) {
    cleanupError = error
  }
  if (primaryError && cleanupError) {
    throw new Error(
      `news_acceptance_failed primary=${primaryError.message} cleanup=${cleanupError.message}`
    )
  }
  if (cleanupError) throw cleanupError
  if (primaryError) throw primaryError
  return { slug, published_at, marker, article: expected }
}
