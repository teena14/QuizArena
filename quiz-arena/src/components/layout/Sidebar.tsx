"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Zap, Edit, GraduationCap, LayoutDashboard, CalendarClock } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "TEACHER" | "STUDENT";
  userName: string;
  userEmail: string;
  userImage?: string | null;
}

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: <Zap className="w-5 h-5" /> },
  { href: "/teacher/quizzes", label: "My Quizzes", icon: <Edit className="w-5 h-5" /> },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/student/classrooms", label: "Classrooms", icon: <GraduationCap className="w-5 h-5" /> },
  { href: "/student/upcoming", label: "Upcoming", icon: <CalendarClock className="w-5 h-5" /> },
];

export function Sidebar({ role, userName, userEmail, userImage }: SidebarProps) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const navItems = role === "TEACHER" ? teacherNav : studentNav;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside className="w-56 min-h-screen flex flex-col glass border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-sm">Q</div>
          <span className="text-lg font-bold">Quiz<span className="gradient-text">Arena</span></span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && item.href !== "/teacher" && item.href !== "/student" && pathname.startsWith(item.href));
          const isExact = (item.href === "/teacher" || item.href === "/student") ? pathname === item.href : undefined;
          const active = isExact !== undefined ? isExact : isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all duration-200 ${active
                  ? "gradient-brand text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <Link 
          href={role === "TEACHER" ? "/teacher/profile" : "/student/profile"}
          className="relative flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 mb-3 transition-colors group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden relative">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 text-left disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "← Sign Out"}
        </button>
      </div>
    </aside>
  );
}
