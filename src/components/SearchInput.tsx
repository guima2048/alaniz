export function SearchInput() {
  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Buscar plataformas"
        className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
        aria-label="Buscar"
      />
    </div>
  );
}
