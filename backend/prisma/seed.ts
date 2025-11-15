import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hotspot.com' },
    update: {},
    create: {
      email: 'admin@hotspot.com',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Demo Client User
  const clientPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cafewifi.com' },
    update: {},
    create: {
      email: 'demo@cafewifi.com',
      password: clientPassword,
      name: 'Demo User',
      role: 'CLIENT',
    },
  });
  console.log('✅ Demo client user created:', demoUser.email);

  // Create Demo Client (Business)
  const mikrotikPassword = await bcrypt.hash('mikrotik123', 10);
  const demoClient = await prisma.client.upsert({
    where: { slug: 'cafe-demo' },
    update: {},
    create: {
      userId: demoUser.id,
      businessName: 'Café WiFi Demo',
      slug: 'cafe-demo',
      logo: null,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      isActive: true,
      mikrotikSettings: {
        create: {
          host: '192.168.1.1',
          port: 8728,
          username: 'apiuser',
          password: mikrotikPassword,
          useSsl: false,
          timeout: 5000,
        },
      },
    },
  });
  console.log('✅ Demo client created:', demoClient.businessName);

  // Create Hotspot Profiles
  const profile1h = await prisma.hotspotProfile.create({
    data: {
      clientId: demoClient.id,
      name: '1 Hora',
      description: 'Acceso WiFi por 1 hora a velocidad media',
      mikrotikProfile: '1-hora',
      price: 2000, // $20.00 MXN
      currency: 'MXN',
      duration: 3600, // 1 hour in seconds
      dataLimit: BigInt(1073741824), // 1 GB
      speedLimit: '2M/2M',
      isActive: true,
    },
  });
  console.log('✅ Profile created:', profile1h.name);

  const profile1d = await prisma.hotspotProfile.create({
    data: {
      clientId: demoClient.id,
      name: '1 Día',
      description: 'Acceso WiFi por 24 horas a alta velocidad',
      mikrotikProfile: '1-dia',
      price: 5000, // $50.00 MXN
      currency: 'MXN',
      duration: 86400, // 24 hours
      dataLimit: BigInt(5368709120), // 5 GB
      speedLimit: '5M/5M',
      isActive: true,
    },
  });
  console.log('✅ Profile created:', profile1d.name);

  const profile1w = await prisma.hotspotProfile.create({
    data: {
      clientId: demoClient.id,
      name: '1 Semana',
      description: 'Acceso WiFi por 7 días sin límite de velocidad',
      mikrotikProfile: '1-semana',
      price: 15000, // $150.00 MXN
      currency: 'MXN',
      duration: 604800, // 7 days
      dataLimit: BigInt(21474836480), // 20 GB
      speedLimit: '10M/10M',
      isActive: true,
    },
  });
  console.log('✅ Profile created:', profile1w.name);

  // Create another demo client
  const client2User = await prisma.user.upsert({
    where: { email: 'owner@restaurant.com' },
    update: {},
    create: {
      email: 'owner@restaurant.com',
      password: await bcrypt.hash('restaurant123', 10),
      name: 'Restaurant Owner',
      role: 'CLIENT',
    },
  });

  const restaurant = await prisma.client.upsert({
    where: { slug: 'restaurant-wifi' },
    update: {},
    create: {
      userId: client2User.id,
      businessName: 'Restaurant WiFi',
      slug: 'restaurant-wifi',
      logo: null,
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      isActive: true,
      mikrotikSettings: {
        create: {
          host: '192.168.2.1',
          port: 8728,
          username: 'apiuser',
          password: await bcrypt.hash('restaurant123', 10),
          useSsl: false,
          timeout: 5000,
        },
      },
    },
  });
  console.log('✅ Restaurant client created:', restaurant.businessName);

  const restaurantProfile = await prisma.hotspotProfile.create({
    data: {
      clientId: restaurant.id,
      name: '30 Minutos',
      description: 'Acceso WiFi por 30 minutos para clientes',
      mikrotikProfile: '30-min',
      price: 1000, // $10.00 MXN
      currency: 'MXN',
      duration: 1800, // 30 minutes
      dataLimit: BigInt(536870912), // 512 MB
      speedLimit: '3M/3M',
      isActive: true,
    },
  });
  console.log('✅ Restaurant profile created:', restaurantProfile.name);

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📝 Demo Credentials:');
  console.log('-------------------');
  console.log('Admin:');
  console.log('  Email: admin@hotspot.com');
  console.log('  Password: admin123');
  console.log('\nDemo Client (Café WiFi):');
  console.log('  Email: demo@cafewifi.com');
  console.log('  Password: demo123');
  console.log('  Portal: http://localhost:3000/hotspot/cafe-demo');
  console.log('\nRestaurant Client:');
  console.log('  Email: owner@restaurant.com');
  console.log('  Password: restaurant123');
  console.log('  Portal: http://localhost:3000/hotspot/restaurant-wifi');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
