import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { api } from "../lib/api";
import { loginSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";

export default function Login() {
  const token = useStore((s) => s.token);
  const setToken = useStore((s) => s.setToken);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const login = useMutation({
    mutationFn: ({ email, password }) => api.login(email, password),
    onSuccess: (data) => {
      setToken(data.access_token);
      navigate("/admin");
    },
  });

  if (token) return <Navigate to="/admin" replace />;

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="card w-full max-w-sm space-y-4 p-6" noValidate>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Lock size={20} aria-hidden /> Admin login
        </h1>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" autoComplete="username" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" className="input" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        {login.isError && (
          <p className="text-sm text-rose-400" role="alert">
            {login.error.message}
          </p>
        )}
        <button className="btn-primary w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
