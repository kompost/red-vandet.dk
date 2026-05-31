import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
	const email = process.env.ADMIN_EMAIL
	const password = process.env.ADMIN_PASSWORD

	if (!email || !password) return

	const { auth } = await import('../src/lib/auth.js')

	await auth.api.signUpEmail({
		body: { email, password, name: 'Admin' },
	})

	console.log(`✅ Admin user created: ${email}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
