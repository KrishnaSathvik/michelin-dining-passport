export const MIGRATION_FLAG_KEY = "mdp-passport-cloud-migrated";
export const MIGRATION_BACKUP_KEY = "mdp-passport-migration-backup";

export type LocalMigrationState = {
  completed: boolean;
  completedAt: string | null;
  userId: string | null;
  conflictCount: number;
  lastError: string | null;
};

export function readMigrationState(): LocalMigrationState {
  if (typeof window === "undefined") {
    return {
      completed: false,
      completedAt: null,
      userId: null,
      conflictCount: 0,
      lastError: null,
    };
  }
  try {
    const raw = window.localStorage.getItem(MIGRATION_FLAG_KEY);
    if (!raw) {
      return {
        completed: false,
        completedAt: null,
        userId: null,
        conflictCount: 0,
        lastError: null,
      };
    }
    const parsed = JSON.parse(raw) as Partial<LocalMigrationState>;
    return {
      completed: Boolean(parsed.completed),
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : null,
      userId: typeof parsed.userId === "string" ? parsed.userId : null,
      conflictCount:
        typeof parsed.conflictCount === "number" ? parsed.conflictCount : 0,
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
    };
  } catch {
    return {
      completed: false,
      completedAt: null,
      userId: null,
      conflictCount: 0,
      lastError: null,
    };
  }
}

export function writeMigrationState(state: LocalMigrationState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MIGRATION_FLAG_KEY, JSON.stringify(state));
}

export function writeMigrationBackup(payload: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    MIGRATION_BACKUP_KEY,
    JSON.stringify({ savedAt: new Date().toISOString(), payload }),
  );
}
