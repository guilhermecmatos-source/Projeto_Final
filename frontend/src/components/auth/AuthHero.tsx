"use client";

import Icon from "@/components/ui/Icon";

interface AuthHeroProps {
  imageUrl: string;
  alt?: string;
}

export default function AuthHero({ imageUrl, alt = "" }: AuthHeroProps) {
  return (
    <section
      className="relative hidden items-center justify-center overflow-hidden bg-primary bg-login-hero p-8 lg:flex lg:w-1/2"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 61, 155, 0.8), rgba(0, 61, 155, 0.8)), url(${imageUrl})`,
      }}
      aria-label={alt}
    >
      <div className="technical-pattern absolute inset-0 opacity-30" />
      <div className="relative z-10 max-w-lg text-white">
        <div className="mb-6 flex items-center gap-3">
          <Icon name="local_shipping" className="text-5xl text-primary-fixed" filled />
          <h1 className="text-headline-lg tracking-tight">FleetAI</h1>
        </div>
        <h2 className="mb-4 text-headline-md">Intelligent Fleet Management</h2>
        <p className="text-body-lg leading-relaxed text-primary-fixed/90">
          A plataforma definitiva para controle operacional, manutenção preditiva e otimização de
          logística em tempo real.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 opacity-20">
          <div className="h-0.5 w-full bg-white" />
          <div className="h-0.5 w-2/3 bg-white" />
          <div className="h-0.5 w-full bg-white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-primary to-transparent opacity-50" />
    </section>
  );
}
