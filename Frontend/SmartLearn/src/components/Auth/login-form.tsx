import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/UI/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/UI/field"
import { Input } from "@/components/UI/input"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useNavigate } from "react-router-dom" // Add this
import apiClient from "@/api/apiClient"

type Errors = {
  email?: string
  password?: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [values, setValues] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<Errors>({})
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const validate = (): boolean => {
    const newErrors: Errors = {}

    if (!values.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "Invalid email address"
    }

    if (!values.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return
   try{
     const response = await apiClient.post('/auth/login/', values);
    // console.log(response)
    const { user, access, refresh } = response.data;
    login(user, access, refresh);
    navigate('/')
    

    // console.log("Validated data:", values)
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   }catch(err:any){
    if (err.response && err.response.data) {
      setErrors({
        email: err.response.data.detail || "Login failed. Please check your credentials."
      });
    } else {
      setErrors({ email: "Server is unreachable. Try again later." });
    }
   }
    // send to backend (Django / Firebase / etc.)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to login to your account
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            value={values.email}
            onChange={handleChange}
          />
          {errors.email && (
            <FieldDescription className="text-red-500">
              {errors.email}
            </FieldDescription>
          )}
        </Field>

        {/* Password */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>

          <Input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
          />
          {errors.password && (
            <FieldDescription className="text-red-500">
              {errors.password}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit">Login</Button>
        </Field>

        <FieldSeparator></FieldSeparator>

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
