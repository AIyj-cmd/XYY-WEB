export const REVISION_CAPACITY_QUERY = `
select column_name, data_type
from user_tab_columns
where table_name = 'directus_revisions'
  and column_name in ('data', 'delta')
order by column_name`

const REQUIRED_COLUMNS = new Set(['data', 'delta'])

function normalizedColumn(row) {
  if (!row || typeof row !== 'object') return null
  const name = row.COLUMN_NAME
  const type = row.DATA_TYPE
  return typeof name === 'string' && typeof type === 'string'
    ? { name, type: type.toUpperCase() }
    : null
}

export function checkRevisionCapacity(rows) {
  if (!Array.isArray(rows) || rows.length !== REQUIRED_COLUMNS.size) {
    return { ok: false, code: 'CAPACITY_METADATA_INVALID' }
  }

  const columns = rows.map(normalizedColumn)
  if (columns.some((column) => !column)) return { ok: false, code: 'CAPACITY_METADATA_INVALID' }

  const names = columns.map((column) => column.name)
  if (
    new Set(names).size !== REQUIRED_COLUMNS.size ||
    names.some((name) => !REQUIRED_COLUMNS.has(name))
  ) {
    return { ok: false, code: 'CAPACITY_METADATA_INVALID' }
  }
  return columns.every((column) => column.type === 'CLOB')
    ? { ok: true, code: 'CAPACITY_PASS' }
    : { ok: false, code: 'CAPACITY_NOT_CLOB' }
}

export async function verifyRevisionCapacity(execute) {
  try {
    const result = await execute(REVISION_CAPACITY_QUERY, [])
    return checkRevisionCapacity(result?.rows)
  } catch {
    return { ok: false, code: 'QUERY_FAILED' }
  }
}
