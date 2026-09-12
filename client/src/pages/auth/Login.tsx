import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

import { api } from "../../lib/api";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginResponse = {
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

export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    try {
      setIsSubmitting(true);
      setServerError("");

      const response = await api.post<LoginResponse>("/auth/login", values);

      localStorage.setItem("nova_token", response.data.data.token);
      localStorage.setItem(
        "nova_user",
        JSON.stringify(response.data.data.user),
      );

      navigate("/account");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setServerError(error.response?.data?.message ?? "Unable to sign in");
      } else {
        setServerError("Unable to sign in");
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
            Welcome back
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">Sign in</h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Access your account, orders and saved items.
          </p>

          {serverError && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
                  placeholder="Your password"
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

              {errors.password && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-black">
              Create account
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
