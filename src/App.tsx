import { useState, useEffect } from "react";
import { areas, type Area } from "./data/scarlet-violet";
import AreaComponent from "./components/Area";
import "./App.css";

export default function App() {
  const [area, setArea] = useState<Area>();
  const [gameVersion, setGameVersion] = useState("scarlet");

  // Read area and game version from URL and local storage on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const areaName = urlParams.get("area");
    if (areaName) {
      const foundArea = areas.find((a) => a.name === areaName);
      if (foundArea) {
        setArea(foundArea);
      }
    }

    // Load game version from local storage
    const savedVersion = localStorage.getItem("gameVersion");
    if (
      savedVersion &&
      (savedVersion === "scarlet" || savedVersion === "violet")
    ) {
      setGameVersion(savedVersion);
    }
  }, []);

  // Update URL when area changes
  const handleAreaChange = (selectedArea: Area | undefined) => {
    setArea(selectedArea);

    const urlParams = new URLSearchParams(window.location.search);
    if (selectedArea) {
      urlParams.set("area", selectedArea.name);
    } else {
      urlParams.delete("area");
    }

    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? "?" + urlParams.toString() : ""
    }`;
    window.history.pushState({}, "", newUrl);
  };

  // Update local storage when game version changes
  const handleGameVersionChange = (version: string) => {
    setGameVersion(version);
    localStorage.setItem("gameVersion", version);
  };

  // Clear all encounters from localStorage
  const handleClearAllEncounters = () => {
    localStorage.removeItem("encounters");
    // Optionally show a confirmation message or trigger a refresh
    alert("All encounters have been cleared!");
  };

  return (
    <div className="app-container">
      <div className="select-container">
        <select
          className="area-select"
          value={area?.name || ""}
          onChange={(e) => {
            const selectedArea = areas.find((a) => a.name === e.target.value);
            handleAreaChange(selectedArea);
          }}
        >
          <option value="">Select an area</option>
          {areas.map((area) => (
            <option key={area.name} value={area.name}>
              {area.name}
            </option>
          ))}
        </select>

        <select
          className="version-select"
          value={gameVersion}
          onChange={(e) => handleGameVersionChange(e.target.value)}
        >
          <option value="scarlet">Scarlet</option>
          <option value="violet">Violet</option>
        </select>
      </div>

      <div className="content-container">
        {area ? (
          <AreaComponent
            area={area}
            key={area.name}
            gameVersion={gameVersion}
          />
        ) : (
          <div className="no-selection">
            <p>Choose an area from the dropdown above to get started</p>
            <button
              onClick={handleClearAllEncounters}
              className="clear-all-button"
            >
              Clear All Encounters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
