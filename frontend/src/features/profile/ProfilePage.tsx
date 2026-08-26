import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { apiUpdateProfile, apiChangePassword } from "../../api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { User, Lock } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  // Name Update State
  const [name, setName] = useState(user?.name || "");
  const [updatingName, setUpdatingName] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error("Name cannot be empty.");
    }
    // Alphanumeric validator
    if (!/^[a-zA-Z0-9 ]+$/.test(name)) {
      return toast.error("Name must contain only letters, numbers, and spaces.");
    }

    setUpdatingName(true);
    try {
      const updatedUser = await apiUpdateProfile(name.trim());
      updateUser({ name: updatedUser.name });
      toast.success("Profile name updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile name.");
    } finally {
      setUpdatingName(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      return toast.error("Current password is required.");
    }
    if (newPassword.length < 6 || newPassword.length > 15) {
      return toast.error("New password must be between 6 and 15 characters.");
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return toast.error("New password must contain uppercase, lowercase, a number, and a special character.");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match.");
    }

    setUpdatingPassword(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Profile Details</h2>
            <p className="text-xs text-slate-500">Update your account username and display preferences</p>
          </div>
        </div>

        <form onSubmit={handleUpdateName} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
          <div className="md:col-span-2">
            <Input
              label="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <Button type="submit" loading={updatingName}>Save Username</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">Ensure your account is using a secure, complex password</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg pt-2">
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={updatingPassword}>Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
