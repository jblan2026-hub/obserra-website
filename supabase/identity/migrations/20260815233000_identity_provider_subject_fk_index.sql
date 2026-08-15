begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

create index identity_provider_links_provider_subject_idx
  on identity_private.provider_links using btree (provider_subject);

do $identity_provider_subject_index_assertion$
begin
  if not exists (
    select 1
      from pg_catalog.pg_index i
      join pg_catalog.pg_class index_relation on index_relation.oid = i.indexrelid
      join pg_catalog.pg_class table_relation on table_relation.oid = i.indrelid
      join pg_catalog.pg_namespace table_namespace on table_namespace.oid = table_relation.relnamespace
      join pg_catalog.pg_am access_method on access_method.oid = index_relation.relam
      join pg_catalog.pg_attribute provider_subject_attribute
        on provider_subject_attribute.attrelid = table_relation.oid
       and provider_subject_attribute.attname = 'provider_subject'
       and not provider_subject_attribute.attisdropped
     where table_namespace.nspname = 'identity_private'
       and table_relation.relname = 'provider_links'
       and index_relation.relname = 'identity_provider_links_provider_subject_idx'
       and access_method.amname = 'btree'
       and i.indisvalid
       and i.indisready
       and not i.indisunique
       and i.indnkeyatts = 1
       and i.indnatts = 1
       and i.indexprs is null
       and i.indpred is null
       and i.indkey[0] = provider_subject_attribute.attnum
  ) then
    raise exception 'identity provider subject index assertion failed';
  end if;
end;
$identity_provider_subject_index_assertion$;

commit;
