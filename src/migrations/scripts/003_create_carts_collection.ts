import { Db } from 'mongodb'
import { Migration } from '../MigrationManager'

export const createCartsCollectionMigration: Migration = {
  id: '003',
  name: 'Create carts collection with indexes',

  async up(db: Db): Promise<void> {
    const collection = db.collection('carts')

    await collection.createIndex(
      { userId: 1 },
      { unique: true, name: 'unique_user_cart' }
    )

    await collection.createIndex(
      { 'items.productId': 1 },
      { name: 'cart_items_product_index' }
    )

    await collection.createIndex(
      { updatedAt: 1 },
      { name: 'cart_updated_at_index' }
    )

    console.log('✅ Created carts collection with indexes')
  },

  async down(db: Db): Promise<void> {
    await db.collection('carts').drop()
    console.log('✅ Dropped carts collection')
  }
}
