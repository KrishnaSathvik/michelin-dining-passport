-- Canonical restaurant roster. Stable identity is slug; IDs are deterministic from seed.

create table public.restaurants (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  stars smallint not null,
  cuisine text not null,
  price text,
  city text not null,
  state text not null,
  state_code text not null,
  address text,
  michelin_guide_url text,
  website_url text,
  latitude double precision,
  longitude double precision,
  is_published boolean not null default true,
  source_updated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurants_stars_check check (stars between 1 and 3),
  constraint restaurants_state_code_check check (char_length(state_code) = 2)
);

create index restaurants_slug_idx on public.restaurants (slug);
create index restaurants_city_idx on public.restaurants (city);
create index restaurants_state_code_idx on public.restaurants (state_code);
create index restaurants_stars_idx on public.restaurants (stars);
create index restaurants_is_published_idx on public.restaurants (is_published);
create index restaurants_published_slug_idx on public.restaurants (slug)
  where is_published = true;

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row
execute function public.set_updated_at();
