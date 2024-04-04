import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'
import {
  invoices,
  customers,
  revenue,
  users
} from '../app/lib/placeholder-data';

const prisma = new PrismaClient();

async function main() {

  await prisma.$queryRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  const createTable = await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return prisma.$queryRaw`
        INSERT INTO users ( name, email, password)
        VALUES ( ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  const createInvoicesTable = await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id TEXT NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`;

  console.log(`Created "invoices" table`);

  // Insert data into the "invoices" table
  const insertedInvoices = await Promise.all(
    invoices.map( (invoice) => {
      console.log(invoice);
      prisma.$queryRaw`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `
      }
    )
  
  );
  // const createCustomerTable = await prisma.$queryRaw`
  //   CREATE TABLE IF NOT EXISTS customers (
  //     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     email VARCHAR(255) NOT NULL,
  //     image_url VARCHAR(255) NOT NULL
  //   );
  // `;


  // // Insert data into the "customers" table
  // const insertedCustomers = await Promise.all(
  //   customers.map(
  //     (customer) => prisma.$queryRaw`
  //     INSERT INTO customers ( name, email, image_url)
  //     VALUES ( ${customer.name}, ${customer.email}, ${customer.image_url})
  //     ON CONFLICT (id) DO NOTHING;
  //   `,
  //   ),
  // );
//   const createRevenueTable = await prisma.$queryRaw`
//   CREATE TABLE IF NOT EXISTS revenue (
//     month VARCHAR(4) NOT NULL UNIQUE,
//     revenue INT NOT NULL
//   );
// `;

  // console.log(`Created "revenue" table`);

  // // Insert data into the "revenue" table
  // const insertedRevenue = await Promise.all(
  //   revenue.map(
  //     (rev) => prisma.$queryRaw`
  //   INSERT INTO revenue (month, revenue)
  //   VALUES (${rev.month}, ${rev.revenue})
  //   ON CONFLICT (month) DO NOTHING;
  // `,
  //   ),
  // );
}
main()
      .then(() => prisma.$disconnect())
      .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
      });