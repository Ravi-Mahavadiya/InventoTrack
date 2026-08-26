import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Boxes, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiLogin } from "../../api";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function onSubmit(data: FormData) {
    try {
      const res = await apiLogin(data.email, data.password);
      login(res.user, res.token);
      toast.success("Welcome back, " + res.user.name + "!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
            <Boxes size={20} className="text-white" />
          </div>
          <div>
            <p className="text-slate-900 font-bold text-lg leading-none">Inventra</p>
            <p className="text-slate-400 text-xs">Inventory Management</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              error={errors.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              {...register("password")}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-indigo-500 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
