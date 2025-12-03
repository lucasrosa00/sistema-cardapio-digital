import { Zap, Edit, Image as ImageIcon, Wifi, UtensilsCrossed, Moon } from "lucide-react";

export default function AboutCardapio() {
  const features = [
    {
      icon: Zap,
      title: "Rápido",
      description: "Carregamento instantâneo, mesmo em conexões 3G/4G",
      gradient: "from-yellow-400 to-orange-400",
    },
    {
      icon: Edit,
      title: "Fácil de editar",
      description: "Atualize preços e itens em minutos, sem complicação",
      gradient: "from-orange-400 to-red-500",
    },
    {
      icon: ImageIcon,
      title: "Fotos leves",
      description: "Imagens otimizadas para carregamento rápido",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Wifi,
      title: "Funciona em 3G/4G",
      description: "Acessível mesmo com conexão limitada",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: UtensilsCrossed,
      title: "Ideal para restaurantes",
      description: "Perfeito para restaurantes, hamburguerias e lanchonetes",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: Moon,
      title: "Dark mode",
      description: "Modo escuro para uma experiência visual confortável",
      gradient: "from-orange-600 to-red-700",
    },
  ];

  return (
    <section id="cardapio-digital" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50/30 to-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            Sobre o Cardápio Digital
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Uma solução completa e moderna para apresentar seu cardápio de forma
            profissional e acessível
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-xl hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

