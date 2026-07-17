-- Row Level Security: enable on every public table and target roles explicitly.

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_reservations enable row level security;
alter table public.user_restaurants enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.account_deletion_requests enable row level security;

-- ---------------------------------------------------------------------------
-- restaurants (public read of published rows)
-- ---------------------------------------------------------------------------
create policy "Anonymous can select published restaurants"
on public.restaurants
for select
to anon
using (is_published = true);

create policy "Authenticated can select published restaurants"
on public.restaurants
for select
to authenticated
using (is_published = true);

-- ---------------------------------------------------------------------------
-- restaurant_reservations (public read for published restaurants)
-- ---------------------------------------------------------------------------
create policy "Anonymous can select reservations for published restaurants"
on public.restaurant_reservations
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

create policy "Authenticated can select reservations for published restaurants"
on public.restaurant_reservations
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

-- ---------------------------------------------------------------------------
-- profiles (own row only)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can select own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy "Authenticated users can update own profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Authenticated users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- user_restaurants (own rows only)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can select own user restaurants"
on public.user_restaurants
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Authenticated users can insert own user restaurants"
on public.user_restaurants
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Authenticated users can update own user restaurants"
on public.user_restaurants
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Authenticated users can delete own user restaurants"
on public.user_restaurants
for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- collections (own rows only)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can select own collections"
on public.collections
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Authenticated users can insert own collections"
on public.collections
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "Authenticated users can update own collections"
on public.collections
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "Authenticated users can delete own collections"
on public.collections
for delete
to authenticated
using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- collection_items (via ownership of parent collection)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can select own collection items"
on public.collection_items
for select
to authenticated
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Authenticated users can insert own collection items"
on public.collection_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Authenticated users can update own collection items"
on public.collection_items
for update
to authenticated
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.user_id = (select auth.uid())
  )
);

create policy "Authenticated users can delete own collection items"
on public.collection_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.collections c
    where c.id = collection_id
      and c.user_id = (select auth.uid())
  )
);

-- ---------------------------------------------------------------------------
-- account_deletion_requests (own rows only; insert/select)
-- ---------------------------------------------------------------------------
create policy "Authenticated users can select own deletion requests"
on public.account_deletion_requests
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Authenticated users can insert own deletion requests"
on public.account_deletion_requests
for insert
to authenticated
with check (user_id = (select auth.uid()));
