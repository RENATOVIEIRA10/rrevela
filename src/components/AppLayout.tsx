import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BookOpen, Search, Footprints, Calendar, Shield, Heart, User, SearchCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import { useAdminCheck } from "@/hooks/useAdminCheck";

const baseTabs = [
  { to: "/leitor", icon: BookOpen, label: "Palavra" },
  { to: "/busca", icon: SearchCheck, label: "Busca" },
  { to: "/devocional", icon: Heart, label: "Devocional" },
  { to: "/plano", icon: Calendar, label: "Plano" },
  { to: "/jornada", icon: Footprints, label: "Jornada" },
];

const AppLayout = () => {
  const location = useLocation();
  const { isAdmin } = useAdminCheck();

  const tabs = isAdmin
    ? [...baseTabs, { to: "/admin", icon: Shield, label: "Admin" }]
    : baseTabs;

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname.split("/")[1]}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
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
          <NavLink
            to="/perfil"
            className="flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 relative"
          >
            {location.pathname === "/perfil" && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-px left-3 right-3 h-0.5 bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <User
              className={`w-[18px] h-[18px] transition-colors duration-200 ${
                location.pathname === "/perfil" ? "text-accent" : "text-muted-foreground/70"
              }`}
              strokeWidth={location.pathname === "/perfil" ? 2 : 1.5}
            />
            <span
              className={`text-[9px] leading-tight tracking-wide transition-colors duration-200 font-ui ${
                location.pathname === "/perfil" ? "text-accent font-medium" : "text-muted-foreground/70"
              }`}
            >
              Perfil
            </span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
