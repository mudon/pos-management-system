import React from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  )
}