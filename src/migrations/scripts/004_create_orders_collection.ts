import { Db } from 'mongodb'
import { Migration } from '../MigrationManager'

export const createOrdersCollectionMigration: Migration = {
  id: '004',
  name: 'Create orders collection with indexes',

  async up(db: Db): Promise<void> {
    const collection = db.collection('orders')

    // Create indexes for orders collection
    await collection.createIndex(
      { userId: 1 },
      { name: 'order_user_index' }
    )

    await collection.createIndex(
      { status: 1 },
      { name: 'order_status_index' }
    )

    await collection.createIndex(
      { createdAt: -1 },
      { name: 'order_created_at_desc_index' }
    )

    await collection.createIndex(
      { totalAmount: 1 },
      { name: 'order_total_amount_index' }
    )

    await collection.createIndex(
      { userCellphone: 1 },
      { name: 'order_user_cellphone_index' }
    )

    console.log('Created orders collection with indexes')
  },

  async down(db: Db): Promise<void> {
    await db.collection('orders').drop()
    console.log('Dropped orders collection')
  }
}
