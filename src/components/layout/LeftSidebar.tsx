"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, ClipboardList, Calendar, Library, Video, Award, Clock, User,
  Users, Sparkles, LayoutDashboard, CheckCircle2, Package, LifeBuoy,
  FileText, GraduationCap, UserCog, ChevronDown, ShieldCheck,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { sub } from "date-fns";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  href?: string;
  submenu?: { label: string; href: string }[];
  allowAdmin?: boolean;
  allowTeacher?: boolean;
};

/* ================= TOP ================= */
const topNavigationItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "My dashboard", href: "/dashboard" },
  {
    icon: BookOpen, label: "Your Programs", href: "/courses",
    // submenu: [
    //   { label: "My Purchased", href: "/courses" },
    //   { label: "My Commenet", href: "/comment" },
    // ],
  },
  { icon: BookOpen, label: "All Courses", href: "/courses/all", allowAdmin: true },
];

/* ================= STUDENT ================= */
const studentNavigationItems: SidebarItem[] = [
  { icon: ClipboardList, label: "Your Assignments", href: "/assignments" },
  // {
  //   icon: Award, label: "Certificates",
  //   submenu: [
  //     { label: "Achievements", href: "/achievements" },
  //     { label: "Completion Certificates", href: "/completion-certificates" },
  //     { label: "Performance Certificates", href: "/performance-certificates" },
  //   ],
  // },
  { icon: Calendar, label: "Accounts", href: "/charge-accounts" },
  { icon: Library, label: "Our Team", href: "/support" },
  // { icon: Video, label: "Notifications", href: "/notifications" },
  { icon: Package, label: "E Library", href: "/e-library" },
  // {
  //   icon: FileText, label: "Installments",
  //   submenu: [{ label: "List", href: "/list" }],
  // },
  { icon: Clock, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

/* ================= ADMIN ================= */
const bottomNavigationItems = [
  { icon: ShieldCheck,  label: "Admin Category", href: "/admin-category",       allowAdmin: true },
  { icon: ClipboardList,label: "Assignments",     href: "/admin/assignments",    allowAdmin: true },
  { icon: Calendar,     label: "Timetable",       href: "/timetable" },
  { icon: Library,      label: "eLibrary",        href: "/library" },
  { icon: Video,        label: "Learning Guides", href: "/guides" },
  { icon: Package,      label: "Softwares",       href: "/softwares" },
  { icon: Award,        label: "Certificates",    href: "/certificates" },
  { icon: FileText,     label: "Transcript",      href: "/transcript" },
  { icon: Clock,        label: "My Progress",     href: "/progress" },
  { icon: LifeBuoy,     label: "Support",         href: "/support" },
  { icon: CheckCircle2, label: "Submissions",     href: "/submissions",          allowTeacher: true },
  { icon: User,         label: "Profile",         href: "/profile" },
];

const adminUserItems = [
  { icon: Users,        label: "Users",       href: "/users" },
  { icon: UserCog,      label: "Instructor",  href: "/instructor" },
  { icon: UserCog,      label: "Staff",       href: "/staff" },
  { icon: GraduationCap,label: "Students",    href: "/students" },
];

/* ─── role config ─────────────────────────────────────── */
const roleConfig: Record<string, { pill: string; dot: string; avatar: string }> = {
  Admin:    { pill: "bg-orange-100 text-orange-700 border border-orange-200",  dot: "bg-orange-400",  avatar: "from-orange-500 to-amber-400"  },
  Teacher:  { pill: "bg-teal-100 text-teal-700 border border-teal-200",        dot: "bg-teal-400",    avatar: "from-teal-500 to-cyan-400"      },
  Accounts: { pill: "bg-slate-100 text-slate-600 border border-slate-200",     dot: "bg-slate-400",   avatar: "from-slate-500 to-slate-400"    },
  Student:  { pill: "bg-amber-100 text-amber-700 border border-amber-200",     dot: "bg-emerald-400", avatar: "from-orange-400 to-amber-300"   },
};

/* ─── section label ───────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-2 pt-5 pb-2">
      <span className="h-px flex-1 bg-orange-100 dark:bg-orange-900/30" />
      <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-orange-400/80 dark:text-orange-300/80">
        {children}
      </span>
      <span className="h-px flex-1 bg-orange-100 dark:bg-orange-900/30" />
    </div>
  );
}

/* ─── nav item (leaf) ─────────────────────────────────── */
function NavItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
        "text-orange-700 dark:text-slate-300 transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-950/20 hover:text-orange-900 dark:hover:text-slate-100"
      )}
      activeClassName="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 font-semibold [&>span.bar]:opacity-100 [&_.ibox]:bg-orange-100 [&_.ibox]:text-orange-500"
    >
      <span className="bar absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500 opacity-0 transition-opacity duration-200" />
      <span className="ibox flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-slate-800/80 text-orange-700 dark:text-slate-200 transition-all duration-200 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500 dark:group-hover:text-orange-300">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 leading-none">{label}</span>
    </NavLink>
  );
}

