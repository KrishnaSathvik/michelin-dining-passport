-- Personal restaurant state: one row per user + restaurant.

create table public.user_restaurants (
  user_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  is_saved boolean not null default false,
  wants_to_visit boolean not null default false,
  is_planned boolean not null default false,
  planned_for date,
  reservation_provider text,
  reservation_confirmation_note text,
  is_visited boolean not null default false,
  visited_on date,
  is_favorite boolean not null default false,
  personal_rating smallint,
  private_notes text,
  favorite_dishes text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, restaurant_id),
  constraint user_restaurants_personal_rating_check check (
    personal_rating is null or personal_rating between 1 and 5
  )
);

create index user_restaurants_user_id_idx on public.user_restaurants (user_id);
create index user_restaurants_restaurant_id_idx on public.user_restaurants (restaurant_id);
create index user_restaurants_user_saved_idx on public.user_restaurants (user_id)
  where is_saved = true;
create index user_restaurants_user_visited_idx on public.user_restaurants (user_id)
  where is_visited = true;

create trigger user_restaurants_set_updated_at
before update on public.user_restaurants
for each row
execute function public.set_updated_at();

-- Delete empty personal rows instead of retaining no-op state.
create or replace function public.user_restaurant_is_meaningful(
  p_is_saved boolean,
  p_wants_to_visit boolean,
  p_is_planned boolean,
  p_planned_for date,
  p_reservation_provider text,
  p_reservation_confirmation_note text,
  p_is_visited boolean,
  p_visited_on date,
  p_is_favorite boolean,
  p_personal_rating smallint,
  p_private_notes text,
  p_favorite_dishes text[]
)
returns boolean
language sql
immutable
as $$
  select
    coalesce(p_is_saved, false)
    or coalesce(p_wants_to_visit, false)
    or coalesce(p_is_planned, false)
    or p_planned_for is not null
    or nullif(btrim(coalesce(p_reservation_provider, '')), '') is not null
    or nullif(btrim(coalesce(p_reservation_confirmation_note, '')), '') is not null
    or coalesce(p_is_visited, false)
    or p_visited_on is not null
    or coalesce(p_is_favorite, false)
    or p_personal_rating is not null
    or nullif(btrim(coalesce(p_private_notes, '')), '') is not null
    or coalesce(cardinality(p_favorite_dishes), 0) > 0;
$$;

create or replace function public.prune_empty_user_restaurant()
returns trigger
language plpgsql
as $$
begin
  if not public.user_restaurant_is_meaningful(
    new.is_saved,
    new.wants_to_visit,
    new.is_planned,
    new.planned_for,
    new.reservation_provider,
    new.reservation_confirmation_note,
    new.is_visited,
    new.visited_on,
    new.is_favorite,
    new.personal_rating,
    new.private_notes,
    new.favorite_dishes
  ) then
    if tg_op = 'UPDATE' then
      delete from public.user_restaurants
      where user_id = new.user_id and restaurant_id = new.restaurant_id;
      return null;
    end if;
    return null;
  end if;
  return new;
end;
$$;

create trigger user_restaurants_prune_empty
before insert or update on public.user_restaurants
for each row
execute function public.prune_empty_user_restaurant();
