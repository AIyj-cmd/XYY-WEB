import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import packageJson from '../../package.json'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('production deployment contracts', () => {
  it('serves every static path from the atomic current release', () => {
    const nginx = read('deploy/nginx-56xyy.conf')

    expect(nginx).not.toContain('root /var/www/xyy-web/dist/client;')
    expect(nginx.match(/root \/var\/www\/xyy-web\/current\/dist\/client;/g)).toHaveLength(4)
  })

  it('applies a narrow request-size limit to the public contact endpoint', () => {
    const nginx = read('deploy/nginx-56xyy.conf')
    const contactLocation = nginx.match(/location = \/api\/contact \{[\s\S]*?\n {4}\}/)?.[0]

    expect(contactLocation).toContain('client_max_body_size 8k;')
    expect(contactLocation).toContain('proxy_pass http://xyy_web;')
  })

  it('deploys through an isolated release and switches the current symlink', () => {
    const deploy = read('scripts/deploy.sh')

    expect(deploy).toContain('RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"')
    expect(deploy).toContain('CURRENT_LINK="$REMOTE_DIR/current"')
    expect(deploy).toContain('server.mjs ecosystem.config.cjs server')
    expect(deploy).toMatch(/mv -Tf \\"\\\$current_link\.next\\" \\"\\\$current_link\\"/)
    expect(deploy).toContain('.previous_target')
  })

  it('rebuilds the caller target after formal tests and rolls back external failures', () => {
    const deploy = read('scripts/deploy.sh')

    expect(packageJson.scripts['verify:release']).toMatch(/test:formal-contract && npm run build$/)
    expect(deploy).toContain('if ! SITE_URL="$HEALTHCHECK_SITE_URL" node scripts/health-check.mjs')
    expect(deploy).toContain('external release checks failed; restoring previous release')
    expect(deploy).toContain('refusing unsafe rollback target')
    expect(deploy).toMatch(/releases_dir\\"\/\*\|\\"\\\$legacy_dir/)
    expect(deploy).toContain('rolled-back release failed health check')
  })

  it('rolls Oracle startup and health failures back to PostgreSQL', () => {
    const cutover = read('deploy/oracle19c/migrate-and-cutover.sh')

    expect(cutover).toContain('rollback_to_postgresql()')
    expect(cutover).toContain('PORT=${STAGING_PORT}')
    expect(cutover.match(/rollback_to_postgresql/g)?.length).toBeGreaterThanOrEqual(3)
    expect(cutover).toContain('PostgreSQL Directus rollback failed health check')
    expect(cutover).toContain('pm2 stop "${WEB_PROCESS_NAME}"')
    expect(cutover).toContain('resume_web')
    expect(cutover).toContain('website failed health check after Oracle cutover')
  })

  it('fails Oracle preparation when the installed Directus has no Oracle driver', () => {
    const prepare = `${read('deploy/oracle19c/prepare-directus-oracle.sh')}\n${read('deploy/oracle19c/lib/prepare-runtime.sh')}`

    expect(prepare).toContain('optionalDependencies.oracledb')
    expect(prepare).toContain('does not declare an Oracle driver')
    expect(prepare).toContain('if(!o.thin) process.exit(1)')
  })

  it('bootstraps PostgreSQL Directus for the formal origin without SQL interpolation', () => {
    const bootstrap = `${read('scripts/bootstrap-cms-server.sh')}\n${read('scripts/lib/bootstrap-cms-functions.sh')}`

    expect(bootstrap).toContain('PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://56xyy.com}"')
    expect(bootstrap).not.toContain('admin@wz.tomatopia.top')
    expect(bootstrap).not.toContain('PUBLIC_URL=https://wz.tomatopia.top/cms')
    expect(bootstrap).toContain("'CREATE ROLE %I WITH LOGIN PASSWORD %L'")
    expect(bootstrap).toContain("convert_from(decode('${db_password_b64}', 'base64'), 'UTF8')")
    expect(bootstrap).not.toContain('-v db_password=')
    expect(bootstrap).toContain('DB_PASSWORD=$(dotenv_quote "${DB_PASS}")')
    expect(bootstrap).toContain('CORS_ORIGIN=$(dotenv_quote "${CORS_ORIGIN}")')
  })
})
