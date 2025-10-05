#!/usr/bin/env ts-node

import dotenv from 'dotenv'
import { database } from '../config/database'
import { MigrationManager, migrations } from '../migrations'

dotenv.config()

async function runMigrations() {
  try {
    console.log('Starting migration process...')

    await database.connect()
    console.log('Connected to MongoDB Atlas')

    const migrationManager = new MigrationManager(database.getDatabase())

    await migrationManager.runMigrations(migrations)

    console.log('All migrations completed successfully!')
    console.log('\nDatabase setup complete:')
    console.log('- Database: restaurant')
    console.log('- Collections: users, restaurant, carts, orders, migrations')
    console.log('- Indexes: Created for optimal performance')
    console.log('- Sample data: Populated with products and test users')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await database.disconnect()
    process.exit(0)
  }
}

async function showMigrationStatus() {
  try {
    await database.connect()
    const migrationManager = new MigrationManager(database.getDatabase())

    const status = await migrationManager.getMigrationStatus()

    console.log('Migration Status:')
    console.log('\nExecuted Migrations:')
    if (status.executed.length === 0) {
      console.log('  No migrations executed yet')
    } else {
      status.executed.forEach(migration => {
        console.log(`  - ${migration.migrationId}: ${migration.name} (${migration.executedAt.toISOString()})`)
      })
    }

  } catch (error) {
    console.error('Error checking migration status:', error)
    process.exit(1)
  } finally {
    await database.disconnect()
    process.exit(0)
  }
}

const command = process.argv[2]

switch (command) {
  case 'run':
    runMigrations()
    break
  case 'status':
    showMigrationStatus()
    break
  default:
    console.log('Usage:')
    console.log('  yarn migrate run     - Run all pending migrations')
    console.log('  yarn migrate status  - Show migration status')
    process.exit(1)
}
