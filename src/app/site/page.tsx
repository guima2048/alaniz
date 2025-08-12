import { CategoryChips } from "@/components/CategoryChips";
import { HomeContent } from "@/components/HomeContent";
import { SearchInput } from "@/components/SearchInput";
import { getSites, getCategories } from "@/lib/data";

export default async function SitePage() {
  // Buscar dados no servidor para SSR
  const [sites, categories] = await Promise.all([
    getSites(),
    getCategories()
  ]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium tracking-tight">Avaliando os melhores sites de relacionamentos</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        <SearchInput />
        <CategoryChips categories={categories} />
      </div>

      <HomeContent sites={sites} categories={categories} />

      {/* Resumo do Alaniz - sempre no final */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-gray-700 leading-relaxed alaniz-text">
            O Alaniz existe para proteger seu tempo e seu bolso — com testes sérios, notas honestas e decisões fáceis de tomar. Sem fanfarra. Sem filtro. Com a frieza dos dados e a elegância de quem respeita você.
          </p>
        </div>
      </div>
    </div>
  );
}
