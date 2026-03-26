// Lists all available pokedexes in PokéAPI so we can map games → pokedex IDs
const r = await fetch('https://pokeapi.co/api/v2/pokedex?limit=100');
const data = await r.json();
for (const p of data.results) {
  const detail = await fetch(p.url).then(r => r.json());
  console.log(`${detail.id.toString().padStart(3)}: ${detail.name.padEnd(30)} (${detail.pokemon_entries.length} Pokémon)`);
}
