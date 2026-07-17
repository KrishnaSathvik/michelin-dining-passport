-- User collections and items. Public sharing is deferred (is_public for future use).

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  cover_restaurant_id uuid references public.restaurants (id) on delete set null,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, slug)
);

create index collections_user_id_idx on public.collections (user_id);
create index collections_user_slug_idx on public.collections (user_id, slug);

create trigger collections_set_updated_at
before update on public.collections
for each row
execute function public.set_updated_at();

create table public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (collection_id, restaurant_id)
);

create index collection_items_collection_id_idx
  on public.collection_items (collection_id);
create index collection_items_restaurant_id_idx
  on public.collection_items (restaurant_id);
