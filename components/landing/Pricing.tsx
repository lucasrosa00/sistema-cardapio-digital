import { Check } from "lucide-react";

export default function Pricing() {
  const features = [
    "Cardápio digital completo",
    "Domínio personalizado opcional (cliente fornece)",
    "Suporte básico",
    "Atualizações automáticas",
    "Acesso ilimitado ao painel",
    "QR Codes ilimitados",
  ];

  return (
    <section id="preco" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50/30 to-white">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            Preço
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Um plano único, completo e acessível
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-8 py-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Plano Único</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-white">R$ 300</span>
                <span className="text-xl text-white/90">/ano</span>
              </div>
            </div>

            {/* Features */}
            <div className="px-8 py-8">
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mt-0.5 shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-zinc-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href="https://wa.me/5517991822859?text=Olá!%20Gostaria%20de%20contratar%20o%20Cardápio%20Digital%20por%20R$%20300/ano."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-semibold text-lg hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
              >
                Contratar por R$ 300/ano
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

