# Directus revision capacity repair: preflight only

Task: `XYY-20260904-01` (HIGH risk repair phase)

This package prepares a production metadata preflight for the known failure at
`"XYY_DIRECTUS"."directus_revisions"."data"`: the reported value was 14,939
against a 4,000 maximum. It is not a completed repair. It contains no database
connection details, data export, backup command, DDL, DML, automatic apply
path, or production cutover.

This package has two read-only capacity tools. `inspect-revision-capacity.sql`
is SQL*Plus/SQLcl-compatible and inventories the fixed target metadata.
`verify-revision-capacity.mjs` is a Directus runtime gate: it reads an existing
CMS directory's `.env` using `node:util` `parseEnv` (never `source`), requires
`DB_CLIENT=oracledb` plus the three required database settings, and uses that
directory's existing `oracledb` dependency. It has no default CMS directory and
does not connect for no arguments or `--help`; `--apply` and unknown flags fail.

For an approved operator-run capacity check, use a new dedicated session and
the existing CMS directory:

```text
node verify-revision-capacity.mjs --cms-dir /path/to/existing-directus
```

The CLI selects only `USER_TAB_COLUMNS` for the connection account's quoted
lowercase `directus_revisions.data` and `directus_revisions.delta`. It reports
`CAPACITY_PASS` only when exactly both metadata rows are `CLOB`; missing,
duplicate, malformed, finite `VARCHAR2` (including 32767), another type, query
failure, configuration failure, or connection failure is fail-closed. It does
not query JSON content or row lengths, and never treats CLOB `DATA_LENGTH` as a
content limit. Output uses fixed diagnostic categories and omits connection
details and driver errors. A successfully opened connection is always closed.

Capacity pass is not a production repair, deployment readiness result, JSON
constraint check, or Directus behavior certification. It is only proof of the
two-column CLOB capacity precondition for that checked connection account.
The CLI reads the specified directory's `.env` only; it does not discover PM2
or container process-environment overrides. Operators must confirm that file
matches the actual runtime connection before using its result in the repair
contract, and must not treat a file-level pass as proof that an online instance
has been repaired.

Codex does not need an SSH account or a database password. Database operations
staff can run the SQL or standalone CLI through their existing controlled Oracle
client/runtime, then return only reviewed metadata output with revision content
and secrets removed. The actual metadata is the input for the later repair
contract.

The output is deliberately metadata only:

- connected identity, database/PDB identity, and ordinary-user-visible version;
- `data` and `delta` type, byte/character semantics, nullability, and default
  metadata (not the default expression);
- visible constraint and JSON-check state, all accessible indexes on the target
  table, triggers, foreign-key references, and accessible object dependencies.

It does not select revision JSON, article content, tokens, or row sizes; no
business-data scan is required for this preflight. `ALL_*` views show objects
accessible to the executing identity. Therefore an empty result means only “no
matching accessible metadata”, never “metadata does not exist”. A failed query
exits non-zero because the script uses `WHENEVER SQLERROR`; record that missing
visibility and obtain an appropriately authorized metadata export or owner-run
capture before treating the inventory as complete.

## Boundary and prior tooling

Use the standalone CLI for a capacity check; it does not require running the
full historical preparation or migration flow. The preparation script now calls
the CLI immediately after Directus bootstrap and, through `set -e`, refuses to
continue to schema snapshot/apply, uploads, or PM2 if the two columns are not
CLOB. This gate does not change bootstrap definitions, alter columns, or claim
that it expanded a database. Do not call `migrate-and-cutover.sh`, backup, or
rollback scripts as an incident repair procedure. In particular, the local
Directus helper's type-change-by-copy pattern adds a nullable temporary column,
copies data, drops the original column, then renames the temporary column. That
is evidence about local behavior only and is not approved as a production repair
method because it deletes the original column during the operation.

Likewise, the locally observed Directus 12.0.2 / `@directus/api` 36.0.2 / Knex
3.1.0 Oracle JSON mapping is input to the hypothesis, not proof of the formal
server's installed version or complete driver path. The formal `delta` type and
all formal metadata remain unverified until the preflight is captured.

## Required controlled sequence

The user has approved backup, isolated Oracle verification, and the target
repair. These are technical gates, not a request to reapprove that objective.
Routine choices, including a backup path within the approved target environment,
require no separate approval. Only actions that need new privileges or
materially extend the approved targets, hosts, or environments must be escalated
for scoped authorization.

1. Capture the formal Directus, `node-oracledb`, Knex, Oracle/RU, PDB, and
   `data`/`delta` metadata. The fixed-target preflight records the ordinary-user
   visible component version/status and PDB; attach an exact-RU capture if that
   view does not provide it. Preserve the output as a protected incident
   artifact; do not treat absent `ALL_*` rows as proof of absence.
2. Create an Oracle **isolated clone** with the formal Oracle version/RU,
   character set, Directus version, driver, and relevant metadata. No formal
   CMS/database write occurs in this step.
3. Take the approved formal backup and perform a real restore/recovery test in
   the isolated environment. Record restoration, revision-row accessibility,
   and JSON-check results before any formal schema change.
4. In the clone, evaluate a two-column, CLOB-copy migration candidate for both
   `data` and `delta`: preserve historical values, retain or recreate equivalent
   JSON validation, preserve the original columns until copied data and
   dependencies are verified, and only then decide the exact migration contract.
   This document intentionally supplies no DDL. Oracle 19c supports `CLOB` JSON
   protected by `IS JSON`, but actual Directus/driver behavior must be proven in
   the clone.
5. Independently test Directus create, update, revision-history read, and revert
   against the clone. Include valid Chinese JSON payloads exceeding both 14,939
   bytes and 32,767 bytes; assert stored JSON validity, exact history behavior,
   and expected application errors. The test must exercise both `data` and
   `delta` where Directus writes them.
6. Have the resulting repair contract, clone evidence, backup-restore evidence,
   and dependency impact independently reviewed.
7. During a short, explicitly planned write pause, perform the approved formal
   change using the reviewed contract, then restore write access.
8. Read back the formal metadata and representative revision behavior without
   exposing content, and independently verify create, update, history, and
   revert.

Do not assume a direct `VARCHAR2`-to-`CLOB` `ALTER ... MODIFY` will succeed for
this populated system table. Oracle DDL implicitly commits; it cannot be made
transactional with a client rollback. After production accepts longer revision
documents, rollback must not force the columns back to 4,000 or truncate new
history. Recovery instead requires the verified backup/restore and a
data-preserving, separately reviewed decision.

Oracle 19c documents `VARCHAR2`, `CLOB`, and `BLOB` textual JSON storage and
recommends an `IS JSON` constraint for JSON columns; it describes CLOB JSON as
an ordinary supported storage form. See [Oracle JSON storage
overview](https://docs.oracle.com/en/database/oracle/oracle-database/19/adjsn/overview-of-storage-and-management-of-JSON-data.html),
[Oracle JSON insert/update overview](https://docs.oracle.com/en/database/oracle/oracle-database/19/adjsn/overview-of-inserting-updating-loading-JSON-data.html),
and [Oracle `ALTER TABLE`
reference](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-TABLE.html).
