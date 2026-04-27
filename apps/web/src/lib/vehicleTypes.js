/** API values for Car.vehicleType (matches apps/api car.model enum). */
export const VEHICLE_TYPES = [
  { value: "suv_4wd", label: "SUV / 4WD" },
  { value: "jeep", label: "Jeep" },
  { value: "sedan", label: "Sedan" },
  { value: "van_coaster", label: "Van / Coaster" },
  { value: "pickup", label: "Pickup" },
  { value: "other", label: "Other" },
];

const LABEL_BY = Object.fromEntries(VEHICLE_TYPES.map((o) => [o.value, o.label]));

/**
 * @param {string | undefined} value
 * @returns {string}
 */
export function labelForVehicleType(value) {
  return (value && LABEL_BY[value]) || "Other";
}

export const defaultVehicleType = "suv_4wd";
