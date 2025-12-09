import { useState, useMemo } from "react";
import DestinationCard from "./DestinationCard";
import destinations from "../data/destinations.json";

export default function Destinations() {
  const [sortBy, setSortBy] = useState("none");

  const parseMiles = (dest) => dest.distanceFromMadison?.miles ?? Infinity;

  const parsePrice = (priceStr) => {
    if (!priceStr) return Infinity;
    const num = priceStr.match(/\d+/);
    return num ? Number(num[0]) : Infinity;
  };

  const effortRank = {
    "Low": 1,
    "Low to Moderate": 2,
    "Moderate": 3,
    "Moderate to High": 4,
    "High": 5
  };

  const parseEffort = (level) => effortRank[level] ?? Infinity;

  const sortedDestinations = useMemo(() => {
    let sorted = [...destinations];

    switch (sortBy) {
      case "distance-asc":
        sorted.sort((a, b) => parseMiles(a) - parseMiles(b));
        break;
      case "distance-desc":
        sorted.sort((a, b) => parseMiles(b) - parseMiles(a));
        break;
      case "price-asc":
        sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "visitors-desc":
        sorted.sort((a, b) => b.annualVisitors - a.annualVisitors);
        break;
      case "visitors-asc":
        sorted.sort((a, b) => a.annualVisitors - b.annualVisitors);
        break;
      case "effort-asc":
        sorted.sort((a, b) => parseEffort(a.effortLevel) - parseEffort(b.effortLevel));
        break;
      case "effort-desc":
        sorted.sort((a, b) => parseEffort(b.effortLevel) - parseEffort(a.effortLevel));
        break;
      default:
        break;
    }

    return sorted;
  }, [sortBy]);

  return (
    <div className="container mt-4" role="region" aria-labelledby="destination-heading">
      
      <h1 id="destination-heading">Destinations</h1>

      {/* ---- Sorting Dropdown with Accessible Label ---- */}
      <div
        className="mb-3"
        style={{
          maxWidth: "260px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        <label
          htmlFor="sort-select"
          className="form-label fw-semibold"
          style={{ marginBottom: "0.5rem" }}
        >
          Sort destinations
        </label>

        <select
          id="sort-select"
          className="form-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="none">Sort By...</option>
          <option value="distance-asc">Distance (Closest First)</option>
          <option value="distance-desc">Distance (Farthest First)</option>
          <option value="price-asc">Price (Lowest First)</option>
          <option value="price-desc">Price (Highest First)</option>
          <option value="visitors-desc">Annual Visitors (Most First)</option>
          <option value="visitors-asc">Annual Visitors (Least First)</option>
          <option value="effort-asc">Effort Level (Easiest First)</option>
          <option value="effort-desc">Effort Level (Hardest First)</option>
        </select>
      </div>

      <div className="row">
        {sortedDestinations.map((dest, idx) => (
          <div className="col-md-4" key={idx}>
            <DestinationCard
              name={dest.name}
              country={dest.country}
              image={dest.image}
              altText={dest.altText}
              description={dest.description}
              distance={dest.distanceFromMadison}
              activities={dest.activities}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
