import { Db } from 'mongodb'
import { Migration } from '../MigrationManager'

export const createUsersCollectionMigration: Migration = {
  id: '001',
  name: 'Create users collection with indexes',

  async up(db: Db): Promise<void> {
    const collection = db.collection('users')

    await collection.createIndex(
      { name: 1, cellphone: 1 },
      { unique: true, name: 'unique_user_credentials' }
    )

    await collection.createIndex(
      { cellphone: 1 },
      { unique: true, name: 'unique_cellphone' }
    )

    await collection.createIndex(
      { type: 1 },
      { name: 'user_type_index' }
    )

    await collection.createIndex(
      { createdAt: 1 },
      { name: 'created_at_index' }
    )

    console.log('Created users collection with indexes')
  },

  async down(db: Db): Promise<void> {
    await db.collection('users').drop()
    console.log('Dropped users collection')
  }
}
