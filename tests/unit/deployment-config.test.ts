import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import packageJson from '../../package.json'

const root = resolve(import.meta.dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('production deployment contracts', () => {
  it('runs release verification in GitHub CI from a clean checkout', () => {
    const workflow = read('.github/workflows/ci.yml')

    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40}/)
    expect(workflow).toMatch(/actions\/setup-node@[0-9a-f]{40}/)
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm run format:check')
    expect(workflow).toContain('npm audit --omit=dev')
    expect(workflow).toContain('npm run verify:release')
    expect(workflow).toContain('playwright install --with-deps chromium')
  })

  it('ships upload backup and restore verification jobs independently of the database', () => {
    const backup = read('deploy/uploads/backup-directus-uploads.sh')
    const restore = read('deploy/uploads/restore-test-directus-uploads.sh')
    const service = read('deploy/uploads/xyy-directus-uploads-backup.service')
    const timer = read('deploy/uploads/xyy-directus-uploads-backup.timer')

    expect(backup).toContain('sha256sum')
    expect(backup).toContain('flock -n')
    expect(backup).toContain('UPLOADS_DIR')
    expect(restore).toContain('sha256sum --check')
    expect(restore).toContain('cd "$(dirname "${BACKUP_FILE}")"')
    expect(restore).toContain('tar --list --verbose')
    expect(restore).toContain('unsafe archive member type')
    expect(restore).toContain('mktemp -d')
    expect(service).toContain('EnvironmentFile=/etc/xyy/uploads-backup.env')
    expect(timer).toContain('OnCalendar=')
  })

  it('installs PostgreSQL backup jobs only after an explicit manual backup and restore test', () => {
    const install = read('deploy/postgresql/install-backup-job.sh')
    const backup = read('deploy/postgresql/backup-directus.sh')
    const restore = read('deploy/postgresql/restore-test-directus.sh')
    const service = read('deploy/postgresql/xyy-postgresql-backup.service')
    const configExample = read('deploy/postgresql/postgresql-backup.env.example')

    expect(install).toContain('xyy-backup-directus-postgresql')
    expect(install).toContain('xyy-restore-test-directus-postgresql')
    expect(install).toContain('CONFIRM_BACKUP_JOB_ACTIVATION')
    expect(install).toContain('systemctl enable --now xyy-postgresql-backup.timer')
    expect(install).toContain('install -m 600')
    expect(service).toContain('EnvironmentFile=/etc/xyy/postgresql-backup.env')
    expect(service).not.toContain('/var/www/xyy-cms/.env')
    expect(backup).not.toContain('source "${CONFIG_FILE}"')
    expect(backup).not.toContain('/var/www/xyy-cms/.env')
    expect(configExample).toContain('DB_PASSWORD=replace-with-a-strong-password')
    expect(restore).toContain('sha256sum --check')
    expect(restore).not.toContain('head -n 1')
    expect(restore).toContain('[[ ${temp_dir} == /tmp/xyy-pg-restore.*')
  })

  it('protects Oracle Data Pump backups with locking, checksums and a gated timer', () => {
    const backup = read('deploy/oracle19c/backup-oracle.sh')
    const install = read('deploy/oracle19c/install-backup-job.sh')
    const service = read('deploy/oracle19c/xyy-oracle-backup.service')
    const timer = read('deploy/oracle19c/xyy-oracle-backup.timer')

    expect(backup).toContain('flock -n')
    expect(backup).toContain('sha256sum')
    expect(backup).toContain('RETENTION_DAYS')
    expect(backup).not.toContain('source "${CONFIG_FILE}"')
    expect(install).toContain('CONFIRM_BACKUP_JOB_ACTIVATION')
    expect(install).toContain('systemctl enable --now xyy-oracle-backup.timer')
    expect(service).toContain('EnvironmentFile=/etc/xyy/oracle-database.env')
    expect(service).toContain('ExecStart=/usr/local/sbin/xyy-backup-directus-oracle')
    expect(timer).toContain('OnCalendar=')
  })

  it('serves every static path from the atomic current release', () => {
    const nginx = read('deploy/nginx-56xyy.conf')

    expect(nginx).not.toContain('root /var/www/xyy-web/dist/client;')
    expect(nginx.match(/root \/var\/www\/xyy-web\/current\/dist\/client;/g)).toHaveLength(4)
  })

  it('binds the web process to the operations port and reuses unchanged release assets', () => {
    const ecosystem = read('ecosystem.config.cjs')
    const nginx = read('deploy/nginx-56xyy.conf')
    const deploy = read('scripts/deploy.sh')

    expect(ecosystem).toContain("HOST: '0.0.0.0'")
    expect(ecosystem).toContain("PORT: '50031'")
    expect(nginx).toContain('server 127.0.0.1:50031;')
    expect(deploy).toContain("cp -al '$CURRENT_LINK/dist/.' '$RELEASE_DIR/dist/'")
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
    expect(deploy).toContain('if [[ -L \\"\\$current_link\\" ]]')
    expect(deploy).not.toContain('readlink -f \\"\\$current_link\\" 2>/dev/null || true')
    expect(deploy.match(/pm2 delete xyy-web/g)).toHaveLength(3)
    expect(deploy).toContain('grep -q \'\\"contactStorage\\":\\"ok\\"\'')
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
    const oracleRuntime = [
      read('deploy/oracle19c/prepare-directus-oracle.sh'),
      read('deploy/oracle19c/migrate-and-cutover.sh'),
      read('deploy/oracle19c/rollback-to-postgresql.sh'),
    ].join('\n')
    const cutover = read('deploy/oracle19c/migrate-and-cutover.sh')

    expect(cutover).toContain('rollback_to_postgresql()')
    expect(cutover).toContain('PORT=${STAGING_PORT}')
    expect(cutover.match(/rollback_to_postgresql/g)?.length).toBeGreaterThanOrEqual(3)
    expect(cutover).toContain('PostgreSQL Directus rollback failed health check')
    expect(cutover).toContain('pm2 stop "${WEB_PROCESS_NAME}"')
    expect(cutover).toContain('resume_web')
    expect(cutover).toContain('website failed health check after Oracle cutover')
    expect(oracleRuntime).not.toContain('/server/health')
    expect(oracleRuntime.match(/\/server\/ping/g)?.length).toBeGreaterThanOrEqual(4)
  })

  it('fails Oracle preparation when the installed Directus has no Oracle driver', () => {
    const prepare = `${read('deploy/oracle19c/prepare-directus-oracle.sh')}\n${read('deploy/oracle19c/lib/prepare-runtime.sh')}`

    expect(prepare).toContain('optionalDependencies.oracledb')
    expect(prepare).toContain('does not declare an Oracle driver')
    expect(prepare).toContain('if(!o.thin) process.exit(1)')
  })

  it('initializes an existing Oracle 19c without installing database software', () => {
    const init = read('deploy/oracle19c/init-existing-oracle19c.sh')

    expect(init).toContain("regexp_like(v_version, '^19\\\\.')")
    expect(init).toContain("v_charset <> 'AL32UTF8'")
    expect(init).toContain('create tablespace ${TABLESPACE_NAME}')
    expect(init).toContain('create user ${DIRECTUS_DB_USER}')
    expect(init).toContain('grant create session, alter session, create table')
    expect(init).not.toContain('dnf install')
    expect(init).not.toContain('localinstall')
    expect(init).not.toContain('oracledb_ORCLCDB-19c configure')
  })

  it('keeps Web and Directus backend deployment entry points separate', () => {
    const web = read('deploy/production/web/deploy-web.sh')
    const backend = read('deploy/production/backend/deploy-backend.sh')

    expect(web).toContain('exec bash scripts/deploy.sh')
    expect(web).toContain('SITE_URL="${SITE_URL:-https://56xyy.com}"')
    expect(backend).toContain('prepare-directus-oracle.sh')
    expect(backend).toContain('migrate-and-cutover.sh')
    expect(backend).toContain('rollback-to-postgresql.sh')
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
