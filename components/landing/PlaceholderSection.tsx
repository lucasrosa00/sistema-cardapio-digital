interface PlaceholderSectionProps {
  id: string;
  title: string;
}

export default function PlaceholderSection({
  id,
  title,
}: PlaceholderSectionProps) {
  return (
    <section id={id} className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-yellow-50/20">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-4">
            {title} <span className="text-orange-500">(Em breve)</span>
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Conteúdo será adicionado futuramente.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="aspect-[9/19] bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200 rounded-3xl p-4 shadow-xl">
            <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-4xl">📱</span>
                </div>
                <p className="text-zinc-500 text-sm">Mockup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

