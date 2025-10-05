import dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { database } from './config/database'
import { authRoutes } from './routes/authRoutes'
import { userRoutes } from './routes/userRoutes'
import { adminRoutes } from './routes/adminRoutes'
import { MigrationManager, migrations } from './migrations'

// Load environment variables from .env file
dotenv.config()

const fastify = Fastify({
  logger: true,
  disableRequestLogging: false
})

async function startServer() {
  try {
    await fastify.register(cors, {
      origin: ['http://localhost:8100', 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Type'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    })

    await database.connect()

    const migrationManager = new MigrationManager(database.getDatabase())
    await migrationManager.runMigrations(migrations)

    // Health check endpoint
    fastify.get('/health', async () => {
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: database.isConnected() ? 'connected' : 'disconnected'
      }
    })

    // API Info endpoint
    fastify.get('/api', async () => {
      return {
        name: 'Restaurant API',
        version: '1.0.0',
        description: 'Fastify API for restaurant management system',
        endpoints: {
          auth: {
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile/:userId',
            createAdmin: 'POST /api/auth/create-admin'
          },
          user: {
            products: 'GET /api/products',
            productById: 'GET /api/products/:productId',
            addToCart: 'POST /api/cart/add',
            removeFromCart: 'DELETE /api/cart/remove/:userId/:productId',
            getCart: 'GET /api/cart/:userId',
            clearCart: 'DELETE /api/cart/clear/:userId',
            createOrder: 'POST /api/orders/create',
            getUserOrders: 'GET /api/orders/user/:userId'
          },
          admin: {
            createProduct: 'POST /api/admin/:adminUserId/products',
            updateProduct: 'PUT /api/admin/:adminUserId/products/:productId',
            deleteProduct: 'DELETE /api/admin/:adminUserId/products/:productId',
            getAllOrders: 'GET /api/admin/:adminUserId/orders',
            getOrderById: 'GET /api/admin/:adminUserId/orders/:orderId',
            updateOrderStatus: 'PATCH /api/admin/:adminUserId/orders/:orderId/status',
            dashboard: 'GET /api/admin/:adminUserId/dashboard'
          }
        }
      }
    })

    await fastify.register(authRoutes)
    await fastify.register(userRoutes)
    await fastify.register(adminRoutes)

    fastify.setErrorHandler((error, _, reply) => {
      console.error('Global error:', error)

      if (error.validation) {
        return reply.status(400).send({
          success: false,
          message: 'Validation error',
          errors: error.validation
        })
      }

      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    })

    fastify.setNotFoundHandler((request, reply) => {
      return reply.status(404).send({
        success: false,
        message: `Route ${request.method} ${request.url} not found`
      })
    })

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    const host = process.env.HOST || '0.0.0.0'

    await fastify.listen({ port, host })
    console.log(`Server running at http://${host}:${port}`)
    console.log(`API documentation available at http://${host}:${port}/api`)
    console.log(`Health check available at http://${host}:${port}/health`)

  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  await database.disconnect()
  await fastify.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...')
  await database.disconnect()
  await fastify.close()
  process.exit(0)
})

// Start the server
startServer()
