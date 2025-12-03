import {
  Package,
  FolderTree,
  DollarSign,
  Camera,
  Star,
  Link as LinkIcon,
  Settings,
  Headphones,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: Package,
      title: "Cadastro de itens",
      description: "Adicione produtos com facilidade e organize seu cardápio",
      gradient: "from-yellow-400 to-orange-400",
    },
    {
      icon: FolderTree,
      title: "Categorias",
      description: "Organize seus produtos em categorias personalizadas",
      gradient: "from-orange-400 to-red-500",
    },
    {
      icon: DollarSign,
      title: "Preços",
      description: "Configure preços e opções para cada item",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Camera,
      title: "Fotos otimizadas",
      description: "Upload de imagens com compressão automática",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Star,
      title: "Destaques",
      description: "Destaque produtos especiais e promoções",
      gradient: "from-orange-500 to-red-600",
    },
    {
      icon: LinkIcon,
      title: "Link público",
      description: "Compartilhe seu cardápio com um link único",
      gradient: "from-yellow-400 to-orange-400",
    },
    {
      icon: Settings,
      title: "Painel administrativo",
      description: "Interface intuitiva para gerenciar tudo",
      gradient: "from-orange-400 to-red-500",
    },
    {
      icon: Headphones,
      title: "Suporte básico",
      description: "Suporte incluso para tirar suas dúvidas",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            Funcionalidades
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Tudo que você precisa para gerenciar seu cardápio digital
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl bg-white border-2 border-orange-100 hover:border-orange-300 transition-all hover:shadow-lg hover:scale-105"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
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

