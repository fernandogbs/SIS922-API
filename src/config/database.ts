import { MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'

let envLoaded = false

class Database {
  private client: MongoClient | null = null
  private db: Db | null = null
  private uri: string | null = null
  private dbName: string | null = null

  private loadEnv() {
    if (!envLoaded) {
      dotenv.config()
      envLoaded = true
    }
    this.uri = process.env.MONGODB_URI || ''
    this.dbName = process.env.DB_NAME || 'restaurant'
  }

  private maskUri(uri: string) {
    return uri.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@')
  }

  async connect(): Promise<void> {
    if (this.db) return // already connected

    if (!this.uri || !this.dbName) {
      this.loadEnv()
    }

    if (!this.uri) {
      throw new Error('MONGODB_URI is missing. Check your .env file.')
    }

    console.log('Connecting to MongoDB Atlas...')
    console.log(`URI: ${this.maskUri(this.uri)} DB: ${this.dbName}`)

    try {
      this.client = new MongoClient(this.uri, {
        serverSelectionTimeoutMS: 10000,
        retryWrites: true,
      })
      await this.client.connect()
      await this.client.db(this.dbName!).admin().ping()
      this.db = this.client.db(this.dbName!)
      console.log(`Connected to MongoDB database: ${this.dbName}`)
    } catch (err) {
      console.error('MongoDB connection failed')
      throw err
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      console.log('Disconnected from MongoDB')
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.')
    }
    return this.db
  }

  isConnected(): boolean {
    return this.db !== null
  }
}

export const database = new Database()
export { Database }
