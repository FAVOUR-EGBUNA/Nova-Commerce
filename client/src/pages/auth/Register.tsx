import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import { api } from "../../lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  };
};

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const password = watch("password") ?? "";

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  async function onSubmit(values: RegisterValues) {
    try {
      setIsSubmitting(true);
      setServerError("");

      const response = await api.post<RegisterResponse>("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      localStorage.setItem("nova_token", response.data.data.token);
      localStorage.setItem(
        "nova_user",
        JSON.stringify(response.data.data.user),
      );

      navigate("/account");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create account",
        );
      } else {
        setServerError("Unable to create account");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f3] px-6 py-12">
      <div className="mx-auto max-w-md">
        <Link to="/" className="text-2xl font-black tracking-[0.25em]">
          NOVA
        </Link>

        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Create account
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">Join NOVA</h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Create an account to manage orders, save favourites and enjoy a
            smoother checkout experience.
          </p>

          {serverError && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Full name
              </label>

              <input
                {...register("name")}
                type="text"
                placeholder="Your name"
                className="input"
              />

              {errors.name && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>

              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="input"
              />

              {errors.email && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>

              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="input pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-black"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-3 space-y-1 text-xs">
                <p
                  className={
                    passwordRules.length ? "text-green-600" : "text-neutral-500"
                  }
                >
                  • At least 8 characters
                </p>

                <p
                  className={
                    passwordRules.uppercase
                      ? "text-green-600"
                      : "text-neutral-500"
                  }
                >
                  • At least 1 uppercase letter
                </p>

                <p
                  className={
                    passwordRules.lowercase
                      ? "text-green-600"
                      : "text-neutral-500"
                  }
                >
                  • At least 1 lowercase letter
                </p>

                <p
                  className={
                    passwordRules.number ? "text-green-600" : "text-neutral-500"
                  }
                >
                  • At least 1 number
                </p>

                <p
                  className={
                    passwordRules.special
                      ? "text-green-600"
                      : "text-neutral-500"
                  }
                >
                  • At least 1 special character
                </p>
              </div>

              {errors.password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Confirm password
              </label>

              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  className="input pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-black"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-black">
              Sign in
            </Link>
          </p>

          <Link
            to="/"
            className="mt-8 inline-block text-sm text-neutral-500 hover:text-black"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
