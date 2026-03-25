import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/lib/auth'

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error('Unauthorized')
      if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
        throw new Error('Forbidden')
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId }
    }),

  vendorLogo: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error('Unauthorized')
      if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
        throw new Error('Forbidden')
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),

  vendorBanner: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error('Unauthorized')
      if (session.user.role !== 'VENDOR' && session.user.role !== 'ADMIN') {
        throw new Error('Forbidden')
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
