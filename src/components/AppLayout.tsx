import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Search, Footprints, LogOut, Sparkles, Shield, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const baseTabs = [
  { to: "/leitor", icon: BookOpen, label: "Palavra" },
  { to: "/revela", icon: Search, label: "Revela" },
  { to: "/devocional", icon: Heart, label: "Devocional" },
  { to: "/promessa", icon: Sparkles, label: "Promessa" },
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

      <nav className="border-t border-border bg-card/90 backdrop-blur-sm safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-0.5">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-px py-1.5 px-2 min-w-0 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-2 right-2 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`w-[18px] h-[18px] transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[9px] leading-tight tracking-wide transition-colors duration-200 truncate ${
                    isActive ? "text-accent font-medium" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-px py-1.5 px-2 min-w-0 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[9px] leading-tight tracking-wide">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
