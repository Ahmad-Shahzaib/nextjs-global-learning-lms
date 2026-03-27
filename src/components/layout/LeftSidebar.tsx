"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  ClipboardList,
  Calendar,
  Library,
  Video,
  Award,
  Clock,
  User,
  Users,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Package,
  LifeBuoy,
  FileText,
  GraduationCap,
  UserCog,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { sub } from "date-fns";

/* ================= TOP ================= */
const topNavigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Courses", href: "/courses",
    submenu: [
      { label: "My Purchased", href: "/courses" },
      { label: "My Commenet", href: "/comment" },
  
    ]
   },
];

/* ================= STUDENT ================= */
const studentNavigationItems = [
  {
    icon: ClipboardList,
    label: "Assignments",
    submenu: [
      { label: "My Assignments", href: "/assignments" },
      { label: "Not Participated", href: "/not-participated" },
    ],
  },
  {
    icon: Award,
    label: "Certificates",
    submenu: [
      { label: "Achievements", href: "/achievements" },
      { label: "Completion Certificates", href: "/completion-certificates" },
      { label: "Performance Certificates", href: "/performance-certificates" },
    ],
  },
  {
    icon: Calendar,
    label: "Financial",
    submenu: [
      { label: "Financial Summary", href: "/financial-summary" },
      { label: "Payouts", href: "/payouts" },
      { label: "Charge Accounts", href: "/charge-accounts" },
    ],
  },
  {
    icon: Library,
    label: "Support",
    submenu: [
      { label: "New", href: "/new" },
      { label: "Course Support", href: "/course-support" },
      { label: "Ticket", href: "/ticket" },
    ],
  },
  { icon: Video, label: "Notifications", href: "/notifications" },
  { icon: Package, label: "E Library", href: "/e-library" },
  {
    icon: FileText,
    label: "Installments",
    submenu: [{ label: "List", href: "/list" }],
  },
  { icon: Clock, label: "Settings", href: "/settings" },
  { icon: User, label: "Profile", href: "/profile" },
];

/* ================= ADMIN ================= */
const bottomNavigationItems = [
  { icon: ShieldCheck, label: "Admin Category", href: "/admin-category", allowAdmin: true },
  { icon: ClipboardList, label: "Assignments", href: "/assignments" },
  { icon: Calendar, label: "Timetable", href: "/timetable" },
  { icon: Library, label: "eLibrary", href: "/library" },
  { icon: Video, label: "Learning Guides", href: "/guides" },
  { icon: Package, label: "Softwares", href: "/softwares" },
  { icon: Award, label: "Certificates", href: "/certificates" },
  { icon: FileText, label: "Transcript", href: "/transcript" },
  { icon: Clock, label: "My Progress", href: "/progress" },
  { icon: LifeBuoy, label: "Support", href: "/support" },
  { icon: CheckCircle2, label: "Submissions", href: "/submissions", allowTeacher: true },
  { icon: User, label: "Profile", href: "/profile" },
];

const adminUserItems = [
  { icon: Users, label: "Users", href: "/users" },
  { icon: UserCog, label: "Instructor", href: "/instructor" },
  { icon: UserCog, label: "Staff", href: "/staff" },
  { icon: GraduationCap, label: "Students", href: "/students" },
];

export function LeftSidebar() {
  const { user, isAdmin, isAccounts, isTeacher } = useAuth();

  const [userName, setUserName] = useState("Student");
  const [userRole, setUserRole] = useState("Student");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const [adminUsersOpen, setAdminUsersOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      setUserName(user.full_name || "Student");

      if (isAdmin) setUserRole("Admin");
      else if (isTeacher) setUserRole("Teacher");
      else if (isAccounts) setUserRole("Accounts");
      else setUserRole("Student");

      if (user.avatar_url) {
        setAvatarUrl(user.avatar_url);
        localStorage.setItem(`avatar_url_${user.id}`, user.avatar_url);
      }
    }
  }, [user, isAdmin, isTeacher, isAccounts]);

  return (
    <nav className="flex flex-col h-full p-4 space-y-2 relative overflow-y-auto hide-scrollbar">

      {/* ===== USER ===== */}
      <div className="mb-4 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-glow">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="bg-gradient-accent text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
          </div>
          <div>
            <p className="font-semibold text-sidebar-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </div>

      {/* ===== TOP ===== */}
      {topNavigationItems.map((item) => {
        const isOpen = openMenus[item.label];

        if (!item.submenu) {
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                "text-sidebar-foreground hover:text-sidebar-primary-foreground"
              )}
              activeClassName="bg-gradient-accent text-white font-medium shadow-glow"
            >
              <div className="absolute inset-0 bg-sidebar-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <item.icon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        }

        return (
          <div key={item.label}>
            <button
              onClick={() =>
                setOpenMenus((prev) => ({
                  ...prev,
                  [item.label]: !prev[item.label],
                }))
              }
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden w-full text-left",
                "text-sidebar-foreground hover:text-sidebar-primary-foreground"
              )}
            >
              <div className="absolute inset-0 bg-sidebar-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              <item.icon className="h-5 w-5 relative z-10" />
              <span className="relative z-10 flex-1">{item.label}</span>
              <ChevronDown className={isOpen ? "rotate-180" : ""} />
            </button>

            {isOpen && (
              <div className="ml-4 mt-1 border-l pl-3">
                {item.submenu.map((sub) => (
                  <NavLink
                    key={sub.href}
                    to={sub.href}
                    className="block py-2 text-sm"
                    activeClassName="bg-gradient-accent text-white"
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ===== ADMIN USERS ===== */}
      {(isAdmin || isAccounts) && (
        <div>
          <button onClick={() => setAdminUsersOpen(!adminUsersOpen)} className="w-full flex items-center px-4 py-3">
            <ShieldCheck className="h-5 w-5" />
            <span className="flex-1 text-left ml-2">Admin Users</span>
            <ChevronDown className={adminUsersOpen ? "rotate-180" : ""} />
          </button>

          {adminUsersOpen && (
            <div className="ml-4 border-l pl-3">
              {adminUserItems.map((item) => (
                <NavLink key={item.href} to={item.href} className="block py-2">
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== STUDENT MENU ===== */}
      {!isAdmin &&
        studentNavigationItems.map((item) => {
          const isOpen = openMenus[item.label];

          return (
            <div key={item.label}>
              <button
                onClick={() =>
                  item.submenu &&
                  setOpenMenus((prev) => ({
                    ...prev,
                    [item.label]: !prev[item.label],
                  }))
                }
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                  "text-sidebar-foreground hover:text-sidebar-primary-foreground"
                )}
              >
                <div className="absolute inset-0 bg-sidebar-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                <item.icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10 flex-1">{item.label}</span>

                {item.submenu && (
                  <ChevronDown className={isOpen ? "rotate-180" : ""} />
                )}
              </button>

              {item.submenu && isOpen && (
                <div className="ml-4 mt-1 border-l pl-3">
                  {item.submenu.map((sub) => (
                    <NavLink
                      key={sub.href}
                      to={sub.href}
                      className="block py-2 text-sm"
                      activeClassName="bg-gradient-accent text-white"
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* ===== ADMIN MENU ===== */}
      {isAdmin &&
        bottomNavigationItems.map((item) => (
          <NavLink key={item.href} to={item.href} className="flex items-center gap-3 px-4 py-3">
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
    </nav>
  );
}