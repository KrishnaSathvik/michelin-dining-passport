-- Award history for Michelin star counts by guide year.
-- Previous rows are retained when stars change; is_current marks the active award.

create table public.restaurant_awards (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  guide_year integer not null,
  stars smallint not null,
  source_url text,
  is_current boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurant_awards_stars_check check (stars between 1 and 3),
  constraint restaurant_awards_year_check check (guide_year >= 1900 and guide_year <= 2100),
  constraint restaurant_awards_restaurant_year_unique unique (restaurant_id, guide_year)
);

create index restaurant_awards_restaurant_id_idx
  on public.restaurant_awards (restaurant_id);

create index restaurant_awards_is_current_idx
  on public.restaurant_awards (is_current)
  where is_current = true;

create trigger restaurant_awards_set_updated_at
before update on public.restaurant_awards
for each row
execute function public.set_updated_at();

alter table public.restaurant_awards enable row level security;

create policy "Anonymous can select awards for published restaurants"
on public.restaurant_awards
for select
to anon
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_id
      and r.is_published = true
  )
);

create policy "Authenticated can select awards for published restaurants"
on public.restaurant_awards
for select
to authenticated
using (
  exists (
    select 1
    from public.restaurants r
    where r.id = restaurant_id
      and r.is_published = true
  )
);

grant select on table public.restaurant_awards to anon, authenticated;
grant all on table public.restaurant_awards to service_role;
