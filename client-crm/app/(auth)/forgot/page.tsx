import { Suspense } from "react"
import { ForgotForm } from "@/app/components/auth/forgot-form/forgot-form"

export const dynamic = 'force-dynamic'

export default function ForgotPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <ForgotForm />
    </Suspense>
  )
}

