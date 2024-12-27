// import { useState } from 'react'
// import { useAuth } from '@/components/AuthContext'
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Mail, Lock } from 'lucide-react'
// import Link from 'next/link'
// import { useRouter } from "next/router";
// interface LoginFormData {
//   email: string
//   password: string
// }

// export default function LoginPage() {
//   const authContext = useAuth()
//   if (!authContext) {
//     throw new Error('AuthContext is null')
//   }
//   const { login } = authContext
//   const [formData, setFormData] = useState<LoginFormData>({
//     email: '',
//     password: ''
//   })
//   const [error, setError] = useState<string>('')
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter(); 
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setIsLoading(true)

//     try {
//       await login(formData.email, formData.password);
//       router.push("/profile");  
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Login failed')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
            
//             <div className="space-y-1">
//               <p className="text-sm font-medium text-gray-700">Email</p>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <div className="flex justify-between items-center">
//                 <p className="text-sm font-medium text-gray-700">Password</p>
//                 <a 
//                   href="/forgot-password" 
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   placeholder="Enter your password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-sm text-center text-gray-500">
//             Don&apos;t have an account?{' '}
//             <Link href="/auth/register" className="text-primary hover:underline">
//               Create an account
//             </Link>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }