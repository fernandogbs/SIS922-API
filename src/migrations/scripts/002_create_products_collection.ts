import { Db } from 'mongodb'
import { Migration } from '../MigrationManager'

export const createProductsCollectionMigration: Migration = {
  id: '002',
  name: 'Create products collection with indexes',

  async up(db: Db): Promise<void> {
    const collection = db.collection('restaurant')

    await collection.createIndex(
      { name: 1 },
      { name: 'product_name_index' }
    )

    await collection.createIndex(
      { category: 1 },
      { name: 'product_category_index' }
    )

    await collection.createIndex(
      { price: 1 },
      { name: 'product_price_index' }
    )

    await collection.createIndex(
      { available: 1 },
      { name: 'product_availability_index' }
    )

    await collection.createIndex(
      { name: 'text', description: 'text' },
      { name: 'product_text_search_index' }
    )

    await collection.createIndex(
      { createdAt: 1 },
      { name: 'product_created_at_index' }
    )

    console.log('✅ Created restaurant collection with indexes')
  },

  async down(db: Db): Promise<void> {
    await db.collection('restaurant').drop()
    console.log('✅ Dropped restaurant collection')
  }
}
