"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/uploads/logo.png"
              alt="Pink Tech Sistemas"
              width={500}
              height={500}
              className="h-16 sm:h-20 w-auto"
              priority
            />
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("cardapio-digital")}
              className="text-zinc-700 hover:text-orange-600 font-medium transition-colors"
            >
              Cardápio Digital
            </button>
            <button
              onClick={() => scrollToSection("pedidos-mesa")}
              className="text-zinc-700 hover:text-orange-600 font-medium transition-colors"
            >
              Pedidos na Mesa
            </button>
            <button
              onClick={() => scrollToSection("pedidos-whatsapp")}
              className="text-zinc-700 hover:text-orange-600 font-medium transition-colors"
            >
              Pedidos via WhatsApp
            </button>
            <button
              onClick={() => scrollToSection("preco")}
              className="text-zinc-700 hover:text-orange-600 font-medium transition-colors"
            >
              Preço
            </button>
          </nav>

          {/* CTA Button */}
          <button
            onClick={() => scrollToSection("preco")}
            className="hidden md:flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-medium hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            Começar agora
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("cardapio-digital")}
                className="text-left text-zinc-700 hover:text-zinc-900 font-medium py-2 transition-colors"
              >
                Cardápio Digital
              </button>
              <button
                onClick={() => scrollToSection("pedidos-mesa")}
                className="text-left text-zinc-700 hover:text-zinc-900 font-medium py-2 transition-colors"
              >
                Pedidos na Mesa
              </button>
              <button
                onClick={() => scrollToSection("pedidos-whatsapp")}
                className="text-left text-zinc-700 hover:text-zinc-900 font-medium py-2 transition-colors"
              >
                Pedidos via WhatsApp
              </button>
              <button
                onClick={() => scrollToSection("preco")}
                className="text-left text-zinc-700 hover:text-zinc-900 font-medium py-2 transition-colors"
              >
                Preço
              </button>
              <button
                onClick={() => scrollToSection("preco")}
                className="mt-2 w-full flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-medium hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all"
              >
                Começar agora
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

