import { User } from "./models/user.model.js";
import { Vehicle } from "./models/vehicle.model.js";
import { hashPassword } from "./services/auth.service.js";

export async function seedInitialData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminPasswordHash = await hashPassword("Password123!");
    const userPasswordHash = await hashPassword("Password123!");

    await User.create([
      {
        email: "admin@dealership.com",
        passwordHash: adminPasswordHash,
        role: "admin"
      },
      {
        email: "user@dealership.com",
        passwordHash: userPasswordHash,
        role: "user"
      }
    ]);
    console.log("Seeded default users: admin@dealership.com, user@dealership.com (Password: Password123!)");
  }

  const hasIndianModels = await Vehicle.exists({ make: "Maruti Suzuki" });
  if (!hasIndianModels) {
    await Vehicle.deleteMany({});
    await Vehicle.create([
      {
        make: "Maruti Suzuki",
        model: "Swift ZXi+",
        category: "Hatchback",
        price: 849000,
        quantity: 5,
        imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Maruti Suzuki",
        model: "Dzire ZXi",
        category: "Sedan",
        price: 915000,
        quantity: 4,
        imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Toyota",
        model: "Innova Crysta GX",
        category: "SUV",
        price: 2150000,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Mahindra",
        model: "Thar 4x4 Hard Top",
        category: "SUV",
        price: 1699000,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Tata",
        model: "Nexon Fearless+",
        category: "SUV",
        price: 1450000,
        quantity: 4,
        imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Hyundai",
        model: "Creta SX(O)",
        category: "SUV",
        price: 1820000,
        quantity: 4,
        imageUrl: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Mahindra",
        model: "XUV700 AX7 Luxury",
        category: "SUV",
        price: 2480000,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Toyota",
        model: "Fortuner 4x4 Legender",
        category: "SUV",
        price: 4250000,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Tata",
        model: "Harrier Fearless",
        category: "SUV",
        price: 2390000,
        quantity: 0,
        imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Honda",
        model: "City ZX",
        category: "Sedan",
        price: 1630000,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80"
      }
    ]);
    console.log("Seeded initial inventory showcase (10 Indian car models across categories)");
  }
}
