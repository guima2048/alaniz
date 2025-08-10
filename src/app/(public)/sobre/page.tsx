import { getDataFilePath, readJsonFile } from "@/lib/fsData";

type AboutContent = {
  title: string;
  paragraphs: string[];
};

export default async function Page() {
  const file = getDataFilePath("about.json");
  const data = await readJsonFile<AboutContent>(file, {
    title: "Sobre",
    paragraphs: [
      "Somos um projeto editorial focado em análises neutras de plataformas de relacionamento. Nossa metodologia prioriza transparência, privacidade e qualidade de experiência para diferentes perfis de público.",
      "Não promovemos termos sensíveis e seguimos boas práticas para compatibilidade com políticas de anúncios.",
    ],
  });

  return (
    <div className="container mx-auto px-4 py-8 prose">
      <h1>{data.title}</h1>
      {data.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}



