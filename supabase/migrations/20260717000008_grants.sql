-- Explicit privileges for Data API roles (required when auto-expose is off).

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.restaurants to anon, authenticated;
grant select on table public.restaurant_reservations to anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_restaurants to authenticated;
grant select, insert, update, delete on table public.collections to authenticated;
grant select, insert, update, delete on table public.collection_items to authenticated;
grant select, insert on table public.account_deletion_requests to authenticated;

-- service_role retains full access for admin operations.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
