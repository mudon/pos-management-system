import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, Key, ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const { resetPassword, isLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const search = useSearch({ from: '/reset-password' })
  
  const tokenFromUrl = (search as { token?: string }).token || ''

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      password: '',
      confirmPassword: '',
    },
  })

  // Pre-fill token from URL
  useEffect(() => {
    if (tokenFromUrl) {
      form.setValue('token', tokenFromUrl)
    }
  }, [tokenFromUrl, form])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword(values)
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset successfully',
        type: 'success'
      })
      navigate({ to: '/login' })
    } catch (error: any) {
      toast({
        title: 'Failed to reset password',
        description: error.message || 'Please try again',
        type: 'error'
      })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
          <Key className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset Your Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your new password below
        </p>
      </div>

      {tokenFromUrl && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            <strong>Token detected:</strong> Reset token has been pre-filled from the URL.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reset Token</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the reset token from your email"
                    className="h-12"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    className="h-12"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Password must contain:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${field.value.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One number
                    </li>
                    <li className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(field.value) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One special character
                    </li>
                  </ul>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    className="h-12"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}