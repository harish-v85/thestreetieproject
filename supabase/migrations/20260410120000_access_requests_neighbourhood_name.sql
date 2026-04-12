-- Optional free-text neighbourhood from the public access request form.
alter table public.access_requests
  add column if not exists neighbourhood_name text;
