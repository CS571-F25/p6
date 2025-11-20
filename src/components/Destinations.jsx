import DestinationCard from "./DestinationCard";
import destinations from "../data/destinations.json";

export default function Destinations() {
  return (
    <div className="container mt-4">
      <h2>Destinations</h2>

      <div className="row">
        {destinations.map((dest, idx) => (
          <div className="col-md-4" key={idx}>
            <DestinationCard
              name={dest.name}
              country={dest.country}
              image={dest.image}
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
