import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AddToCartRequest, BuyProductsRequest, ProductFilters } from '../types'
import { productService } from '../services/productService'
import { cartService } from '../services/cartService'
import { orderService } from '../services/orderService'

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: ProductFilters }>('/api/products', async (request: FastifyRequest<{ Querystring: ProductFilters }>, reply: FastifyReply) => {
    try {
      const filters = request.query
      const products = await productService.getProducts(filters)

      return reply.status(200).send({
        success: true,
        products
      })
    } catch (error) {
      console.error('Get products route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.get('/api/products/:productId', async (request: FastifyRequest<{ Params: { productId: string } }>, reply: FastifyReply) => {
    try {
      const { productId } = request.params

      const product = await productService.getProductById(productId)

      if (!product) {
        return reply.status(404).send({
          success: false,
          message: 'Product not found'
        })
      }

      return reply.status(200).send({
        success: true,
        product
      })
    } catch (error) {
      console.error('Get product route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.post<{ Body: AddToCartRequest }>('/api/cart/add', async (request: FastifyRequest<{ Body: AddToCartRequest }>, reply: FastifyReply) => {
    try {
      const { userId, productId, quantity } = request.body

      if (!userId || !productId || !quantity || quantity <= 0) {
        return reply.status(400).send({
          success: false,
          message: 'Valid userId, productId, and quantity are required'
        })
      }

      const cart = await cartService.addToCart(userId, productId, quantity)

      if (!cart) {
        return reply.status(400).send({
          success: false,
          message: 'Failed to add product to cart. Product may not exist or be unavailable.'
        })
      }

      return reply.status(200).send({
        success: true,
        cart,
        message: 'Product added to cart successfully'
      })
    } catch (error) {
      console.error('Add to cart route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.delete('/api/cart/remove/:userId/:productId', async (request: FastifyRequest<{ Params: { userId: string productId: string } }>, reply: FastifyReply) => {
    try {
      const { userId, productId } = request.params

      const cart = await cartService.removeFromCart(userId, productId)

      if (!cart) {
        return reply.status(400).send({
          success: false,
          message: 'Failed to remove product from cart'
        })
      }

      return reply.status(200).send({
        success: true,
        cart,
        message: 'Product removed from cart successfully'
      })
    } catch (error) {
      console.error('Remove from cart route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.get('/api/cart/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params

      const cart = await cartService.getCart(userId)

      if (!cart) {
        return reply.status(404).send({
          success: false,
          message: 'Cart not found'
        })
      }

      return reply.status(200).send({
        success: true,
        cart
      })
    } catch (error) {
      console.error('Get cart route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.post<{ Body: BuyProductsRequest }>('/api/orders/create', async (request: FastifyRequest<{ Body: BuyProductsRequest }>, reply: FastifyReply) => {
    try {
      const { userId, notes } = request.body

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: 'User ID is required'
        })
      }

      const order = await orderService.createOrderFromCart(userId, notes)

      if (!order) {
        return reply.status(400).send({
          success: false,
          message: 'Failed to create order. Cart may be empty or user not found.'
        })
      }

      return reply.status(201).send({
        success: true,
        order,
        message: 'Order created successfully'
      })
    } catch (error) {
      console.error('Create order route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.get('/api/orders/user/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params

      const orders = await orderService.getUserOrders(userId)

      return reply.status(200).send({
        success: true,
        orders
      })
    } catch (error) {
      console.error('Get user orders route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })

  fastify.delete('/api/cart/clear/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    try {
      const { userId } = request.params

      const success = await cartService.clearCart(userId)

      if (!success) {
        return reply.status(400).send({
          success: false,
          message: 'Failed to clear cart'
        })
      }

      return reply.status(200).send({
        success: true,
        message: 'Cart cleared successfully'
      })
    } catch (error) {
      console.error('Clear cart route error:', error)
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      })
    }
  })
}
