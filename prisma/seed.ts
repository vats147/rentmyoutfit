import { db } from '../src/lib/db';

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await db.listingImage.deleteMany();
  await db.listing.deleteMany();
  await db.address.deleteMany();
  await db.wallet.deleteMany();
  await db.user.deleteMany();
  await db.adminConfig.deleteMany();
  await db.featureFlag.deleteMany();

  console.log('Cleared existing data');

  // Create users
  const users = await Promise.all([
    db.user.create({
      data: {
        id: 'user-1',
        phone: '+919876543210',
        email: 'priya.sharma@email.com',
        displayName: 'Priya Sharma',
        username: 'priya_styles',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        gender: 'female',
        role: 'both',
        kycStatus: 'verified',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'PRIYA100',
        wallet: {
          create: { balance: 2500 }
        },
        address: {
          create: {
            line1: '302, Sunrise Apartment',
            line2: 'Ring Road',
            city: 'Surat',
            state: 'Gujarat',
            pincode: '395009',
            lat: 21.1702,
            lng: 72.8311,
            verified: true
          }
        }
      }
    }),
    db.user.create({
      data: {
        id: 'user-2',
        phone: '+918765432109',
        email: 'raj.malhotra@email.com',
        displayName: 'Raj Malhotra',
        username: 'raj_collections',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj',
        gender: 'male',
        role: 'seller',
        kycStatus: 'verified',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'RAJ200',
        wallet: {
          create: { balance: 1800 }
        },
        address: {
          create: {
            line1: '45, Nehru Nagar',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400024',
            lat: 19.0760,
            lng: 72.8777,
            verified: true
          }
        }
      }
    }),
    db.user.create({
      data: {
        id: 'user-3',
        phone: '+917654321098',
        email: 'anjali.patel@email.com',
        displayName: 'Anjali Patel',
        username: 'anjali_ethnic',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
        gender: 'female',
        role: 'both',
        kycStatus: 'verified',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'ANJALI50',
        wallet: {
          create: { balance: 950 }
        },
        address: {
          create: {
            line1: '78, Paldi Society',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380007',
            lat: 23.0225,
            lng: 72.5714,
            verified: true
          }
        }
      }
    }),
    db.user.create({
      data: {
        id: 'user-4',
        phone: '+916543210987',
        email: 'vikram.singh@email.com',
        displayName: 'Vikram Singh',
        username: 'vikram_formals',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        gender: 'male',
        role: 'seller',
        kycStatus: 'pending',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'VIKRAM75',
        wallet: {
          create: { balance: 3200 }
        },
        address: {
          create: {
            line1: '12, Sector 15',
            city: 'Gandhinagar',
            state: 'Gujarat',
            pincode: '382016',
            lat: 23.2156,
            lng: 72.6369,
            verified: false
          }
        }
      }
    }),
    db.user.create({
      data: {
        id: 'user-5',
        phone: '+915432109876',
        email: 'meera.gupta@email.com',
        displayName: 'Meera Gupta',
        username: 'meera_sarees',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera',
        gender: 'female',
        role: 'seller',
        kycStatus: 'verified',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'MEERA150',
        wallet: {
          create: { balance: 4200 }
        },
        address: {
          create: {
            line1: '56, CG Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380009',
            lat: 23.0307,
            lng: 72.5584,
            verified: true
          }
        }
      }
    }),
    db.user.create({
      data: {
        id: 'user-6',
        phone: '+919123456789',
        email: 'krina.desai@email.com',
        displayName: 'Krina Desai',
        username: 'krina_garba',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Krina',
        gender: 'female',
        role: 'both',
        kycStatus: 'verified',
        isBanned: false,
        isHoldSelling: false,
        referralCode: 'KRINA200',
        wallet: {
          create: { balance: 5600 }
        },
        address: {
          create: {
            line1: '89, Navrangpura',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380009',
            lat: 23.0355,
            lng: 72.5647,
            verified: true
          }
        }
      }
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create listings with placeholder images
  const listings = await Promise.all([
    db.listing.create({
      data: {
        id: 'listing-1',
        sellerId: 'user-1',
        title: 'Bridal Red Lehenga Choli',
        description: 'Stunning bridal lehenga with heavy embroidery and zardozi work. Perfect for wedding ceremonies. Worn only once, in excellent condition. Comes with matching dupatta and blouse.',
        category: 'lehenga_choli',
        gender: 'women',
        eventTags: 'marriage,engagement',
        customTags: 'bridal,zardozi,embroidery,red',
        size: 'M',
        measurements: '{"waist": 32, "chest": 36, "length": 42}',
        color: 'Red',
        fabric: 'Silk',
        condition: 'like_new',
        pricePerDay: 1500,
        pricePerWeek: 9000,
        deposit: 5000,
        deliveryType: 'both',
        serviceRadius: 10,
        deliveryCharge: 100,
        status: 'active',
        lat: 21.1702,
        lng: 72.8311,
        viewCount: 234,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1583391733958-d25e07fac0ec?auto=format&fit=crop&w=800&q=80', order: 0 },
            { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', order: 1 },
            { url: 'https://images.unsplash.com/photo-1615886753510-62024daaf16e?auto=format&fit=crop&w=800&q=80', order: 2 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-2',
        sellerId: 'user-2',
        title: 'Designer Sherwani Set',
        description: 'Elegant cream sherwani with matching stole and mojari. Ideal for grooms and wedding guests. Perfect for sangeet and reception. Royal look guaranteed.',
        category: 'sherwani',
        gender: 'men',
        eventTags: 'marriage,engagement,sangeet',
        customTags: 'designer,traditional,cream',
        size: 'L',
        measurements: '{"chest": 42, "length": 44, "shoulder": 18}',
        color: 'Cream',
        fabric: 'Brocade',
        condition: 'good',
        pricePerDay: 1200,
        pricePerWeek: 7000,
        deposit: 4000,
        deliveryType: 'pickup',
        status: 'active',
        lat: 19.0760,
        lng: 72.8777,
        viewCount: 156,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&w=800&q=80', order: 0 },
            { url: 'https://images.unsplash.com/photo-1621517596131-ab7bc54247cc?auto=format&fit=crop&w=800&q=80', order: 1 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-3',
        sellerId: 'user-3',
        title: 'Pink Anarkali Suit',
        description: 'Beautiful pink anarkali with delicate mirror work. Great for sangeet and mehndi functions. Floor-length with flare. Comfortable for long events.',
        category: 'anarkali',
        gender: 'women',
        eventTags: 'sangeet,mehndi,festival',
        customTags: 'handicraft,mirror work,pink',
        size: 'S',
        measurements: '{"bust": 34, "waist": 28, "length": 56}',
        color: 'Pink',
        fabric: 'Georgette',
        condition: 'like_new',
        pricePerDay: 800,
        pricePerWeek: 4800,
        deposit: 2500,
        deliveryType: 'delivery',
        serviceRadius: 15,
        deliveryCharge: 75,
        status: 'active',
        lat: 23.0225,
        lng: 72.5714,
        viewCount: 89,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', order: 0 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-4',
        sellerId: 'user-4',
        title: 'Royal Blue Bandhgala',
        description: 'Classic navy bandhgala suit with gold buttons. Perfect for formal events and weddings. Well-maintained and clean.',
        category: 'bandhgala',
        gender: 'men',
        eventTags: 'marriage,corporate,engagement',
        customTags: 'designer,silk,formal',
        size: 'M',
        measurements: '{"chest": 40, "length": 32, "sleeve": 24}',
        color: 'Navy Blue',
        fabric: 'Silk Blend',
        condition: 'good',
        pricePerDay: 1000,
        pricePerWeek: 6000,
        deposit: 3500,
        deliveryType: 'both',
        serviceRadius: 8,
        deliveryCharge: 50,
        status: 'active',
        lat: 23.2156,
        lng: 72.6369,
        viewCount: 67,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1550614000-4b95d466f58f?auto=format&fit=crop&w=800&q=80', order: 0 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-5',
        sellerId: 'user-5',
        title: 'Banarasi Silk Saree',
        description: 'Authentic Banarasi silk saree with traditional motifs. A timeless piece for special occasions. Includes blouse piece.',
        category: 'saree',
        gender: 'women',
        eventTags: 'marriage,festival,engagement',
        customTags: 'silk,handwoven,traditional,banarasi',
        size: 'Free',
        color: 'Maroon',
        fabric: 'Silk',
        condition: 'like_new',
        pricePerDay: 600,
        pricePerWeek: 3500,
        deposit: 2000,
        deliveryType: 'pickup',
        status: 'active',
        lat: 23.0307,
        lng: 72.5584,
        viewCount: 145,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1589810635657-232e49e56722?auto=format&fit=crop&w=800&q=80', order: 0 },
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', order: 1 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-6',
        sellerId: 'user-6',
        title: 'Garba Chaniya Choli',
        description: 'Vibrant Navratri special chaniya choli with mirror work. Perfect for garba nights. Colorful and comfortable for dancing.',
        category: 'lehenga_choli',
        gender: 'women',
        eventTags: 'carnival,festival',
        customTags: 'mirror work,handicraft,colorful',
        size: 'M',
        measurements: '{"waist": 30, "bust": 34, "length": 38}',
        color: 'Multi',
        fabric: 'Cotton',
        condition: 'good',
        pricePerDay: 500,
        pricePerWeek: 3000,
        deposit: 1500,
        deliveryType: 'both',
        serviceRadius: 12,
        deliveryCharge: 60,
        status: 'active',
        lat: 23.0355,
        lng: 72.5647,
        viewCount: 312,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1629824681329-371589e4c3fa?auto=format&fit=crop&w=800&q=80', order: 0 },
            { url: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=800&q=80', order: 1 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-7',
        sellerId: 'user-1',
        title: 'Green Embroidered Kurti Set',
        description: 'Beautiful green kurti with palazzo set. Perfect for casual events and small gatherings. Comfortable cotton fabric.',
        category: 'kurti_set',
        gender: 'women',
        eventTags: 'casual,festival',
        customTags: 'cotton,embroidered,casual',
        size: 'L',
        color: 'Green',
        fabric: 'Cotton',
        condition: 'good',
        pricePerDay: 350,
        pricePerWeek: 2000,
        deposit: 1000,
        deliveryType: 'pickup',
        status: 'active',
        lat: 21.1702,
        lng: 72.8311,
        viewCount: 78,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', order: 0 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-8',
        sellerId: 'user-2',
        title: 'Kurta Pajama Set',
        description: 'Classic white kurta pajama for men. Perfect for casual events and home functions. Simple yet elegant.',
        category: 'kurta_pajama',
        gender: 'men',
        eventTags: 'festival,casual',
        customTags: 'cotton,simple,classic',
        size: 'XL',
        color: 'White',
        fabric: 'Cotton',
        condition: 'good',
        pricePerDay: 300,
        pricePerWeek: 1800,
        deposit: 800,
        deliveryType: 'pickup',
        status: 'active',
        lat: 19.0760,
        lng: 72.8777,
        viewCount: 45,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?auto=format&fit=crop&w=800&q=80', order: 0 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-9',
        sellerId: 'user-5',
        title: 'Purple Designer Gown',
        description: 'Elegant purple gown with sequin work. Perfect for cocktail parties and evening events. Floor-length with slit.',
        category: 'gown',
        gender: 'women',
        eventTags: 'marriage,engagement',
        customTags: 'designer,sequin,evening',
        size: 'S',
        measurements: '{"bust": 32, "waist": 26, "hip": 36, "length": 60}',
        color: 'Purple',
        fabric: 'Chiffon',
        condition: 'like_new',
        pricePerDay: 1800,
        pricePerWeek: 10000,
        deposit: 6000,
        deliveryType: 'both',
        serviceRadius: 10,
        deliveryCharge: 100,
        status: 'active',
        lat: 23.0307,
        lng: 72.5584,
        viewCount: 198,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', order: 0 },
            { url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80', order: 1 },
          ]
        }
      }
    }),
    db.listing.create({
      data: {
        id: 'listing-10',
        sellerId: 'user-3',
        title: 'Yellow Sharara Set',
        description: 'Trendy yellow sharara with mirror work. Perfect for haldi and mehndi functions. Bright and cheerful.',
        category: 'sharara',
        gender: 'women',
        eventTags: 'mehndi,festival',
        customTags: 'mirror work,yellow,trendy',
        size: 'M',
        color: 'Yellow',
        fabric: 'Georgette',
        condition: 'like_new',
        pricePerDay: 700,
        pricePerWeek: 4000,
        deposit: 2000,
        deliveryType: 'both',
        serviceRadius: 15,
        deliveryCharge: 75,
        status: 'active',
        lat: 23.0225,
        lng: 72.5714,
        viewCount: 123,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1583391733958-d25e07fac0ec?auto=format&fit=crop&w=800&q=80', order: 0 },
          ]
        }
      }
    }),
  ]);

  console.log(`Created ${listings.length} listings`);

  // Create admin config
  await db.adminConfig.createMany({
    data: [
      { key: 'platform_fee_percent', value: '5', dataType: 'number' },
      { key: 'min_deposit', value: '500', dataType: 'number' },
      { key: 'deposit_release_hours', value: '24', dataType: 'number' },
      { key: 'max_search_radius', value: '50', dataType: 'number' },
      { key: 'default_search_radius', value: '10', dataType: 'number' },
      { key: 'referral_enabled', value: 'true', dataType: 'boolean' },
      { key: 'referral_discount_percent', value: '10', dataType: 'number' },
      { key: 'referral_credit_amount', value: '200', dataType: 'number' },
      { key: 'ar_tryon_enabled', value: 'false', dataType: 'boolean' },
      { key: 'max_images_per_listing', value: '10', dataType: 'number' },
      { key: 'otp_expiry_minutes', value: '10', dataType: 'number' },
    ]
  });

  console.log('Created admin config');

  // Create feature flags
  await db.featureFlag.createMany({
    data: [
      { key: 'ar_tryon', enabled: false, description: 'Virtual try-on feature' },
      { key: 'map_view', enabled: true, description: 'Map view for Near Me' },
      { key: 'video_reviews', enabled: true, description: 'Video reviews feature' },
      { key: 'instant_payout', enabled: false, description: 'Instant payout for sellers' },
    ]
  });

  console.log('Created feature flags');

  console.log('\n--- Seed completed successfully! ---');
  console.log(`Users: ${users.length}`);
  console.log(`Listings: ${listings.length}`);
  console.log('\nAdmin credentials:');
  console.log('Email: admin@shahidra.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
