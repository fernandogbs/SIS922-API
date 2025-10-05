import { database } from './config/database';
import { productService } from './services/productService';
import { userService } from './services/userService';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    await database.connect();

    const sampleProducts = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        category: 'Pizza',
        imageUrl: 'https://example.com/margherita.jpg',
        available: true
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo',
        price: 10.99,
        category: 'Burgers',
        imageUrl: 'https://example.com/chicken-burger.jpg',
        available: true
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
        price: 8.99,
        category: 'Salads',
        imageUrl: 'https://example.com/caesar-salad.jpg',
        available: true
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 6.99,
        category: 'Desserts',
        imageUrl: 'https://example.com/chocolate-cake.jpg',
        available: true
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Spaghetti with eggs, cheese, pancetta, and black pepper',
        price: 14.99,
        category: 'Pasta',
        imageUrl: 'https://example.com/carbonara.jpg',
        available: true
      },
      {
        name: 'Fish Tacos',
        description: 'Grilled fish with cabbage, pico de gallo, and lime crema',
        price: 11.99,
        category: 'Mexican',
        imageUrl: 'https://example.com/fish-tacos.jpg',
        available: true
      }
    ];

    // Add products
    for (const product of sampleProducts) {
      const created = await productService.createProduct(product);
      if (created) {
        console.log(`Created product: ${product.name}`);
      }
    }

    // Create an admin user
    const adminUser = await userService.createAdminUser('admin', '+1234567890');
    if (adminUser) {
      console.log(`Created admin user: ${adminUser.name} (ID: ${adminUser._id})`);
      console.log(`Admin can be used to manage products and orders`);
    }

    // Create a test user
    const testUserResult = await userService.login({
      name: 'john doe',
      cellphone: '+1987654321'
    });

    if (testUserResult.success) {
      console.log(`Created test user: ${testUserResult.user.name} (ID: ${testUserResult.user._id})`);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the server with: yarn dev');
    console.log('2. Test the API endpoints');
    console.log('3. Use the admin user to manage products');
    console.log('4. Use the test user to place orders');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
}

seedDatabase();
