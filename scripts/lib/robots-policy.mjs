function parseRobotsGroups(content) {
  const groups = []
  let agents = []
  let directives = []

  const flush = () => {
    if (agents.length > 0) groups.push({ agents, directives })
    agents = []
    directives = []
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue

    const separator = line.indexOf(':')
    if (separator === -1) continue
    const field = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()

    if (field === 'user-agent') {
      if (directives.length > 0) flush()
      agents.push(value.toLowerCase())
      continue
    }
    if (agents.length > 0) directives.push({ field, value })
  }
  flush()
  return groups
}

export function isRootDisallowedForUserAgent(content, userAgent = '*') {
  const normalizedAgent = userAgent.toLowerCase()
  return parseRobotsGroups(content)
    .filter(({ agents }) => agents.includes(normalizedAgent))
    .some(({ directives }) =>
      directives.some(({ field, value }) => field === 'disallow' && value === '/')
    )
}
