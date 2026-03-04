import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Share, MoreVertical, Plus, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import RevelaLogo from "@/components/RevelaLogo";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const steps: Record<Platform, { icon: React.ReactNode; text: string }[]> = {
  ios: [
    { icon: <Share className="w-5 h-5 text-accent" />, text: "Toque no botão Compartilhar (ícone de seta para cima) na barra inferior do Safari." },
    { icon: <Plus className="w-5 h-5 text-accent" />, text: 'Role para baixo e toque em "Adicionar à Tela de Início".' },
    { icon: <Download className="w-5 h-5 text-accent" />, text: 'Toque em "Adicionar". O Revela aparecerá como um app na sua tela inicial.' },
  ],
  android: [
    { icon: <MoreVertical className="w-5 h-5 text-accent" />, text: "Toque no menu ⋮ (três pontos) no canto superior direito do Chrome." },
    { icon: <Download className="w-5 h-5 text-accent" />, text: 'Toque em "Instalar app" ou "Adicionar à tela inicial".' },
    { icon: <Plus className="w-5 h-5 text-accent" />, text: "Confirme a instalação. O Revela aparecerá como um app." },
  ],
  desktop: [
    { icon: <Download className="w-5 h-5 text-accent" />, text: "No Chrome ou Edge, clique no ícone de instalar (⊕) na barra de endereço." },
    { icon: <Plus className="w-5 h-5 text-accent" />, text: "Ou vá em Menu → Instalar Revela." },
    { icon: <Download className="w-5 h-5 text-accent" />, text: "Confirme a instalação. O Revela abrirá em sua própria janela." },
  ],
};

const platformLabels: Record<Platform, string> = {
  ios: "Safari (iPhone / iPad)",
  android: "Chrome (Android)",
  desktop: "Chrome / Edge (Desktop)",
};

const InstallPWA = () => {
  const platform = useMemo(detectPlatform, []);
  const currentSteps = steps[platform];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <RevelaLogo size={28} />
        <span className="font-scripture text-sm text-muted-foreground">Instalar o Revela</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 max-w-md mx-auto">
        <RevelaLogo size={64} />
        <h1 className="font-scripture text-xl font-semibold text-foreground mt-4 mb-2">
          Instale o Revela
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Acesse o Revela como um app nativo, direto da sua tela inicial.
        </p>

        {/* Platform badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-ui font-medium text-foreground/80 mb-6">
          {platformLabels[platform]}
        </div>

        {/* Steps */}
        <div className="w-full space-y-6">
          {currentSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-ui font-semibold text-accent mb-0.5">Passo {i + 1}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 w-full">
          <Button asChild variant="outline" className="w-full">
            <Link to="/leitor">Ir para o Revela</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InstallPWA;
