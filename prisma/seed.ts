import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { scrypt, randomBytes } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function hashPassword(password: string) {
	const salt = randomBytes(16).toString('hex')
	const key = await scryptAsync(password.normalize('NFKC'), salt, 64, {
		N: 16384,
		r: 16,
		p: 1,
	}) as Buffer
	return `${salt}:${key.toString('hex')}`
}

async function main() {
	const email = process.env.ADMIN_EMAIL
	const password = process.env.ADMIN_PASSWORD

	if (!email || !password) return

	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) {
		console.log(`⚠️  User ${email} already exists, skipping.`)
		return
	}

	const now = new Date()
	const userId = crypto.randomUUID()

	await prisma.user.create({
		data: {
			id: userId,
			name: 'Admin',
			email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
			accounts: {
				create: {
					id: crypto.randomUUID(),
					accountId: email,
					providerId: 'credential',
					password: await hashPassword(password),
					createdAt: now,
					updatedAt: now,
				},
			},
		},
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
