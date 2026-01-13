import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuth } from '@/hooks/useAuth'

function App() {
  return <RouterProvider router={router} />
}

export default App