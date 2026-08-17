begin;

-- FDACS Class D completion-document storage boundary.
-- Alignment:
--   * Rule 5N-1.140, F.A.C.: school records must retain completion evidence and
--     be reproducible/transmittable for Division investigator inspection.
--   * Rule 5N-1.142(4), F.A.C.: Class DS schools report successful Class D
--     completion through LIAS and generate FDACS-16103 through that system.
-- This bucket stores only the official LIAS-generated FDACS-16103 PDF copy
-- retained by the school. It does not generate an FDACS certificate, submit
-- training to DOL, activate training delivery, or award training credit.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'fdacs-class-d-completion-documents',
  'fdacs-class-d-completion-documents',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

commit;
