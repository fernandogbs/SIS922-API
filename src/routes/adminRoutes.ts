import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UpdateProductRequest, UpdateOrderStatusRequest, Product } from '../types'
import { productService } from '../services/productService'
import { orderService } from '../services/orderService'
import { userService } from '../services/userService'

// Middleware to check if user is admin
async function checkAdminAuth(request: FastifyRequest<{ Params: { adminUserId: string } }>, reply: FastifyReply) {
  const { adminUserId } = request.params

  if (!adminUserId) {
    return reply.status(401).send({
      success: false,
      message: 'Admin user ID is required'
    })
  }

  const isAdmin = await userService.isAdmin(adminUserId)

  if (!isAdmin) {
    return reply.status(403).send({
      success: false,
      message: 'Access denied. Admin privileges required.'
    })
  }
}

export async function adminRoutes(fastify: FastifyInstance) {
  // Create new product
  fastify.post<{
    Params: { adminUserId: string }
    Body: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
  }>('/api/admin/:adminUserId/products', async (request: FastifyRequest<{
    Params: { adminUserId: string }
    Body: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { name, description, price, category, imageUrl, available } = request.body

      if (!name || !description || price === undefined || !category) {
        return reply.status(400).send({
          success: false,
          message: 'Name, description, price, and category are required'
        })
      }

      const product = await productService.createProduct({
        name,
        description,
        price,
        category,
        imageUrl: imageUrl || '',
        available: available !== undefined ? available : true
      })

      if (!product) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to create product'
        })
      }

      return reply.status(201).send({
        success: true,
        product,
        message: 'Product created successfully'
      })
    } catch (error) {
      console.error('Create product route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Update existing product
  fastify.put<{
    Params: { adminUserId: string productId: string }
    Body: UpdateProductRequest
  }>('/api/admin/:adminUserId/products/:productId', async (request: FastifyRequest<{
    Params: { adminUserId: string productId: string }
    Body: UpdateProductRequest
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { productId } = request.params
      const updateData = request.body

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'At least one field must be provided for update'
        })
      }

      const product = await productService.updateProduct(productId, updateData)

      if (!product) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found or update failed'
        })
      }

      return reply.status(200).send({
        success: true,
        product,
        message: 'Product updated successfully'
      })
    } catch (error) {
      console.error('Update product route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Delete product
  fastify.delete<{
    Params: { adminUserId: string productId: string }
  }>('/api/admin/:adminUserId/products/:productId', async (request: FastifyRequest<{
    Params: { adminUserId: string productId: string }
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { productId } = request.params

      const deleted = await productService.deleteProduct(productId)

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found or delete failed'
        })
      }

      return reply.status(200).send({
        success: true,
        message: 'Product deleted successfully'
      })
    } catch (error) {
      console.error('Delete product route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Get all orders (admin view)
  fastify.get<{
    Params: { adminUserId: string }
    Querystring: { status?: string }
  }>('/api/admin/:adminUserId/orders', async (request: FastifyRequest<{
    Params: { adminUserId: string }
    Querystring: { status?: string }
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { status } = request.query

      let orders
      if (status && ['pending', 'accepted', 'declined', 'completed'].includes(status)) {
        orders = await orderService.getOrdersByStatus(status as any)
      } else {
        orders = await orderService.getAllOrders()
      }

      return reply.status(200).send({
        success: true,
        orders
      })
    } catch (error) {
      console.error('Get all orders route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Update order status (accept/decline)
  fastify.patch<{
    Params: { adminUserId: string orderId: string }
    Body: UpdateOrderStatusRequest
  }>('/api/admin/:adminUserId/orders/:orderId/status', async (request: FastifyRequest<{
    Params: { adminUserId: string orderId: string }
    Body: UpdateOrderStatusRequest
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { orderId } = request.params
      const { status } = request.body

      if (!status || !['accepted', 'declined', 'completed'].includes(status)) {
        return reply.status(400).send({
          success: false,
          message: 'Valid status is required (accepted, declined, completed)'
        })
      }

      const order = await orderService.updateOrderStatus(orderId, status)

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found or update failed'
        })
      }

      return reply.status(200).send({
        success: true,
        order,
        message: `Order ${status} successfully`
      })
    } catch (error) {
      console.error('Update order status route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Get specific order details
  fastify.get<{
    Params: { adminUserId: string orderId: string }
  }>('/api/admin/:adminUserId/orders/:orderId', async (request: FastifyRequest<{
    Params: { adminUserId: string orderId: string }
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const { orderId } = request.params

      const order = await orderService.getOrderById(orderId)

      if (!order) {
        return reply.status(404).send({
          success: false,
          message: 'Order not found'
        })
      }

      return reply.status(200).send({
        success: true,
        order
      })
    } catch (error) {
      console.error('Get order route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  // Get admin dashboard stats
  fastify.get<{
    Params: { adminUserId: string }
  }>('/api/admin/:adminUserId/dashboard', async (request: FastifyRequest<{
    Params: { adminUserId: string }
  }>, reply: FastifyReply) => {
    try {
      await checkAdminAuth(request, reply)

      const [allOrders, pendingOrders, products] = await Promise.all([
        orderService.getAllOrders(),
        orderService.getOrdersByStatus('pending'),
        productService.getProducts()
      ])

      const totalRevenue = allOrders
        .filter(order => order.status === 'completed')
        .reduce((total, order) => total + order.totalAmount, 0)

      const stats = {
        totalOrders: allOrders.length,
        pendingOrders: pendingOrders.length,
        completedOrders: allOrders.filter(order => order.status === 'completed').length,
        totalProducts: products.length,
        availableProducts: products.filter(product => product.available).length,
        totalRevenue
      }

      return reply.status(200).send({
        success: true,
        stats,
        recentOrders: allOrders.slice(0, 10) // Last 10 orders
      })
    } catch (error) {
      console.error('Get dashboard route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })
}
