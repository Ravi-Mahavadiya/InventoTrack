import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Boxes } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiRegister } from "../../api";
import { useAuthStore } from "../../store/authStore";

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[A-Za-z0-9]+$/, "Name can only contain letters and numbers"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,15}$/,
      "Password: 6-15 characters, including uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { isAuthenticated, login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function onSubmit(data: FormData) {
    try {
      const res = await apiRegister(data.name, data.email, data.password);
      login(res.user, res.token);
      toast.success("Account created! Welcome, " + res.user.name + "!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h2 className="text-xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-sm text-slate-500 mb-6">Start managing your inventory today.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" placeholder="Alex Morgan" error={errors.name?.message} {...register("name")} />
            <Input label="Email address" type="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" error={errors.password?.message} {...register("password")} />
            <Input label="Confirm password" type="password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Create account</Button>
          </form>

          <p className="text-sm text-slate-500 text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-500 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
