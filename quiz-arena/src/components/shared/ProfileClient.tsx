"use client";

import { useState, useRef } from "react";
import { updateProfile, deleteAccount } from "@/actions/profile";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { Camera, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState<string | null>(user.image || null);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const result = await updateProfile(name, image);
    if (result.success) {
      await update({ name, image });
      toast.success("Profile updated successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteAccount();
    if (result.success) {
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/" });
    } else {
      toast.error(result.error || "Failed to delete account");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <button 
          onClick={() => router.push(user.role === "TEACHER" ? "/teacher" : "/student")}
          className="text-sm font-medium text-muted-foreground hover:text-foreground mb-4 flex items-center transition-colors"
        >
          &larr; Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account details and preferences.</p>
      </div>

      <div className="glass rounded-2xl p-6 md:p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-border">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-2xl overflow-hidden shadow-lg">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center text-foreground hover:bg-muted hover:text-primary transition-colors shadow-sm"
              aria-label="Upload profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-foreground">Profile Picture</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a picture to personalize your account. Max size 1MB.
            </p>
            {image && image !== user.image && (
              <button 
                type="button"
                onClick={() => setImage(user.image || null)}
                className="text-sm text-destructive hover:underline mt-2"
              >
                Cancel image change
              </button>
            )}
          </div>
        </div>

        {/* Details Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Your email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving || (name === user.name && image === (user.image || null))}
              className="px-6 py-3 rounded-xl gradient-brand text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="border border-destructive/20 bg-destructive/5 rounded-2xl p-6 md:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Once you delete your account, there is no going back. Please be certain.
            All your quizzes, attempts, and data will be permanently erased.
          </p>
        </div>

        {showDeleteConfirm ? (
          <div className="p-4 bg-background border border-destructive/30 rounded-xl space-y-4">
            <p className="text-sm text-foreground font-medium">Are you absolutely sure?</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, delete my account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-white font-medium text-sm transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
