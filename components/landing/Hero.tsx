export default function Hero() {
    return (
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 via-orange-50/50 to-white">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 leading-tight mb-6">
                            Cardápio Digital
                            <br />
                            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                para seu restaurante
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-600 mb-8 leading-relaxed">
                            Transforme seu cardápio físico em uma experiência digital moderna.
                            Rápido, fácil e acessível para seus clientes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <a
                                href="#preco"
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-full font-semibold text-lg hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
                            >
                                Criar meu cardápio agora
                            </a>
                            <a
                                href="#cardapio-digital"
                                className="inline-flex items-center justify-center px-8 py-4 border-2 border-orange-400 text-orange-600 rounded-full font-semibold text-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                            >
                                Ver demonstração
                            </a>
                        </div>
                    </div>

                    {/* Mockup */}
                    <div className="flex justify-center md:justify-end">
                        <div className="relative w-full max-w-lg">
                            <img
                                src="/uploads/cardapio.png"
                                alt="Mockup do Cardápio Digital"
                                className="w-full h-auto rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

