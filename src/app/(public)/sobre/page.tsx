import { getDataFilePath, readJsonFile } from "@/lib/fsData";

type AboutContent = {
  title: string;
  paragraphs: string[];
};

export default async function Page() {
  // Tentar buscar da API primeiro (que pode ter dados mais recentes)
  let data: AboutContent;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/about`, { 
      cache: "no-store" 
    });
    if (res.ok) {
      data = await res.json();
    } else {
      throw new Error("API failed");
    }
  } catch {
    // Fallback para arquivo local
    const file = getDataFilePath("about.json");
    data = await readJsonFile<AboutContent>(file, {
      title: "Sobre",
      paragraphs: [
        "Somos um projeto editorial focado em análises neutras de plataformas de relacionamento. Nossa metodologia prioriza transparência, privacidade e qualidade de experiência para diferentes perfis de público.",
        "Não promovemos termos sensíveis e seguimos boas práticas para compatibilidade com políticas de anúncios.",
      ],
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1 className="text-3xl font-bold mb-8">{data.title}</h1>
        
        <div className="space-y-6">
          {data.paragraphs.map((p, i) => {
            // Verificar se é um título (texto curto sem pontuação no final)
            const isTitle = p.length < 50 && !p.endsWith('.') && !p.endsWith('!') && !p.endsWith('?');
            
            if (isTitle) {
              return (
                <h2 key={i} className="text-xl font-semibold mt-8 mb-4 text-gray-900">
                  {p}
                </h2>
              );
            } else {
              return (
                <p key={i} className="text-gray-700 leading-relaxed">
                  {p}
                </p>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}



