import { Db } from 'mongodb'
import { Migration } from '../MigrationManager'

export const seedInitialDataMigration: Migration = {
  id: '005',
  name: 'Seed initial restaurant data',

  async up(db: Db): Promise<void> {
    // Create admin user
    const usersCollection = db.collection('users')
    const adminUser = {
      name: 'admin',
      cellphone: '+1234567890',
      type: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await usersCollection.insertOne(adminUser)
    console.log('Created admin user')

    // Create sample test user
    const testUser = {
      name: 'john doe',
      cellphone: '+1987654321',
      type: 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await usersCollection.insertOne(testUser)
    console.log('Created test user')

    // Seed restaurant products
    const restaurantCollection = db.collection('restaurant')
    const sampleProducts = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5b6e5d99a?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni pizza with mozzarella cheese',
        price: 14.99,
        category: 'Pizza',
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo on brioche bun',
        price: 10.99,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Beef Burger',
        description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
        price: 12.99,
        category: 'Burgers',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: 8.99,
        category: 'Salads',
        imageUrl: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Greek Salad',
        description: 'Mixed greens with tomatoes, cucumbers, olives, and feta cheese',
        price: 9.99,
        category: 'Salads',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 6.99,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers',
        price: 7.99,
        category: 'Desserts',
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Spaghetti with eggs, cheese, pancetta, and black pepper',
        price: 14.99,
        category: 'Pasta',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Penne Arrabbiata',
        description: 'Penne pasta with spicy tomato sauce and garlic',
        price: 12.99,
        category: 'Pasta',
        imageUrl: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fish Tacos',
        description: 'Grilled fish with cabbage, pico de gallo, and lime crema',
        price: 11.99,
        category: 'Mexican',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chicken Quesadilla',
        description: 'Grilled chicken with cheese in crispy tortilla, served with salsa',
        price: 9.99,
        category: 'Mexican',
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee served over ice',
        price: 3.99,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Craft Beer',
        description: 'Local craft beer selection',
        price: 5.99,
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    await restaurantCollection.insertMany(sampleProducts)
    console.log(`Seeded ${sampleProducts.length} products to restaurant collection`)
  },

  async down(db: Db): Promise<void> {
    // Remove seeded data
    await db.collection('users').deleteMany({
      cellphone: { $in: ['+1234567890', '+1987654321'] }
    })

    await db.collection('restaurant').deleteMany({
      name: {
        $in: [
          'Margherita Pizza', 'Pepperoni Pizza', 'Chicken Burger', 'Beef Burger',
          'Caesar Salad', 'Greek Salad', 'Chocolate Cake', 'Tiramisu',
          'Spaghetti Carbonara', 'Penne Arrabbiata', 'Fish Tacos',
          'Chicken Quesadilla', 'Iced Coffee', 'Fresh Orange Juice', 'Craft Beer'
        ]
      }
    })

    console.log('✅ Removed seeded data')
  }
}
