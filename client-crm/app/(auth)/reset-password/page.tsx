import { Suspense } from "react"
import { ResetPasswordForm } from "@/app/components/auth/reset-password-form/reset-password-form"

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

