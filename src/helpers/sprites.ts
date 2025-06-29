export function getPokeDbSpriteUrl(pokemon: string) {
  return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${pokemon
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("é", "e")}.png`;
}
