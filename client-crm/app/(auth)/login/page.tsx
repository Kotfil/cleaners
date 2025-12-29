import { Suspense } from "react"
import { LoginForm } from "@/app/components/auth/login-form/login-form"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  )
}

