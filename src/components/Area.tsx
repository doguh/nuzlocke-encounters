import { useState, useEffect, useRef } from "react";
import type { Area } from "../data/scarlet-violet";
import { exclusivePokemons } from "../data/scarlet-violet";
import { getPokeDbSpriteUrl } from "../helpers/sprites";
import confetti from "canvas-confetti";
import "./Area.css";

export type AreaProps = {
  area: Area;
  gameVersion: string;
};

export default function AreaComponent(props: AreaProps) {
  const { area, gameVersion } = props;
  const [generatedEncounter, setGeneratedEncounter] = useState<string | null>(
    null
  );
  const [bounce, setBounce] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const prevEncounter = useRef<string | null>(null);

  // Filter Pokémon based on game version
  const availablePokemons = area.pokemons.filter((pokemon) => {
    const isScarletExclusive = exclusivePokemons.scarlet.includes(pokemon);
    const isVioletExclusive = exclusivePokemons.violet.includes(pokemon);

    // If it's exclusive to the other version, exclude it
    if (gameVersion === "scarlet" && isVioletExclusive) return false;
    if (gameVersion === "violet" && isScarletExclusive) return false;

    return true;
  });

  // Load saved encounter from localStorage on component mount
  useEffect(() => {
    const savedEncounters = localStorage.getItem("encounters");
    if (savedEncounters) {
      const encounters = JSON.parse(savedEncounters);
      const savedEncounter = encounters[area.name];
      if (savedEncounter) {
        setGeneratedEncounter(savedEncounter);
        setJustGenerated(false); // Do not animate on mount
      }
    }
  }, [area.name]);

  // Confetti and bounce effect only when justGenerated is true
  useEffect(() => {
    if (generatedEncounter && justGenerated) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setBounce(true);
      setTimeout(() => setBounce(false), 700);
      setJustGenerated(false);
      prevEncounter.current = generatedEncounter;
    }
  }, [generatedEncounter, justGenerated]);

  const generateEncounter = () => {
    const randomIndex = Math.floor(Math.random() * availablePokemons.length);
    const selectedPokemon = availablePokemons[randomIndex];
    setGeneratedEncounter(selectedPokemon);

    // Save to single encounters dictionary
    const savedEncounters = localStorage.getItem("encounters");
    const encounters = savedEncounters ? JSON.parse(savedEncounters) : {};
    encounters[area.name] = selectedPokemon;
    localStorage.setItem("encounters", JSON.stringify(encounters));

    setJustGenerated(true);
  };

  const regenerateEncounter = () => {
    generateEncounter();
  };

  const clearEncounter = () => {
    setGeneratedEncounter(null);

    // Remove from encounters dictionary
    const savedEncounters = localStorage.getItem("encounters");
    if (savedEncounters) {
      const encounters = JSON.parse(savedEncounters);
      delete encounters[area.name];
      localStorage.setItem("encounters", JSON.stringify(encounters));
    }

    setJustGenerated(false);
  };

  const handleManualSelect = (pokemon: string) => {
    setGeneratedEncounter(pokemon);

    // Save to single encounters dictionary
    const savedEncounters = localStorage.getItem("encounters");
    const encounters = savedEncounters ? JSON.parse(savedEncounters) : {};
    encounters[area.name] = pokemon;
    localStorage.setItem("encounters", JSON.stringify(encounters));

    setJustGenerated(true);
  };

  return (
    <div className="area-container">
      <a
        href={area.link}
        target="_blank"
        rel="noopener noreferrer"
        className="serebii-link"
      >
        View on Serebii
      </a>

      <div className="encounter-section">
        {!generatedEncounter ? (
          <button onClick={generateEncounter} className="generate-button">
            Generate Encounter
          </button>
        ) : (
          <div className="encounter-result">
            <h2>Your Encounter:</h2>
            <div className="encounter-pokemon">
              <img
                src={getPokeDbSpriteUrl(generatedEncounter)}
                alt={generatedEncounter}
                className={`encounter-image${bounce ? " bounce" : ""}`}
              />
              <span className="encounter-name">{generatedEncounter}</span>
            </div>
            <button onClick={regenerateEncounter} className="regenerate-button">
              Regenerate Encounter
            </button>
            <button onClick={clearEncounter} className="clear-button">
              Clear Encounter
            </button>
          </div>
        )}
      </div>

      <div className="pokemon-grid">
        {availablePokemons.map((pokemon) => (
          <div
            key={pokemon}
            className={`pokemon-card ${
              generatedEncounter === pokemon ? "selected" : ""
            }`}
            onClick={() => handleManualSelect(pokemon)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={getPokeDbSpriteUrl(pokemon)}
              alt={pokemon}
              className="pokemon-image"
            />
            <span className="pokemon-name">{pokemon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
