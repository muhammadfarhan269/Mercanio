import { requireAdmin } from '@/lib/auth.helpers'
import { auth } from '@/lib/auth'
import { AdminProfileForm, AdminPasswordForm } from '@/components/admin/admin-settings-forms'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const session = await auth()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1410]">Settings</h1>
        <p className="mt-1 text-sm text-[#8C7B6E]">Manage your admin account</p>
      </div>

      <div className="space-y-8 max-w-lg">
        {/* Profile */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="mb-1 text-base font-semibold text-[#1A1410]">Profile</h2>
          <p className="mb-5 text-sm text-[#8C7B6E]">Update your display name</p>
          <AdminProfileForm currentName={session?.user?.name ?? ''} />
        </div>

        {/* Password */}
        <div className="rounded-xl border border-[#E8DDD4] bg-white p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="mb-1 text-base font-semibold text-[#1A1410]">Password</h2>
          <p className="mb-5 text-sm text-[#8C7B6E]">Change your account password</p>
          <AdminPasswordForm />
        </div>
      </div>
    </div>
  )
}
