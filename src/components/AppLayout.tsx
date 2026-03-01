import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Search, Footprints, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/leitor", icon: BookOpen, label: "Palavra" },
  { to: "/revela", icon: Search, label: "Revela" },
  { to: "/jornada", icon: Footprints, label: "Jornada" },
];

const AppLayout = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      <nav className="border-t border-border bg-card/90 backdrop-blur-sm safe-bottom">
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1">
          {tabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="flex flex-col items-center gap-0.5 py-2 px-4 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-3 right-3 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[10px] tracking-wide transition-colors duration-200 ${
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
            className="flex flex-col items-center gap-0.5 py-2 px-4 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] tracking-wide">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
