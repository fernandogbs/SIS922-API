import { Collection, ObjectId } from 'mongodb'
import { database } from '../config/database'
import { Product, ProductFilters } from '../types'

export class ProductService {
  private getProductsCollection(): Collection<Product> {
    return database.getDatabase().collection<Product>('restaurant')
  }

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const productsCollection = this.getProductsCollection()
      const query: any = {}

      if (filters) {
        if (filters.category) {
          query.category = { $regex: new RegExp(filters.category, 'i') }
        }
        if (filters.minPrice !== undefined) {
          query.price = { ...query.price, $gte: filters.minPrice }
        }
        if (filters.maxPrice !== undefined) {
          query.price = { ...query.price, $lte: filters.maxPrice }
        }
        if (filters.available !== undefined) {
          query.available = filters.available
        }
        if (filters.search) {
          query.$or = [
            { name: { $regex: new RegExp(filters.search, 'i') } },
            { description: { $regex: new RegExp(filters.search, 'i') } }
          ]
        }
      }

      return await productsCollection.find(query).toArray()
    } catch (error) {
      console.error('Get products error:', error)
      return []
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      if (!ObjectId.isValid(productId)) {
        return null
      }

      const productsCollection = this.getProductsCollection()
      return await productsCollection.findOne({ _id: new ObjectId(productId) })
    } catch (error) {
      console.error('Get product error:', error)
      return null
    }
  }

  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const productsCollection = this.getProductsCollection()

      const newProduct: Product = {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await productsCollection.insertOne(newProduct)
      return { ...newProduct, _id: result.insertedId }
    } catch (error) {
      console.error('Create product error:', error)
      return null
    }
  }

  async updateProduct(productId: string, updateData: Partial<Product>): Promise<Product | null> {
    try {
      if (!ObjectId.isValid(productId)) {
        return null
      }

      const productsCollection = this.getProductsCollection()

      const updatedProduct = {
        ...updateData,
        updatedAt: new Date()
      }

      const result = await productsCollection.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updatedProduct },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Update product error:', error)
      return null
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(productId)) {
        return false
      }

      const productsCollection = this.getProductsCollection()
      const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) })

      return result.deletedCount === 1
    } catch (error) {
      console.error('Delete product error:', error)
      return false
    }
  }
}

export const productService = new ProductService()
