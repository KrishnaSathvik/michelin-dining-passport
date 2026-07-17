# Row Level Security

RLS is enabled on every public table created in Phase 6.

## Public tables

### `restaurants`

- `anon` + `authenticated` may `SELECT` rows where `is_published = true`
- No anonymous writes

### `restaurant_reservations`

- `anon` + `authenticated` may `SELECT` rows whose parent restaurant is published
- No anonymous writes

## Personal tables

Policies target the `authenticated` role explicitly and use both `USING` and `WITH CHECK` where needed.

### `profiles`

- Select/update/insert only when `id = auth.uid()`

### `user_restaurants`

- Select/insert/update/delete only when `user_id = auth.uid()`
- Indexed on `user_id` for policy predicates

### `collections`

- CRUD only when `user_id = auth.uid()`

### `collection_items`

- CRUD only when the parent collection is owned by `auth.uid()`

### `account_deletion_requests`

- Authenticated users may insert/select their own rows
- Completion/deletion uses the secret-key admin client server-side

## Validation

Run:

```bash
npm run supabase:rls:validate
```

This creates two temporary users, checks cross-user isolation, verifies anonymous read/write boundaries, then deletes the users.
