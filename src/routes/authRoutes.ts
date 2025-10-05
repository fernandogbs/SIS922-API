import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { LoginRequest } from '../types'
import { userService } from '../services/userService'

export async function authRoutes(fastify: FastifyInstance) {
  // Login or register user
  fastify.post<{ Body: LoginRequest }>('/api/auth/login', async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
    try {
      const { name, cellphone } = request.body

      if (!name || !cellphone) {
        return reply.status(400).send({
          success: false,
          message: 'Name and cellphone are required'
        })
      }

      const result = await userService.login({ name, cellphone })

      if (!result.success) {
        return reply.status(400).send(result)
      }

      return reply.status(200).send(result)
    } catch (error) {
      console.error('Login route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Get user profile
  fastify.get('/api/auth/profile/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: 'User ID is required'
        })
      }

      const user = await userService.getUserById(userId)

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found'
        })
      }

      return reply.status(200).send({
        success: true,
        user
      })
    } catch (error) {
      console.error('Profile route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Create admin user (for development/setup purposes)
  fastify.post<{ Body: { name: string; cellphone: string; adminSecret?: string } }>('/api/auth/create-admin', async (request: FastifyRequest<{ Body: { name: string; cellphone: string; adminSecret?: string } }>, reply: FastifyReply) => {
    try {
      const { name, cellphone, adminSecret } = request.body

      // Simple secret check for admin creation (in production, this should be more secure)
      const expectedSecret = process.env.ADMIN_SECRET || 'restaurant-admin-2025'
      if (adminSecret !== expectedSecret) {
        return reply.status(403).send({
          success: false,
          message: 'Invalid admin secret'
        })
      }

      if (!name || !cellphone) {
        return reply.status(400).send({
          success: false,
          message: 'Name and cellphone are required'
        })
      }

      const adminUser = await userService.createAdminUser(name, cellphone)

      if (!adminUser) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to create admin user'
        })
      }

      return reply.status(201).send({
        success: true,
        user: adminUser,
        message: 'Admin user created successfully'
      })
    } catch (error) {
      console.error('Create admin route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })
}
