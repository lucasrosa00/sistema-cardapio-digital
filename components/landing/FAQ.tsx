"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Posso editar itens quando quiser?",
      answer:
        "Sim! Você tem acesso total ao painel administrativo e pode editar, adicionar ou remover itens a qualquer momento, sem custos adicionais.",
    },
    {
      question: "O cardápio funciona sem internet?",
      answer:
        "O cardápio precisa de conexão com a internet para ser acessado. Porém, ele foi otimizado para funcionar perfeitamente mesmo em conexões 3G/4G, garantindo uma experiência rápida para seus clientes.",
    },
    {
      question: "Tem limite de fotos ou categorias?",
      answer:
        "Não! Você pode adicionar quantas fotos e categorias quiser. Todas as imagens são otimizadas automaticamente para garantir carregamento rápido.",
    },
    {
      question: "Preciso instalar algo?",
      answer:
        "Não é necessário instalar nada. O cardápio funciona diretamente no navegador do celular do cliente através de um link ou QR Code. Você só precisa acessar o painel administrativo pelo navegador para gerenciar seu cardápio.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-orange-50/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o Cardápio Digital
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-orange-100 rounded-xl overflow-hidden hover:border-orange-300 transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-orange-50 transition-colors"
              >
                <span className="font-semibold text-zinc-900 flex-1">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-orange-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 bg-orange-50/50">
                  <p className="text-zinc-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

