-- Queue for deferred account deletion when immediate deletion is unsafe.

create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  status text not null default 'pending',
  constraint account_deletion_requests_status_check check (
    status in ('pending', 'processing', 'completed', 'failed', 'cancelled')
  )
);

create index account_deletion_requests_user_id_idx
  on public.account_deletion_requests (user_id);
create index account_deletion_requests_status_idx
  on public.account_deletion_requests (status);
