export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  free: boolean;
}

export interface ShippingResult {
  options: ShippingOption[];
  freeShipping: boolean;
}

// DDDs por estado/região
const DDD_BY_STATE: Record<string, string[]> = {
  RJ: ["21", "22", "24"],
  SP: ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
  MG: ["31", "32", "33", "34", "35", "37", "38"],
  ES: ["27", "28"],
  PR: ["41", "42", "43", "44", "45", "46"],
  SC: ["47", "48", "49"],
  RS: ["51", "53", "54", "55"],
  BA: ["71", "72", "73", "74", "75", "77"],
  SE: ["79"],
  PE: ["81", "87"],
  AL: ["82"],
  PB: ["83"],
  RN: ["84"],
  CE: ["85", "88"],
  PI: ["86", "89"],
  MA: ["98", "99"],
  PA: ["91", "93", "94"],
  AP: ["96"],
  AM: ["92", "97"],
  RR: ["95"],
  TO: ["63"],
  GO: ["62", "64"],
  MT: ["65", "66"],
  MS: ["67"],
  DF: ["61"],
  AC: ["68"],
  RO: ["69"],
};

const SOUTHEAST_STATES = ["RJ", "SP", "MG", "ES"];

function getDDDFromCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, "");
  if (cleanCEP.length < 3) return "";
  return cleanCEP.substring(0, 3);
}

function getStateByDDD(ddd: string): string | null {
  for (const [state, ddds] of Object.entries(DDD_BY_STATE)) {
    if (ddds.includes(ddd)) return state;
  }
  return null;
}

function getRegion(cep: string): "rj" | "southeast" | "other" {
  const ddd = getDDDFromCEP(cep);
  if (!ddd) return "other";
  
  const state = getStateByDDD(ddd);
  if (!state) return "other";
  
  if (state === "RJ") return "rj";
  if (SOUTHEAST_STATES.includes(state)) return "southeast";
  return "other";
}

export function calculateShipping(
  cepDestino: string,
  pesoKg: number,
  valorProdutos: number
): ShippingResult {
  const freeShipping = valorProdutos >= 299;
  const region = getRegion(cepDestino);
  
  let pacPrice = 0;
  let sedexPrice = 0;
  
  if (freeShipping) {
    pacPrice = 0;
    sedexPrice = 0;
  } else {
    switch (region) {
      case "rj":
        pacPrice = 15;
        sedexPrice = 25;
        break;
      case "southeast":
        pacPrice = 20;
        sedexPrice = 35;
        break;
      case "other":
        pacPrice = 28;
        sedexPrice = 45;
        break;
    }
    
    // Adicionar R$2 por kg acima de 1kg
    if (pesoKg > 1) {
      const extraWeight = Math.ceil(pesoKg - 1);
      pacPrice += extraWeight * 2;
      sedexPrice += extraWeight * 3;
    }
  }
  
  const options: ShippingOption[] = [
    {
      id: "pac",
      name: "PAC",
      price: pacPrice,
      days: "8-12 dias úteis",
      free: freeShipping,
    },
    {
      id: "sedex",
      name: "SEDEX",
      price: sedexPrice,
      days: "2-4 dias úteis",
      free: freeShipping,
    },
  ];
  
  return {
    options,
    freeShipping,
  };
}