/* ─── collapsible menu ────────────────────────────────── */
function CollapseMenu({
  icon: Icon, label, submenu, isOpen, onToggle,
}: {
  icon: React.ElementType;
  label: string;
  submenu: { label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
          "text-orange-700 dark:text-slate-300 transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-950/20 hover:text-orange-900 dark:hover:text-slate-100",
          isOpen && "bg-orange-100/60 dark:bg-orange-500/10 text-slate-700 dark:text-slate-100"
        )}
      >
        <span className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
          isOpen
            ? "bg-orange-100 text-orange-500 dark:bg-orange-500/20 dark:text-orange-300"
            : "bg-orange-100/80 dark:bg-slate-800/80 text-orange-700 dark:text-slate-200 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/20 group-hover:text-orange-500 dark:group-hover:text-orange-300"
        )}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left leading-none">{label}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 transition-all duration-300",
          isOpen ? "rotate-180 text-orange-500" : "text-slate-300 dark:text-slate-500"
        )} />
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="ml-[1.15rem] mt-0.5 border-l-2 border-orange-100 dark:border-orange-900/30 pl-3 py-1 space-y-0.5">
          {submenu.map((sub) => (
            <NavLink
              key={sub.href}
              to={sub.href}
              className="block rounded-lg px-3 py-2 text-xs font-medium text-orange-700 dark:text-slate-300 transition-all duration-200 hover:bg-orange-100 dark:hover:bg-orange-950/20 hover:text-orange-900 dark:hover:text-orange-300"
              activeClassName="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-300/70" />
                {sub.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── main export ─────────────────────────────────────── */
export function LeftSidebar() {
  const { user, isAdmin, isAccounts, isTeacher } = useAuth();

  const [userName, setUserName]   = useState("Student");
  const [userRole, setUserRole]   = useState("Student");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [adminUsersOpen, setAdminUsersOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const isStudent = !isAdmin && !isAccounts && !isTeacher;

  const topMenuItems = isAdmin
    ? topNavigationItems.filter((i) => i.href === "/dashboard" || i.label === "All Courses")
    : topNavigationItems.filter((i) => i.label !== "All Courses");

  const bottomMenuItems = isAdmin
    ? bottomNavigationItems.filter((i) => i.allowAdmin !== false)
    : isTeacher
    ? bottomNavigationItems.filter((i) => i.allowTeacher)
    : [];

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  useEffect(() => {
    if (user) {
      setUserName(user.full_name || "Student");
      if (isAdmin)         setUserRole("Admin");
      else if (isTeacher)  setUserRole("Teacher");
      else if (isAccounts) setUserRole("Accounts");
      else                 setUserRole("Student");

      if (user.avatar_url) {
        setAvatarUrl(user.avatar_url);
        localStorage.setItem(`avatar_url_${user.id}`, user.avatar_url);
      }
    }
  }, [user, isAdmin, isTeacher, isAccounts]);

  const rc = roleConfig[userRole] ?? roleConfig.Student;

  return (
    <nav className="relative flex h-full flex-col overflow-y-auto bg-orange-50 dark:bg-sidebar px-2 py-3 text-foreground dark:text-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      {/* ── User profile card ── */}
      <div className="relative z-10 mb-4 rounded-2xl p-[1.5px] shadow-sm shadow-orange-100/50 dark:shadow-slate-900/40"
        style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)" }}>
        <div className="relative flex items-center gap-3 rounded-[14px] bg-card px-3.5 py-3 dark:bg-slate-900">
          {/* warm tint wash */}
          <div className="pointer-events-none absolute inset-0 rounded-[14px] bg-gradient-to-br from-orange-50/50 to-amber-50/20" />

          {/* avatar */}
          <div className="relative z-10 shrink-0">
            <Avatar className="h-11 w-11 ring-2 ring-orange-200 ring-offset-1 ring-offset-white dark:ring-offset-slate-950">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className={cn("bg-gradient-to-br text-sm font-extrabold text-white", rc.avatar)}>
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* status dot */}
            <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-950", rc.dot)} />
          </div>

          {/* name + role */}
          <div className="relative z-10 min-w-0 flex-1">
            {/* <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">{userName}</p> */}
            <span className={cn("mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold", rc.pill)}>
              {userRole}
            </span>
          </div>

          <Sparkles className="relative z-10 h-4 w-4 shrink-0 animate-pulse text-orange-400" />
        </div>
      </div>

      {/* ── Top nav ── */}
      <div className="space-y-0.5">
        {topMenuItems.map((item) =>
          item.submenu ? (
            <CollapseMenu
              key={item.label}
              icon={item.icon}
              label={item.label}
              submenu={item.submenu}
              isOpen={!!openMenus[item.label]}
              onToggle={() => toggleMenu(item.label)}
            />
          ) : (
            <NavItem key={item.href} href={item.href!} icon={item.icon} label={item.label} />
          )
        )}
      </div>

      {/* ── Admin Users ── */}
      {(isAdmin || isAccounts) && (
        <>
          <SectionLabel>Management</SectionLabel>
          <div className="space-y-0.5">
            <CollapseMenu
              icon={ShieldCheck}
              label="Admin Users"
              submenu={adminUserItems.map((i) => ({ label: i.label, href: i.href }))}
              isOpen={adminUsersOpen}
              onToggle={() => setAdminUsersOpen(!adminUsersOpen)}
            />
          </div>
        </>
      )}

      {/* ── Student menu ── */}
      {isStudent && (
        <>
          <SectionLabel>Learning</SectionLabel>
          <div className="space-y-0.5">
            {studentNavigationItems.map((item) =>
              item.submenu ? (
                <CollapseMenu
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  submenu={item.submenu}
                  isOpen={!!openMenus[item.label]}
                  onToggle={() => toggleMenu(item.label)}
                />
              ) : (
                <NavItem key={(item as any).href} href={(item as any).href} icon={item.icon} label={item.label} />
              )
            )}
          </div>
        </>
      )}

      {/* ── Admin / Teacher menu ── */}
      {(isAdmin || isTeacher) && bottomMenuItems.length > 0 && (
        <>
          <SectionLabel>{isAdmin ? "Administration" : "Teaching"}</SectionLabel>
          <div className="space-y-0.5">
            {bottomMenuItems.map((item) => (
              <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
            ))}
          </div>
        </>
      )}

      {/* bottom fade */}
      <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-orange-50 dark:from-slate-950 to-transparent" />
    </nav>
  );
}