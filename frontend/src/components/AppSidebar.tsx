import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Brain,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/context/AuthContext";

const workspaceItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard, end: true },
  { title: "Questionnaire", url: "/app/questionnaire", icon: ClipboardList },
  { title: "AI Chat", url: "/app/chat", icon: MessageSquare },
  { title: "Fusion Analysis", url: "/app/fusion", icon: Sparkles },
  { title: "Reports", url: "/app/reports", icon: FileText },
  { title: "History", url: "/app/history", icon: History },
  { title: "Analytics", url: "/app/analytics", icon: BarChart3 },
];

const accountItems = [{ title: "Settings", url: "/app/settings", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || "User";
  const userEmail = user?.email || "No email";
  const userInitial = userName.charAt(0).toUpperCase();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-white shadow-sm"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      <SidebarContent className="bg-[#0F172A]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-4 py-5 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Brain className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-white">
                Behavioral AI
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Intelligence Platform
              </span>
            </div>
          )}
        </Link>

        {/* Workspace nav */}
        <SidebarGroup className="pt-4">
          {!collapsed && (
            <SidebarGroupLabel className="text-slate-500 text-[10px] uppercase tracking-widest px-4 mb-1">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.end} className={linkCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account nav */}
        <SidebarGroup className="mt-2">
          {!collapsed && (
            <SidebarGroupLabel className="text-slate-500 text-[10px] uppercase tracking-widest px-4 mb-1">
              Account
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={linkCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={() => { logout(); navigate("/"); }}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User profile card at bottom */}
        {!collapsed && (
          <div className="m-3 mt-auto rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">{userName}</div>
                <div className="truncate text-xs text-slate-400">{userEmail}</div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

