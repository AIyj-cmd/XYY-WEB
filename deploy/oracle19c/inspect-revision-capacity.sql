-- XYY-20260904-01: read-only production preflight for the known revision columns.
--
-- Run from SQL*Plus or SQLcl in a new, dedicated session using an approved,
-- non-privileged application connection. This script does not connect, spool,
-- change a persistent setting, or execute DDL/DML. EXITCOMMIT is disabled and
-- every exit rolls back, so this session cannot commit caller work. It
-- deliberately has no substitution variables: the target is exactly
-- "XYY_DIRECTUS"."directus_revisions".
--
-- Do not paste credentials into this file or into shell history. Start the
-- client through the approved secret-management path, then run:
--   @deploy/oracle19c/inspect-revision-capacity.sql

whenever oserror exit failure rollback
whenever sqlerror exit failure rollback

set exitcommit off
set define off
set echo off
set verify off
set feedback on
set heading on
set pagesize 200
set linesize 220
set trimspool on
set tab off

prompt === XYY-20260904-01 Oracle revision-capacity preflight (READ ONLY) ===
prompt Target: "XYY_DIRECTUS"."directus_revisions" columns "data" and "delta"
prompt No revision JSON, content, credentials, or data-size scan is selected.

prompt === Connected identity and ordinary-user-visible database version ===
select
  sys_context('USERENV', 'SESSION_USER') as session_user,
  sys_context('USERENV', 'CURRENT_SCHEMA') as current_schema,
  sys_context('USERENV', 'DB_NAME') as database_name,
  sys_context('USERENV', 'CON_NAME') as container_name
from dual;

select product, version, version_full, status
from product_component_version;

prompt === Target object visibility ===
select owner, object_name, object_type, status
from all_objects
where owner = 'XYY_DIRECTUS'
  and object_name = 'directus_revisions'
  and object_type = 'TABLE';

prompt === data/delta type, byte/char semantics, nullability, and default metadata ===
select
  owner,
  table_name,
  column_id,
  column_name,
  data_type,
  data_type_mod,
  data_length as data_length_bytes,
  char_length,
  char_used as char_semantics,
  nullable,
  default_length,
  default_on_null,
  identity_column
from all_tab_columns
where owner = 'XYY_DIRECTUS'
  and table_name = 'directus_revisions'
  and column_name in ('data', 'delta')
order by column_id;

prompt === Constraints that directly include data or delta; no constraint text is printed ===
select
  c.constraint_name,
  c.constraint_type,
  cc.position as column_position,
  cc.column_name,
  c.status,
  c.validated,
  c.deferrable,
  c.deferred,
  c.rely,
  c.generated,
  case
    when c.constraint_type = 'C'
      and upper(c.search_condition_vc) like '%IS JSON%'
      then 'IS JSON DETECTED'
    when c.constraint_type = 'C'
      then 'CHECK (NOT JSON OR EXPRESSION NOT VISIBLE)'
    else 'NOT A CHECK CONSTRAINT'
  end as json_constraint_state
from all_constraints c
join all_cons_columns cc
  on cc.owner = c.owner
 and cc.constraint_name = c.constraint_name
where c.owner = 'XYY_DIRECTUS'
  and c.table_name = 'directus_revisions'
  and cc.table_name = 'directus_revisions'
  and cc.column_name in ('data', 'delta')
order by c.constraint_name, cc.position;

prompt === All accessible indexes on the target table; no index data or expressions are printed ===
select
  i.owner as index_owner,
  i.index_name,
  i.index_type,
  i.uniqueness,
  i.status as index_status,
  ic.column_position,
  ic.column_name,
  ic.descend
from all_indexes i
join all_ind_columns ic
  on ic.index_owner = i.owner
 and ic.index_name = i.index_name
where i.table_owner = 'XYY_DIRECTUS'
  and i.table_name = 'directus_revisions'
order by i.owner, i.index_name, ic.column_position;

prompt === Triggers on the target table; trigger bodies are not printed ===
select
  owner,
  trigger_name,
  status as trigger_status,
  trigger_type,
  triggering_event,
  base_object_type
from all_triggers
where table_owner = 'XYY_DIRECTUS'
  and table_name = 'directus_revisions'
order by owner, trigger_name;

prompt === Foreign keys that reference a key on the target table ===
select
  child.owner as child_owner,
  child.table_name as child_table_name,
  child.constraint_name as child_constraint_name,
  child.status,
  child.validated,
  child.delete_rule,
  parent.constraint_name as target_key_constraint_name
from all_constraints child
join all_constraints parent
  on parent.owner = child.r_owner
 and parent.constraint_name = child.r_constraint_name
where child.constraint_type = 'R'
  and parent.owner = 'XYY_DIRECTUS'
  and parent.table_name = 'directus_revisions'
order by child.owner, child.table_name, child.constraint_name;

prompt === Accessible object dependencies on the target table ===
select
  owner as dependent_owner,
  name as dependent_name,
  type as dependent_type,
  dependency_type
from all_dependencies
where referenced_owner = 'XYY_DIRECTUS'
  and referenced_name = 'directus_revisions'
  and referenced_type = 'TABLE'
order by owner, name, type;

prompt === End of read-only preflight ===
prompt Empty ALL_* output means no matching accessible metadata, not proof that metadata is absent.
exit success rollback
