# Local-to-cloud Passport migration

Local Passport schema version: **2**.

## When it runs

After a successful authentication, `PassportProvider` migrates device data once per user on that browser.

## Flow

1. Read local Passport JSON
2. Validate/sanitize via `migratePassportStore`
3. Write a local backup (`mdp-passport-migration-backup`)
4. Resolve restaurants by stable slug
5. Load existing cloud records
6. Merge local + cloud
7. Upsert `user_restaurants`
8. Create/merge collections + items
9. Verify by reloading cloud store
10. Mark migration complete (`mdp-passport-cloud-migrated`)
11. Keep backup after success for conflict recovery
12. Surface a recovery message if migration partially fails

Migration is idempotent and safe to retry.

## Merge rules

- Booleans are true if either source is true
- Preserve nonempty private notes
- If both notes differ, keep the newer primary value and record a conflict (backup retains the other)
- Preserve non-null planned and visited dates
- Union favorite dishes without duplicates
- Prefer the most recently updated personal rating
- Merge collections by id or normalized slug; prevent duplicate items
- Unknown restaurant slugs are skipped and reported

## Non-goals

- Do not clear local data merely because the user reached `/auth/callback`
- Public sharing of collections is deferred even if `is_public` exists
