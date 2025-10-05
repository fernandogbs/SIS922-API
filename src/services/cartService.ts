import { Collection, ObjectId } from 'mongodb'
import { database } from '../config/database'
import { Cart, CartItem } from '../types'
import { productService } from './productService'

export class CartService {
  private getCartsCollection(): Collection<Cart> {
    return database.getDatabase().collection<Cart>('carts')
  }

  async getOrCreateCart(userId: string): Promise<Cart | null> {
    try {
      if (!ObjectId.isValid(userId)) {
        return null
      }

      const cartsCollection = this.getCartsCollection()
      const userObjectId = new ObjectId(userId)

      let cart = await cartsCollection.findOne({ userId: userObjectId })

      if (!cart) {
        const newCart: Cart = {
          userId: userObjectId,
          items: [],
          totalAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await cartsCollection.insertOne(newCart)
        cart = { ...newCart, _id: result.insertedId }
      }

      return cart
    } catch (error) {
      console.error('Get or create cart error:', error)
      return null
    }
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart | null> {
    try {
      if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return null
      }

      const product = await productService.getProductById(productId)
      if (!product || !product.available) {
        return null
      }

      const cart = await this.getOrCreateCart(userId)
      if (!cart) {
        return null
      }

      const cartsCollection = this.getCartsCollection()
      const productObjectId = new ObjectId(productId)

      const existingItemIndex = cart.items.findIndex(item => item.productId.equals(productObjectId))

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity
      } else {
        const cartItem: CartItem = {
          productId: productObjectId,
          name: product.name,
          price: product.price,
          quantity
        }
        cart.items.push(cartItem)
      }

      // Recalculate total
      cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      cart.updatedAt = new Date()

      // Update cart in database
      const result = await cartsCollection.findOneAndUpdate(
        { _id: cart._id },
        { $set: { items: cart.items, totalAmount: cart.totalAmount, updatedAt: cart.updatedAt } },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Add to cart error:', error)
      return null
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart | null> {
    try {
      if (!ObjectId.isValid(userId) || !ObjectId.isValid(productId)) {
        return null
      }

      const cart = await this.getOrCreateCart(userId)
      if (!cart) {
        return null
      }

      const cartsCollection = this.getCartsCollection()
      const productObjectId = new ObjectId(productId)

      // Remove item from cart
      cart.items = cart.items.filter(item => !item.productId.equals(productObjectId))

      // Recalculate total
      cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      cart.updatedAt = new Date()

      // Update cart in database
      const result = await cartsCollection.findOneAndUpdate(
        { _id: cart._id },
        { $set: { items: cart.items, totalAmount: cart.totalAmount, updatedAt: cart.updatedAt } },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Remove from cart error:', error)
      return null
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(userId)) {
        return false
      }

      const cartsCollection = this.getCartsCollection()
      const userObjectId = new ObjectId(userId)

      const result = await cartsCollection.updateOne(
        { userId: userObjectId },
        {
          $set: {
            items: [],
            totalAmount: 0,
            updatedAt: new Date()
          }
        }
      )

      return result.modifiedCount === 1
    } catch (error) {
      console.error('Clear cart error:', error)
      return false
    }
  }

  async getCart(userId: string): Promise<Cart | null> {
    try {
      return await this.getOrCreateCart(userId)
    } catch (error) {
      console.error('Get cart error:', error)
      return null
    }
  }
}

export const cartService = new CartService()
