/**
 * Curated options for add-listing brand / model (Pakistan market).
 * Model list updates when brand changes; use getModelsForBrand().
 */

export const CAR_BRANDS = ["Toyota", "Honda", "Suzuki", "Kia", "Other"];

/** @type {Record<string, string[]>} */
const CAR_MODELS_BY_BRAND = {
  Toyota: [
    "Prado TX",
    "Prado TZ",
    "Corolla G",
    "Corolla X",
    "Premio F",
    "Premio X",
    "Premio G",
    "Land Cruiser",
    "Fortuner",
    "RAV4",
    "Other (Toyota)",
  ],
  Honda: [
    "City (5th / 6th / 7th gen)",
    "Civic (FD / FC / 11th gen / RS / Oriel)",
    "Civic (other)",
    "BR-V",
    "VEZEL (HR-V)",
    "CR-V",
    "Grace / Fit / Jazz",
    "Freed / Stepwgn",
    "Accord / Inspire",
    "Other (Honda)",
  ],
  Suzuki: [
    "Cultus / Celerio (new)",
    "Wagon R (new / 2nd gen)",
    "Swift (1.3 / 1.5)",
    "Alto (660 / 800)",
    "Jimny (JB / new)",
    "Ciaz / Baleno (older)",
    "APV (van / Mega)",
    "Bolan (Carry / Every)",
    "Ravi (pickup)",
    "Grand Vitara / Vitara (older)",
    "Liana / Aerio",
    "Other (Suzuki)",
  ],
  Kia: [
    "Picanto (Morning)",
    "Sportage",
    "Sorento (older)",
    "Carnival / Grand Carnival",
    "Stonic (Sportage CUV)",
    "Cerato / Forte (older)",
    "Pregio / Pregio van",
    "Other (Kia)",
  ],
  Other: ["Not listed (specify in description)"],
};

const FALLBACK_MODELS = ["Not listed (specify in description)"];

/**
 * @param {string} brand
 * @returns {string[]}
 */
export function getModelsForBrand(brand) {
  if (!brand) return FALLBACK_MODELS;
  return CAR_MODELS_BY_BRAND[brand] || FALLBACK_MODELS;
}

export const CAR_COLORS = [
  "Beige",
  "Black",
  "Blue",
  "Brown",
  "Burgundy",
  "Champagne",
  "Gold",
  "Gray",
  "Green",
  "Maroon",
  "Orange",
  "Pearl white",
  "Purple",
  "Red",
  "Silver",
  "Teal",
  "White",
  "Yellow",
  "Other",
];

export const defaultBrand = "Toyota";

/**
 * @param {string} brand
 * @returns {string}
 */
export function defaultModelForBrand(brand) {
  const m = getModelsForBrand(brand);
  return m[0] || "Other (Toyota)";
}
