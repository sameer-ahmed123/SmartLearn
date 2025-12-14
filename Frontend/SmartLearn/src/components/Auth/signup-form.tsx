import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/UI/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/UI/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import { Input } from "@/components/UI/input"
import { Link } from "react-router-dom"

type SignupValues = {
  name: string
  email: string
  role: "Teacher" | "Student" | ""
  password: string
  confirmPassword: string
}

type SignupErrors = Partial<Record<keyof SignupValues, string>>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [values, setValues] = useState<SignupValues>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<SignupErrors>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: SignupValues["role"]) => {
    setValues((prev) => ({ ...prev, role: value }))
  }

  const validate = (): boolean => {
    const newErrors: SignupErrors = {}

    if (!values.name.trim()) {
      newErrors.name = "Full name is required"
    }

    if (!values.email) {
      newErrors.email = "Email is required"
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
    ) {
      newErrors.email = "Invalid email address"
    }

    if (!values.role) {
      newErrors.role = "Please select a role"
    }

    if (!values.password) {
      newErrors.password = "Password is required"
    } else if (values.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters"
    }

    if (!values.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password"
    } else if (values.confirmPassword !== values.password) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    e.preventDefault()

    if (!validate()) return

    console.log("Validated data:", values)
    // send to backend
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            Create your account
          </h1>
          <p className="text-muted-foreground text-sm">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Name */}
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {errors.name && (
            <FieldDescription className="text-red-500">
              {errors.name}
            </FieldDescription>
          )}
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="m@example.com"
          />
          {errors.email && (
            <FieldDescription className="text-red-500">
              {errors.email}
            </FieldDescription>
          )}
        </Field>

        {/* Role */}
        <Field>
          <FieldLabel>Role</FieldLabel>
          <Select
            value={values.role}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Teacher">
                Teacher
              </SelectItem>
              <SelectItem value="Student">
                Student
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <FieldDescription className="text-red-500">
              {errors.role}
            </FieldDescription>
          )}
        </Field>

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">
            Password
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
          />
          {errors.password ? (
            <FieldDescription className="text-red-500">
              {errors.password}
            </FieldDescription>
          ) : (
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
          )}
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Confirm Password
          </FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <FieldDescription className="text-red-500">
              {errors.confirmPassword}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit">
            Create Account
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button">
            Sign up with GitHub
          </Button>

          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
