import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const seedBooks = [
  {
    title: "Introduction to Islamic Studies",
    author: "Tommy Dazwir Paja Putra",
    isbn: "602-1234-56-7",
    category: "Motivasi Islami",
    year: 2024,
    description:
      "Buku pengantar yang komprehensif untuk memahami dasar-dasar studi Islam, mencakup sejarah, teologi, dan praktik keagamaan dalam konteks modern.",
    publisher: "Adilla Bangun Negeri",
    coverImage: null, // Kosongkan atau isi dengan URL Supabase yang sudah ada
  },
  {
    title: "The Secret Codes of Success",
    author: "Tommy Dazwir Paja Putra",
    isbn: "602-1234-57-4",
    category: "Motivasi Islami",
    year: 2024,
    description:
      "Mengungkap rahasia-rahasia sukses berdasarkan prinsip-prinsip Islam dan pengalaman para tokoh inspiratif dalam berbagai bidang kehidupan.",
    publisher: "Adilla Bangun Negeri",
    coverImage: null, // Kosongkan atau isi dengan URL Supabase yang sudah ada
  },
];

async function main() {
  console.log("🌱 Mulai seeding database...");

  // Hapus data lama
  console.log("🗑️  Menghapus data lama...");
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Data lama berhasil dihapus");

  // Hash password
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const userPassword = await bcrypt.hash("user123", saltRounds);

  // Tambahkan user
  console.log("👤 Menambahkan user...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@adillabn.com",
      password: adminPassword,
      name: "Admin Adilla",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: userPassword,
      name: "User Test",
      role: Role.USER,
    },
  });

  console.log("✅ User berhasil dibuat");
  console.log(`   - Admin: ${admin.email}`);
  console.log(`   - User: ${user.email}`);

  // Tambahkan buku
  console.log("📚 Menambahkan data buku...");
  const books = [];
  
  for (const bookData of seedBooks) {
    const createdBook = await prisma.book.create({
      data: bookData,
    });
    books.push(createdBook);
    console.log(`   ✓ ${createdBook.title}`);
  }

  console.log(`✅ Berhasil menambahkan ${books.length} buku`);

  console.log("\n🎉 Seeding selesai!");
  console.log("\n🔐 Credential untuk login:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin:");
  console.log("  Email    : admin@adillabn.com");
  console.log("  Password : admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("User:");
  console.log("  Email    : user@example.com");
  console.log("  Password : user123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n💡 Tips:");
  console.log("   - Cover buku bisa diupload nanti melalui admin panel");
  console.log("   - Gunakan fitur 'Edit Buku' untuk menambahkan cover");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });