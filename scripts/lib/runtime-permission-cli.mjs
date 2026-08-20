export async function runRuntimePermissionCli(verify) {
  try {
    const result = await verify({
      directusUrl: process.env.DIRECTUS_URL || '',
      contentToken: process.env.DIRECTUS_CONTENT_TOKEN || '',
      contactToken: process.env.DIRECTUS_CONTACT_TOKEN || '',
    })
    if (!result.ok) {
      console.error('Runtime Directus permissions are not least-privilege:')
      for (const failure of result.failures) console.error(`- ${failure}`)
      process.exitCode = 1
      return
    }
    console.log(
      `Verified separate least-privilege Directus tokens (${result.contentCollections.length} runtime content collections + ${result.assetCollections.length} asset collection + contact create-only; fields=${result.fieldRestrictionMode}).`
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Runtime permission verification failed')
    process.exitCode = 1
  }
}
