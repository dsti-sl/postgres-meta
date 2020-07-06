SELECT
  c.oid AS table_id,
  table_schema AS schema,
  table_name AS table,
  (c.oid || '.' || ordinal_position) AS id,
  ordinal_position,
  column_name AS name,
  column_default AS default_value,
  data_type,
  udt_name AS format,
  col_description(
    c.oid,
    ordinal_position
  ) AS description,
  is_identity::boolean,
  identity_generation,
  is_nullable::boolean,
  is_updatable::boolean
FROM
  information_schema.columns
  JOIN pg_class c ON quote_ident(table_schema)::regnamespace = c.relnamespace
  AND c.relname = table_name
