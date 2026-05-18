import { prisma } from "./utils/prisma";

async function main() {
  const count = await prisma.menuItem.count();
  if (count > 0) {
    console.log("Menu already seeded");
    return;
  }

  const items = [
    {
      name: "Grilled Chicken",
      description: "Served with rice",
      price: 1200,
      category: "Mains",
    },
    {
      name: "Beef Steak",
      description: "With pepper sauce",
      price: 2500,
      category: "Mains",
    },
    {
      name: "Jollof Rice",
      description: "Spicy tomato rice",
      price: 900,
      category: "Mains",
    },
    {
      name: "Fried Plantain",
      description: "Sweet plantain",
      price: 400,
      category: "Sides",
    },
    { name: "Cola", description: "Cold drink", price: 200, category: "Drinks" },
    {
      name: "Orange Juice",
      description: "Fresh squeezed",
      price: 350,
      category: "Drinks",
    },
    {
      name: "Chocolate Cake",
      description: "Dessert slice",
      price: 600,
      category: "Desserts",
    },
    {
      name: "Ice Cream",
      description: "Vanilla scoop",
      price: 300,
      category: "Desserts",
    },
    {
      name: "Fish Pie",
      description: "Baked fish pie",
      price: 800,
      category: "Mains",
    },
    {
      name: "Garden Salad",
      description: "Mixed greens",
      price: 500,
      category: "Sides",
    },
  ];

  console.log("Starting to seed...");

  for (const it of items) {
    await prisma.menuItem.create({ data: { ...it, available: true } });
  }

  console.log("Seeded menu items successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 2. Safely disconnect the database pool so the terminal process exits
    await prisma.$disconnect();
  });
