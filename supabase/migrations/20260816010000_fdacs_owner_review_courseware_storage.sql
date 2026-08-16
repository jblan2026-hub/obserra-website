-- Private courseware storage for the exact-release, AAL2 owner-review surface.
-- This migration does not apply either pending FDACS regulated migration, create
-- a student or enrollment, enable training delivery, award attendance or credit,
-- authorize completion, generate a certificate, or enqueue LIAS reporting.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'fdacs-owner-review-courseware',
  'fdacs-owner-review-courseware',
  false,
  104857600,
  array[
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
