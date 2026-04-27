/**
 * Same curated lists as apps/web/src/lib/vehicleOptions.js (keep in sync when options change).
 * Exposes window.GBVehicleOptions for static add-listing page.
 */
(function (global) {
  "use strict";
  var BY_BRAND = {
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
  var CAR_BRANDS = ["Toyota", "Honda", "Suzuki", "Kia", "Other"];
  var FALLBACK = ["Not listed (specify in description)"];
  function getModelsForBrand(brand) {
    if (!brand) return FALLBACK;
    return BY_BRAND[brand] || FALLBACK;
  }
  var CAR_COLORS = [
    "Beige", "Black", "Blue", "Brown", "Burgundy", "Champagne", "Gold", "Gray", "Green", "Maroon", "Orange", "Pearl white",
    "Purple", "Red", "Silver", "Teal", "White", "Yellow", "Other",
  ];
  var defaultBrand = "Toyota";
  global.GBVehicleOptions = {
    CAR_BRANDS: CAR_BRANDS,
    CAR_COLORS: CAR_COLORS,
    getModelsForBrand: getModelsForBrand,
    defaultBrand: defaultBrand,
  };
})(typeof window !== "undefined" ? window : global);
