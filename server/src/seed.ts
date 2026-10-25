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

  const vehicleCount = await Vehicle.countDocuments();
  if (vehicleCount === 0) {
    await Vehicle.create([
      {
        make: "Porsche",
        model: "911 GT3 RS",
        category: "Sports",
        price: 223800,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Tesla",
        model: "Model S Plaid",
        category: "Sedan",
        price: 89990,
        quantity: 4,
        imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Ford",
        model: "F-150 Lightning Platinum",
        category: "Truck",
        price: 91995,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Mercedes-Benz",
        model: "AMG G 63",
        category: "SUV",
        price: 179000,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "BMW",
        model: "M4 Competition Coupe",
        category: "Sports",
        price: 78600,
        quantity: 3,
        imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Audi",
        model: "RS6 Avant Performance",
        category: "Hatchback",
        price: 125800,
        quantity: 0,
        imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Rivian",
        model: "R1T Adventure",
        category: "Truck",
        price: 73000,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
      },
      {
        make: "Range Rover",
        model: "Autobiography",
        category: "SUV",
        price: 157600,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
      }
    ]);
    console.log("Seeded initial inventory showcase (8 vehicles across categories)");
  }
}
