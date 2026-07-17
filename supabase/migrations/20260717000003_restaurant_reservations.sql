-- Approved runtime reservation records only (one row per restaurant).

create table public.restaurant_reservations (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  reservation_url text,
  provider text,
  status text not null,
  source_type text,
  confidence text,
  verified_at timestamptz,
  notes text,
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurant_reservations_status_check check (
    status in (
      'verified',
      'needs_review',
      'unknown',
      'no_online_booking',
      'phone_only',
      'temporarily_unavailable'
    )
  )
);

create index restaurant_reservations_status_idx
  on public.restaurant_reservations (status);
create index restaurant_reservations_provider_idx
  on public.restaurant_reservations (provider);

create trigger restaurant_reservations_set_updated_at
before update on public.restaurant_reservations
for each row
execute function public.set_updated_at();
