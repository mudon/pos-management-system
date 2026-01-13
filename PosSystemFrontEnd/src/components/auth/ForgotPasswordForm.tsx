import { useState } from 'react'
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
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, Mail, CheckCircle, ArrowLeft, Key } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

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

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

type Step = 'request' | 'reset' | 'success'

export function ForgotPasswordForm() {
  const { forgotPassword, resetPassword, isLoading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [resetToken, setResetToken] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  // Forgot Password Form
  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  // Reset Password Form
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      password: '',
      confirmPassword: '',
    },
  })

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values.email)
      setSubmittedEmail(values.email)
      setStep('reset')
      toast({
        title: 'Reset email sent',
        description: 'Check your email for the reset link and token',
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to send reset email',
        description: error.message || 'Please try again later',
        type: 'error'
      })
    }
  }

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword(values)
      setStep('success')
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset successfully',
        type: 'success'
      })
    } catch (error: any) {
      toast({
        title: 'Failed to reset password',
        description: error.message || 'Please try again',
        type: 'error'
      })
    }
  }

  const handleResendEmail = () => {
    if (submittedEmail) {
      forgotPassword(submittedEmail)
      toast({
        title: 'Reset email resent',
        description: 'Check your email again for the reset link',
        type: 'info'
      })
    }
  }

  // Success View
  if (step === 'success') {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Password Reset Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate({ to: '/login' })}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Reset Password View
  if (step === 'reset') {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter the reset token from your email and new password
          </p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Check your email at <strong>{submittedEmail}</strong> for the reset token.
            <button
              onClick={handleResendEmail}
              className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Resend email
            </button>
          </p>
        </div>

        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
            <FormField
              control={resetForm.control}
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
              control={resetForm.control}
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
              control={resetForm.control}
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
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
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
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to email entry
              </button>
            </div>
          </form>
        </Form>
      </div>
    )
  }

  // Request Reset View (default)
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your email to reset your password
        </p>
      </div>

      <Form {...forgotForm}>
        <form onSubmit={forgotForm.handleSubmit(handleForgotPassword)} className="space-y-6">
          <FormField
            control={forgotForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
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
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center">
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

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> In development mode, the reset token will be logged to the console.
          In production, you would receive an email with a reset token.
        </p>
        <p className="text-sm text-blue-800 dark:text-blue-300 mt-2">
          <strong>Demo Flow:</strong> 
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Enter your email</li>
            <li>Check browser console for reset token</li>
            <li>Use that token in the next step</li>
          </ol>
        </p>
      </div>
    </div>
  )
}