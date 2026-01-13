src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── ui/
│   │   ├── toast.tsx
│   │   └── toast-hook.tsx
│   ├── layout/
│   │   ├── RootLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── pos/
│   │   └── POSDashboard.tsx
│   └── dashboard/
│       └── StatsCards.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   └── useAuth.ts
├── routes/
│   ├── login.tsx
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── dashboard/
│       └── index.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
├── stores/
│   └── auth.store.ts
├── types/
│   └── auth.ts
├── lib/
│   └── utils.ts
├── router.tsx
├── App.tsx
└── main.tsx