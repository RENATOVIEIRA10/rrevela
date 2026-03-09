import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Search, Footprints, LogOut, Calendar, Shield, Heart, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useTheme } from "@/hooks/useTheme";

const baseTabs = [
  { to: "/leitor", icon: BookOpen, label: "Palavra" },
  { to: "/revela", icon: Search, label: "Revela" },
  { to: "/devocional", icon: Heart, label: "Devocional" },
  { to: "/plano", icon: Calendar, label: "Plano" },
  { to: "/jornada", icon: Footprints, label: "Jornada" },
];

const AppLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const tabs = isAdmin
    ? [...baseTabs, { to: "/admin", icon: Shield, label: "Admin" }]
    : baseTabs;

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <nav className="border-t border-border/50 bg-card/95 backdrop-blur-md safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-3 right-3 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon
                  className={`w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-muted-foreground/70"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[9px] leading-tight tracking-wide transition-colors duration-200 truncate font-ui ${
                    isActive ? "text-accent font-medium" : "text-muted-foreground/70"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 text-muted-foreground/70 hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[9px] leading-tight tracking-wide font-ui">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
