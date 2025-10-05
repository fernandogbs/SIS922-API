import { Collection, ObjectId } from 'mongodb'
import { database } from '../config/database'
import { Order } from '../types'
import { cartService } from './cartService'
import { userService } from './userService'

export class OrderService {
  private getOrdersCollection(): Collection<Order> {
    return database.getDatabase().collection<Order>('orders')
  }

  async createOrderFromCart(userId: string, notes?: string): Promise<Order | null> {
    try {
      if (!ObjectId.isValid(userId)) {
        return null
      }

      const cart = await cartService.getCart(userId)
      const user = await userService.getUserById(userId)

      if (!cart || !user || cart.items.length === 0) {
        return null
      }

      const ordersCollection = this.getOrdersCollection()

      const newOrder: Order = {
        userId: new ObjectId(userId),
        userName: user.name,
        userCellphone: user.cellphone,
        items: cart.items,
        totalAmount: cart.totalAmount,
        status: 'pending',
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await ordersCollection.insertOne(newOrder)

      await cartService.clearCart(userId)

      return { ...newOrder, _id: result.insertedId }
    } catch (error) {
      console.error('Create order error:', error)
      return null
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      if (!ObjectId.isValid(userId)) {
        return []
      }

      const ordersCollection = this.getOrdersCollection()
      return await ordersCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray()
    } catch (error) {
      console.error('Get user orders error:', error)
      return []
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const ordersCollection = this.getOrdersCollection()
      return await ordersCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray()
    } catch (error) {
      console.error('Get all orders error:', error)
      return []
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      if (!ObjectId.isValid(orderId)) {
        return null
      }

      const ordersCollection = this.getOrdersCollection()
      return await ordersCollection.findOne({ _id: new ObjectId(orderId) })
    } catch (error) {
      console.error('Get order error:', error)
      return null
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    try {
      if (!ObjectId.isValid(orderId)) {
        return null
      }

      const ordersCollection = this.getOrdersCollection()

      const result = await ordersCollection.findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Update order status error:', error)
      return null
    }
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const ordersCollection = this.getOrdersCollection()
      return await ordersCollection
        .find({ status })
        .sort({ createdAt: -1 })
        .toArray()
    } catch (error) {
      console.error('Get orders by status error:', error)
      return []
    }
  }
}

export const orderService = new OrderService()
