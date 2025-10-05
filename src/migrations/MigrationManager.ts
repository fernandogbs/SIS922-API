import { Db, Collection } from 'mongodb'

export interface Migration {
  id: string
  name: string
  up: (db: Db) => Promise<void>
  down: (db: Db) => Promise<void>
}

export interface MigrationRecord {
  _id?: any
  migrationId: string
  name: string
  executedAt: Date
}

export class MigrationManager {
  private db: Db
  private migrationsCollection: Collection<MigrationRecord>

  constructor(db: Db) {
    this.db = db
    this.migrationsCollection = db.collection<MigrationRecord>('migrations')
  }

  async getExecutedMigrations(): Promise<string[]> {
    const executed = await this.migrationsCollection
      .find({})
      .sort({ executedAt: 1 })
      .toArray()
    return executed.map(m => m.migrationId)
  }

  async markMigrationAsExecuted(migration: Migration): Promise<void> {
    await this.migrationsCollection.insertOne({
      migrationId: migration.id,
      name: migration.name,
      executedAt: new Date()
    })
  }

  async markMigrationAsReverted(migrationId: string): Promise<void> {
    await this.migrationsCollection.deleteOne({ migrationId })
  }

  async runMigrations(migrations: Migration[]): Promise<void> {
    console.log('Running database migrations...')

    const executedMigrations = await this.getExecutedMigrations()
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.id)
    )

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run')
      return
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`)

    for (const migration of pendingMigrations) {
      try {
        console.log(`Running migration: ${migration.name}`)
        await migration.up(this.db)
        await this.markMigrationAsExecuted(migration)
        console.log(`Migration completed: ${migration.name}`)
      } catch (error) {
        console.error(`Migration failed: ${migration.name}`, error)
        throw error
      }
    }

    console.log('All migrations completed successfully!')
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    console.log(`Rolling back migration: ${migration.name}`)

    try {
      await migration.down(this.db)
      await this.markMigrationAsReverted(migration.id)
      console.log(`Migration rolled back: ${migration.name}`)
    } catch (error) {
      console.error(`Rollback failed: ${migration.name}`, error)
      throw error
    }
  }

  async getMigrationStatus(): Promise<{ executed: MigrationRecord[] pending: string[] }> {
    const executed = await this.migrationsCollection
      .find({})
      .sort({ executedAt: 1 })
      .toArray()

    return {
      executed,
      pending: [] // This would need the full migrations list to determine pending ones
    }
  }
}
