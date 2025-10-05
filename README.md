# Restaurant API
## Features

### User System
- **Basic Authentication**: Login with name and cellphone (no JWT)
- **Two User Types**: Default users and Admin users
- **Auto Registration**: New users are automatically created during login

### User Functionality
- 🛒 **Add Products to Cart**: Add items with quantity
- 🛍️ **Purchase Products**: Convert cart to order
- 🔍 **Filter Products**: Search by category, price range, name
- 📋 **View Orders**: See order history

### Admin Functionality
- ✏️ **Manage Products**: Create, update, delete products
- 📊 **View All Orders**: Monitor all customer orders
- ✅ **Order Management**: Accept, decline, or mark orders as completed
- 📈 **Dashboard**: View statistics and metrics

## Prerequisites

- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Yarn package manager

## Installation

1. **Install dependencies**:
   ```bash
   cd api
   yarn install
   ```

2. **Setup MongoDB Atlas** (recommended):
   - Follow the detailed guide in [ATLAS_SETUP.md](./ATLAS_SETUP.md)
   - Or use local MongoDB if preferred

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=unex
   ```4. **Run database migrations**:
   ```bash
   yarn migrate run
   ```
   This creates collections, indexes, and populates sample data.

5. **Start the development server**:
   ```bash
   yarn dev
   ```

The API will be available at `http://localhost:3000`

## Database Structure

- **Database Name**: `unex`
- **Collections**:
  - `users` - User accounts
  - `restaurant` - Food products/menu items
  - `carts` - Shopping carts
  - `orders` - Customer orders
  - `migrations` - Migration tracking

## API Endpoints

### 📚 Documentation
- `GET /api` - API information and endpoints
- `GET /health` - Health check

### 🔐 Authentication
- `POST /api/auth/login` - Login or register user
- `GET /api/auth/profile/:userId` - Get user profile
- `POST /api/auth/create-admin` - Create admin user (requires admin secret)

### 🍕 Products (Public)
- `GET /api/products` - Get all products with filters
- `GET /api/products/:productId` - Get product by ID

### 🛒 Cart & Orders (User)
- `POST /api/cart/add` - Add product to cart
- `GET /api/cart/:userId` - Get user's cart
- `DELETE /api/cart/remove/:userId/:productId` - Remove from cart
- `DELETE /api/cart/clear/:userId` - Clear cart
- `POST /api/orders/create` - Create order from cart
- `GET /api/orders/user/:userId` - Get user's orders

### 🔧 Admin Operations
- `POST /api/admin/:adminUserId/products` - Create product
- `PUT /api/admin/:adminUserId/products/:productId` - Update product
- `DELETE /api/admin/:adminUserId/products/:productId` - Delete product
- `GET /api/admin/:adminUserId/orders` - Get all orders
- `GET /api/admin/:adminUserId/orders/:orderId` - Get order details
- `PATCH /api/admin/:adminUserId/orders/:orderId/status` - Update order status
- `GET /api/admin/:adminUserId/dashboard` - Get dashboard stats

## Usage Examples

### 1. Login/Register User
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"name": "john doe", "cellphone": "+1234567890"}'
```

### 2. Get Products with Filters
```bash
# All products
curl http://localhost:3000/api/products

# Filter by category and price
curl "http://localhost:3000/api/products?category=Pizza&minPrice=10&maxPrice=20"

# Search products
curl "http://localhost:3000/api/products?search=chicken"
```

### 3. Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart/add \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "USER_ID", "productId": "PRODUCT_ID", "quantity": 2}'
```

### 4. Create Order
```bash
curl -X POST http://localhost:3000/api/orders/create \\
  -H "Content-Type: application/json" \\
  -d '{"userId": "USER_ID", "notes": "Extra spicy please"}'
```

### 5. Admin: Create Product
```bash
curl -X POST http://localhost:3000/api/admin/ADMIN_USER_ID/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "New Pizza",
    "description": "Delicious new pizza",
    "price": 15.99,
    "category": "Pizza",
    "available": true
  }'
```

### 6. Admin: Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/admin/ADMIN_USER_ID/orders/ORDER_ID/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "accepted"}'
```

## Data Models

### User
```typescript
{
  _id: ObjectId,
  name: string,
  cellphone: string,
  type: 'default' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  category: string,
  imageUrl?: string,
  available: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  userName: string,
  userCellphone: string,
  items: CartItem[],
  totalAmount: number,
  status: 'pending' | 'accepted' | 'declined' | 'completed',
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Available Scripts
- `yarn dev` - Start development server with hot reload
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Start production server
- `yarn migrate run` - Run database migrations
- `yarn migrate status` - Check migration status
- `yarn seed` - Legacy seed script (use migrations instead)
- `yarn clean` - Clean build directory

### Project Structure
```
src/
├── config/
│   └── database.ts          # MongoDB connection
├── routes/
│   ├── authRoutes.ts        # Authentication routes
│   ├── userRoutes.ts        # User/customer routes
│   └── adminRoutes.ts       # Admin routes
├── services/
│   ├── userService.ts       # User management
│   ├── productService.ts    # Product management
│   ├── cartService.ts       # Cart operations
│   └── orderService.ts      # Order management
├── types/
│   └── index.ts             # TypeScript types
├── server.ts                # Main server file
└── seed.ts                  # Database seeding
```

## Environment Variables

```bash
MONGODB_URI=mongodb://localhost:27017
DB_NAME=restaurant_db
PORT=3000
HOST=0.0.0.0
ADMIN_SECRET=restaurant-admin-2025
NODE_ENV=development
```

## Production Deployment

1. **Build the project**:
   ```bash
   yarn build
   ```

2. **Set environment variables** for production

3. **Start the production server**:
   ```bash
   yarn start
   ```

## Error Handling

The API includes comprehensive error handling:
- ✅ Input validation
- ✅ Database error handling
- ✅ Not found (404) responses
- ✅ Unauthorized (403) for admin routes
- ✅ Graceful server shutdown

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
