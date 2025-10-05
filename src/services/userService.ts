import { Collection, ObjectId } from 'mongodb'
import { database } from '../config/database'
import { User, LoginRequest, LoginResponse } from '../types'

export class UserService {
  private getUsersCollection(): Collection<User> {
    return database.getDatabase().collection<User>('users')
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const { name, cellphone } = loginData

      if (!name || !cellphone) {
        return {
          user: {} as User,
          success: false,
          message: 'Name and cellphone are required'
        }
      }

      const usersCollection = this.getUsersCollection()

      let user = await usersCollection.findOne({
        name: name.toLowerCase().trim(),
        cellphone: cellphone.trim()
      })

      if (!user) {
        const newUser: User = {
          name: name.toLowerCase().trim(),
          cellphone: cellphone.trim(),
          type: 'default',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const result = await usersCollection.insertOne(newUser)
        user = { ...newUser, _id: result.insertedId }
      } else {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { updatedAt: new Date() } }
        )
      }

      return {
        user,
        success: true,
        message: user ? 'Login successful' : 'User created and logged in'
      }

    } catch (error) {
      console.error('Login error:', error)
      return {
        user: {} as User,
        success: false,
        message: 'Internal server error'
      }
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      if (!ObjectId.isValid(userId)) {
        return null
      }

      const usersCollection = this.getUsersCollection()
      return await usersCollection.findOne({ _id: new ObjectId(userId) })
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }

  async createAdminUser(name: string, cellphone: string): Promise<User | null> {
    try {
      const usersCollection = this.getUsersCollection()

      const existingAdmin = await usersCollection.findOne({
        name: name.toLowerCase().trim(),
        cellphone: cellphone.trim()
      })

      if (existingAdmin) {
        await usersCollection.updateOne(
          { _id: existingAdmin._id },
          { $set: { type: 'admin', updatedAt: new Date() } }
        )
        return { ...existingAdmin, type: 'admin' }
      }

      const adminUser: User = {
        name: name.toLowerCase().trim(),
        cellphone: cellphone.trim(),
        type: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await usersCollection.insertOne(adminUser)
      return { ...adminUser, _id: result.insertedId }
    } catch (error) {
      console.error('Create admin error:', error)
      return null
    }
  }

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId)
      return user?.type === 'admin' || false
    } catch (error) {
      console.error('Check admin error:', error)
      return false
    }
  }
}

export const userService = new UserService()
