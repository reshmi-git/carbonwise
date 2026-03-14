/**
 * CarbonWise — Frontend CSV Loader  v1.0
 * =========================================
 * Loads EPA + EEA CSV files from /public/data/ at runtime using Papa Parse.
 * Falls back to the hardcoded index.js values if CSVs are unavailable.
 *
 * Usage:
 *   import { loadAllData } from './csvLoader';
 *   const { CARS, GRID_DATA, GREENWASH_DB } = await loadAllData();
 */

// ── Papa Parse via CDN (loaded in index.html) or npm
// We use the global Papa if available, otherwise dynamic import
async function getPapa() {
  if (typeof window !== 'undefined' && window.Papa) return window.Papa;
  const mod = await import('papaparse');
  return mod.default || mod;
}

function safeFloat(val, fallback = null) {
  const n = parseFloat(String(val).trim());
  return isNaN(n) ? fallback : n;
}

function safeInt(val, fallback = 0) {
  const n = parseInt(String(val).trim(), 10);
  return isNaN(n) ? fallback : n;
}

async function parseCsv(url) {
  const Papa = await getPapa();
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

// ─────────────────────────────────────────────
//  1. Load EEA Lifecycle Emissions CSV
// ─────────────────────────────────────────────
async function loadEEALifecycle() {
  const rows = await parseCsv('/data/eea_lifecycle_emissions.csv');
  const records = {};
  for (const row of rows) {
    const key = row.vehicle_key?.trim();
    if (!key) continue;
    const battKwh  = safeFloat(row.battery_kwh, 0);
    let battDisp   = safeFloat(row.battery_disposal_co2_tonnes, 0);
    if (battDisp === 0 && battKwh > 0) battDisp = Math.round(battKwh * 0.14 * 1000) / 1000;

    records[key] = {
      mfg:         safeFloat(row.manufacturing_co2_tonnes, 0),
      battKwh,
      battDisp,
      kwhPer100km: safeFloat(row.kwh_per_100km_realworld),
      lPer100km:   safeFloat(row.litres_per_100km_realworld),
      lcaStandard: row.lca_standard?.trim() || '',
      mfgSrc:      row.mfg_emission_source?.trim() || '',
      battSrc:     row.battery_emission_source?.trim() || '',
      methodology: row.lifecycle_methodology?.trim() || '',
      segment:     row.vehicle_segment?.trim() || '',
      eeaLoaded:   true,
    };
  }
  console.log(`[CSV] EEA lifecycle: ${Object.keys(records).length} vehicles loaded`);
  return records;
}

// ─────────────────────────────────────────────
//  2. Load EPA Fuel Economy CSV
// ─────────────────────────────────────────────
async function loadEPAFuelEconomy() {
  const rows = await parseCsv('/data/epa_fuel_economy.csv');
  const records = {};
  for (const row of rows) {
    const key = row.vehicle_key?.trim();
    if (!key) continue;
    records[key] = {
      fuelType:          row.fuel_type?.trim() || '',
      cityMpg:           safeFloat(row.city_mpg),
      highwayMpg:        safeFloat(row.highway_mpg),
      combinedMpg:       row.combined_mpg?.trim() || '',
      co2TailpipeGpm:    safeFloat(row.co2_tailpipe_gpm, 0),
      annualFuelCost:    safeFloat(row.annual_fuel_cost_usd),
      ghgScore:          safeInt(row.ghg_score),
      airPollutionScore: safeInt(row.air_pollution_score),
      epaSource:         row.source?.trim() || '',
      epaLoaded:         true,
    };
  }
  console.log(`[CSV] EPA fuel economy: ${Object.keys(records).length} vehicles loaded`);
  return records;
}

// ─────────────────────────────────────────────
//  3. Load EEA Grid Intensity CSV
// ─────────────────────────────────────────────
async function loadEEAGridIntensity() {
  const rows = await parseCsv('/data/eea_grid_intensity.csv');
  const gridFlat = {};
  const gridRich = {};

  for (const row of rows) {
    const key = row.region_key?.trim();
    if (!key) continue;
    const intensity = safeFloat(row.intensity_kg_co2_per_kwh, 0.42);
    gridFlat[key] = intensity;
    gridRich[key] = {
      label:          row.region_label?.trim() || key,
      intensity,
      regionType:     row.region_type?.trim() || '',
      country:        row.country?.trim() || '',
      renewableShare: safeFloat(row.renewable_share_pct, 0),
      fossilShare:    safeFloat(row.fossil_share_pct, 100),
      nuclearShare:   safeFloat(row.nuclear_share_pct, 0),
      year:           row.year?.trim() || '2023',
      source:         row.source?.trim() || '',
      sourceUrl:      row.source_url?.trim() || '',
      notes:          row.notes?.trim() || '',
      csvLoaded:      true,
    };
  }
  console.log(`[CSV] Grid intensity: ${Object.keys(gridFlat).length} regions loaded`);
  return { gridFlat, gridRich };
}

// ─────────────────────────────────────────────
//  4. Load Greenwashing Claims CSV
// ─────────────────────────────────────────────
async function loadGreenwashingClaims() {
  const rows = await parseCsv('/data/greenwashing_claims.csv');
  const claims = rows.map(row => ({
    brand:      row.brand?.trim() || '',
    model:      row.model?.trim() || '',
    vehicleKey: row.vehicle_key?.trim() || '',
    claim:      row.claim_text?.trim() || '',
    claimType:  row.claim_type?.trim() || '',
    reality:    row.reality_check?.trim() || '',
    severity:   row.severity?.trim() || 'medium',
    verifiedBy: row.verified_by?.trim() || '',
    sourceDoc:  row.source_doc?.trim() || '',
    year:       row.year?.trim() || '',
  }));
  console.log(`[CSV] Greenwashing claims: ${claims.length} records loaded`);
  return claims;
}

// ─────────────────────────────────────────────
//  5. Static display meta (not in CSVs)
// ─────────────────────────────────────────────
export const STATIC_META = {
  'nexon-ev':      { name: 'Tata Nexon EV',             brand: 'Tata Motors',   type: 'ev',     price: '₹14–20L', tier: 'mid',  rating: 'A',  year: 2024 },
  'mg-zs-ev':      { name: 'MG ZS EV',                  brand: 'MG Motors',     type: 'ev',     price: '₹18–25L', tier: 'mid',  rating: 'A',  year: 2024 },
  'tiago-ev':      { name: 'Tata Tiago EV',             brand: 'Tata Motors',   type: 'ev',     price: '₹8–12L',  tier: 'low',  rating: 'A',  year: 2024 },
  'byd-atto3':     { name: 'BYD Atto 3',                brand: 'BYD',           type: 'ev',     price: '₹34–38L', tier: 'high', rating: 'A',  year: 2024 },
  'tesla-model3':  { name: 'Tesla Model 3 LR',          brand: 'Tesla',         type: 'ev',     price: '₹40–60L', tier: 'high', rating: 'A',  year: 2024 },
  'tigor-ev':      { name: 'Tata Tigor EV',             brand: 'Tata Motors',   type: 'ev',     price: '₹12–14L', tier: 'mid',  rating: 'A',  year: 2024 },
  'comet-ev':      { name: 'MG Comet EV',               brand: 'MG Motors',     type: 'ev',     price: '₹7–9L',   tier: 'low',  rating: 'A',  year: 2024 },
  'kia-ev6':       { name: 'Kia EV6',                   brand: 'Kia',           type: 'ev',     price: '₹60–65L', tier: 'high', rating: 'A',  year: 2024 },
  'prius':         { name: 'Toyota Prius',               brand: 'Toyota',        type: 'hybrid', price: '₹42–50L', tier: 'high', rating: 'A+', year: 2024 },
  'city-hybrid':   { name: 'Honda City Hybrid',         brand: 'Honda',         type: 'hybrid', price: '₹19–21L', tier: 'mid',  rating: 'A',  year: 2024 },
  'vitara-hybrid': { name: 'Maruti Grand Vitara Hybrid',brand: 'Maruti Suzuki', type: 'hybrid', price: '₹16–24L', tier: 'mid',  rating: 'A',  year: 2024 },
  'camry-hybrid':  { name: 'Toyota Camry Hybrid',       brand: 'Toyota',        type: 'hybrid', price: '₹46–50L', tier: 'high', rating: 'A',  year: 2024 },
  'hycross':       { name: 'Toyota Innova Hycross HEV', brand: 'Toyota',        type: 'hybrid', price: '₹24–31L', tier: 'high', rating: 'A',  year: 2024 },
  'swift':         { name: 'Maruti Swift',              brand: 'Maruti Suzuki', type: 'ice',    price: '₹6–9L',   tier: 'low',  rating: 'B',  year: 2024 },
  'creta':         { name: 'Hyundai Creta',             brand: 'Hyundai',       type: 'ice',    price: '₹11–20L', tier: 'mid',  rating: 'C',  year: 2024 },
  'innova':        { name: 'Toyota Innova Crysta',      brand: 'Toyota',        type: 'ice',    price: '₹20–27L', tier: 'mid',  rating: 'C',  year: 2024 },
  'brezza':        { name: 'Maruti Brezza',             brand: 'Maruti Suzuki', type: 'ice',    price: '₹8–14L',  tier: 'mid',  rating: 'B',  year: 2024 },
  'seltos':        { name: 'Kia Seltos',                brand: 'Kia',           type: 'ice',    price: '₹11–20L', tier: 'mid',  rating: 'C',  year: 2024 },
  'fortuner':      { name: 'Toyota Fortuner',           brand: 'Toyota',        type: 'ice',    price: '₹32–50L', tier: 'high', rating: 'C',  year: 2024 },
  'scorpio-n':     { name: 'Mahindra Scorpio N',        brand: 'Mahindra',      type: 'ice',    price: '₹13–24L', tier: 'mid',  rating: 'C',  year: 2024 },
};

// ─────────────────────────────────────────────
//  6. MASTER LOADER — merge everything
// ─────────────────────────────────────────────
let _cache = null;

export async function loadAllData() {
  if (_cache) return _cache;

  try {
    const [eea, epa, gridResult, gwClaims] = await Promise.all([
      loadEEALifecycle(),
      loadEPAFuelEconomy(),
      loadEEAGridIntensity(),
      loadGreenwashingClaims(),
    ]);

    const { gridFlat, gridRich } = gridResult;

    // Build merged CARS
    const CARS = {};
    for (const [key, meta] of Object.entries(STATIC_META)) {
      const eeaRec = eea[key] || {};
      const epaRec = epa[key] || {};
      CARS[key] = {
        ...meta,
        // EEA emissions data
        mfg:         eeaRec.mfg         ?? 0,
        battKwh:     eeaRec.battKwh     ?? 0,
        battDisp:    eeaRec.battDisp    ?? 0,
        kwhPer100km: eeaRec.kwhPer100km ?? null,
        lPer100km:   eeaRec.lPer100km   ?? null,
        lcaStandard: eeaRec.lcaStandard ?? '',
        mfgSrc:      eeaRec.mfgSrc      ?? '',
        battSrc:     eeaRec.battSrc     ?? '',
        methodology: eeaRec.methodology ?? '',
        segment:     eeaRec.segment     ?? '',
        // EPA ratings
        ghgScore:          epaRec.ghgScore          ?? null,
        airPollutionScore: epaRec.airPollutionScore ?? null,
        annualFuelCost:    epaRec.annualFuelCost    ?? null,
        epaSource:         epaRec.epaSource         ?? '',
        dataSource:        eeaRec.eeaLoaded ? 'EEA CSV + EPA CSV' : 'fallback',
      };
    }

    _cache = {
      CARS,
      GRID_DATA:    gridFlat,
      GRID_RICH:    gridRich,
      GREENWASH_DB: gwClaims,
      loaded:       true,
      sources: {
        eea: Object.keys(eea).length,
        epa: Object.keys(epa).length,
        grids: Object.keys(gridFlat).length,
        gwClaims: gwClaims.length,
      },
    };

    console.log('[CarbonWise] All CSV data loaded:', _cache.sources);
    return _cache;

  } catch (err) {
    console.warn('[CarbonWise] CSV load failed, falling back to hardcoded data:', err);
    // Lazy import fallback
    const fallback = await import('./index.js');
    return {
      CARS:         fallback.CARS,
      GRID_DATA:    Object.fromEntries(
        Object.entries(fallback.GRID_DATA).map(([k, v]) => [k, typeof v === 'object' ? (v.intensity ?? 0.82) : v])
      ),
      GRID_RICH:    fallback.GRID_DATA,
      GREENWASH_DB: fallback.GREENWASH_DB,
      loaded:       false,
      error:        err.message,
    };
  }
}

// ─────────────────────────────────────────────
//  7. Re-export helpers from index.js
// ─────────────────────────────────────────────

