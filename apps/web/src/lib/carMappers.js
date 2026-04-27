import { resolveAssetUrl } from "./resolveApiUrl.js";
import { labelForVehicleType } from "./vehicleTypes.js";

/** Maps a public list/detail car from the API into the shape CarCard + detail UIs expect. */
export function mapApiCarToDisplay(car) {
  if (!car) return null;
  const price = Number(car.basePricePerDay ?? 0) || 0;
  const images = Array.isArray(car.images)
    ? car.images
        .filter(Boolean)
        .slice(0, 5)
        .map((u) => resolveAssetUrl(u))
    : [];
  return {
    id: car.id,
    name: car.title || [car.brand, car.model].filter(Boolean).join(" ") || "Vehicle",
    loc: (() => {
      const d = car.location?.district;
      const c = car.location?.city;
      if (d && c) return `${d} · ${c}`;
      return d || c || "Gilgit-Baltistan";
    })(),
    price,
    currency: car.currency || "PKR",
    fuel: car.fuelType || "—",
    seats: car.seats ?? "—",
    drive: car.transmission || "—",
    status: "available",
    rating: 5,
    trips: 0,
    image: images[0] || null,
    images,
    description: car.description,
    year: car.year,
    ownerName: car.ownerName,
    vehicleType: car.vehicleType,
    vehicleTypeLabel: labelForVehicleType(car.vehicleType),
    _raw: car,
  };
}
