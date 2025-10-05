import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  cellphone: string
  type: 'default' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  available: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  productId: ObjectId
  name: string
  price: number
  quantity: number
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  totalAmount: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  _id?: ObjectId
  userId: ObjectId
  userName: string
  userCellphone: string
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Request/Response Types
export interface LoginRequest {
  name: string
  cellphone: string
}

export interface LoginResponse {
  user: User
  success: boolean
  message: string
}

export interface AddToCartRequest {
  userId: string
  productId: string
  quantity: number
}

export interface BuyProductsRequest {
  userId: string
  notes?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  category?: string
  imageUrl?: string
  available?: boolean
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  available?: boolean
  search?: string
}

export interface UpdateOrderStatusRequest {
  status: 'accepted' | 'declined' | 'completed'
}
