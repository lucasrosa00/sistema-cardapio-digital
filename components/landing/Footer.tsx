"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-300 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegação</h3>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection("cardapio-digital")}
                className="text-left text-zinc-400 hover:text-orange-400 transition-colors"
              >
                Cardápio Digital
              </button>
              <button
                onClick={() => scrollToSection("pedidos-mesa")}
                className="text-left text-zinc-400 hover:text-orange-400 transition-colors"
              >
                Pedidos na Mesa
              </button>
              <button
                onClick={() => scrollToSection("pedidos-whatsapp")}
                className="text-left text-zinc-400 hover:text-orange-400 transition-colors"
              >
                Pedidos via WhatsApp
              </button>
              <button
                onClick={() => scrollToSection("preco")}
                className="text-left text-zinc-400 hover:text-orange-400 transition-colors"
              >
                Preço
              </button>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <a
              href="https://wa.me/5517991822859?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Cardápio%20Digital."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-orange-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Logo */}
          <div>
            <Image
              src="/uploads/logo_invert.png"
              alt="Pink Tech Sistemas"
              width={500}
              height={500}
              className="h-32 w-auto mb-4"
            />
            <p className="text-zinc-400 text-sm">
              Solução completa para cardápios digitais
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-zinc-800 pt-8 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

