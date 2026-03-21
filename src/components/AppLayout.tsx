/**
 * AppLayout.tsx — Nav corrigida para iPhone
 *
 * PROBLEMA: 6 tabs (incluindo Admin) = muito apertado no iPhone.
 *           Perfil tinha sumido do nav.
 *
 * SOLUÇÃO:
 * - 5 tabs fixos: Início | Bíblia | Revela | Devocional | Jornada
 * - Perfil: ícone de pessoa no final, sem label (igual ao original)
 * - Admin: acessível pela página de Perfil (não ocupa tab)
 * - Padding reduzido: px-1.5 em vez de px-3 → mais espaço por tab
 * - Labels: 8px em vez de 9px
 */

import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, BookOpen, Sparkles, Heart, Footprints, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

const TABS = [
  { to: "/home",       icon: Home,       label: "Início"     },
  { to: "/leitor",     icon: BookOpen,   label: "Bíblia"     },
  { to: "/revela",     icon: Sparkles,   label: "Revela"     },
  { to: "/devocional", icon: Heart,      label: "Devocional" },
  { to: "/jornada",    icon: Footprints, label: "Jornada"    },
];

const AppLayout = () => {
  const location = useLocation();
  const isPerfilActive = location.pathname === "/perfil";

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
        <div className="flex items-center justify-around max-w-lg mx-auto px-1 h-[70px]">

          {/* 5 tabs principais */}
          {TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.to);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center gap-1 py-2.5 px-2 min-w-0 flex-1 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -top-px left-2 right-2 h-0.5 bg-accent rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <tab.icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-muted-foreground/70"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={`text-[10px] leading-tight tracking-wide transition-colors duration-200 truncate font-ui w-full text-center ${
                    isActive ? "text-accent font-medium" : "text-muted-foreground/60"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}

          {/* Perfil — ícone separado, sem label, no final */}
          <NavLink
            to="/perfil"
            aria-label="Perfil"
            aria-current={isPerfilActive ? "page" : undefined}
            className="flex flex-col items-center justify-center py-2 px-1.5 min-w-0 relative"
          >
            {isPerfilActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-px left-2 right-2 h-0.5 bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <User
              className={`w-[18px] h-[18px] transition-colors duration-200 ${
                isPerfilActive ? "text-accent" : "text-muted-foreground/70"
              }`}
              strokeWidth={isPerfilActive ? 2 : 1.5}
            />
            <span
              className={`text-[8px] leading-tight font-ui ${
                isPerfilActive ? "text-accent font-medium" : "text-muted-foreground/60"
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
