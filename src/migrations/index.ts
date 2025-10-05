import { Migration } from './MigrationManager'
import { createUsersCollectionMigration } from './scripts/001_create_users_collection'
import { createProductsCollectionMigration } from './scripts/002_create_products_collection'
import { createCartsCollectionMigration } from './scripts/003_create_carts_collection'
import { createOrdersCollectionMigration } from './scripts/004_create_orders_collection'
import { seedInitialDataMigration } from './scripts/005_seed_initial_data'

export const migrations: Migration[] = [
  createUsersCollectionMigration,
  createProductsCollectionMigration,
  createCartsCollectionMigration,
  createOrdersCollectionMigration,
  seedInitialDataMigration
]

export { MigrationManager } from './MigrationManager'
