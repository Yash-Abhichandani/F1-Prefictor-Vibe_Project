export type DriverConfig = {
    name: string;
    number: string;
};

export type TeamConfig = {
    name: string;
    abbreviation: string; // "SF", "MCL", etc.
    color: string;
    fgColor: string;
    logo: string;
    drivers: Record<string, DriverConfig>;
};

export const GRID_DATA: Record<string, TeamConfig> = {
  ferrari: {
    name: "Scuderia Ferrari",
    abbreviation: "SF",
    color: "#FF1801", // Brand Red
    fgColor: "#FFFFFF",
    logo: "https://cdn.simpleicons.org/ferrari/FF1801", 
    drivers: {
      leclerc: { name: "Charles Leclerc", number: "16" },
      hamilton: { name: "Lewis Hamilton", number: "44" }
    }
  },
  mclaren: {
    name: "McLaren F1 Team",
    abbreviation: "MCL",
    color: "#FF8700", // Papaya Orange
    fgColor: "#000000",
    logo: "https://cdn.simpleicons.org/mclaren/FF8700",
    drivers: {
      norris: { name: "Lando Norris", number: "4" },
      piastri: { name: "Oscar Piastri", number: "81" }
    }
  },
  mercedes: {
    name: "Mercedes-AMG",
    abbreviation: "MER",
    color: "#00D2BE", // Petronas Cyan
    fgColor: "#000000",
    logo: "https://cdn.simpleicons.org/mercedes/00D2BE",
    drivers: {
      russell: { name: "George Russell", number: "63" },
      antonelli: { name: "Kimi Antonelli", number: "12" }
    }
  },
  redbull: {
    name: "Red Bull Racing",
    abbreviation: "RBR",
    color: "#1E41FF", // Blue (adjusted for visibility)
    fgColor: "#FFFFFF",
    logo: "https://cdn.simpleicons.org/redbull/1E41FF",
    drivers: {
      verstappen: { name: "Max Verstappen", number: "1" },
      lawson: { name: "Liam Lawson", number: "30" }
    }
  },
  astonmartin: {
    name: "Aston Martin F1",
    abbreviation: "AMR",
    color: "#00594F", // British Racing Green
    fgColor: "#FFFFFF",
    logo: "https://cdn.simpleicons.org/astonmartin/00594F",
    drivers: {
      alonso: { name: "Fernando Alonso", number: "14" },
      stroll: { name: "Lance Stroll", number: "18" }
    }
  },
  alpine: {
      name: "BWT Alpine F1",
      abbreviation: "ALP",
      color: "#FF87BC", // BWT Pink
      fgColor: "#000000",
      logo: "https://cdn.simpleicons.org/alpine/FF87BC",
      drivers: {
          gasly: { name: "Pierre Gasly", number: "10" },
          doohan: { name: "Jack Doohan", number: "7" }
      }
  },
  williams: {
      name: "Williams Racing",
      abbreviation: "WIL",
      color: "#00A0DE", // Williams Blue
      fgColor: "#FFFFFF",
      logo: "https://cdn.simpleicons.org/williams/00A0DE",
      drivers: {
          albon: { name: "Alex Albon", number: "23" },
          sainz: { name: "Carlos Sainz", number: "55" }
      }
  },
  rb: {
      name: "Visa Cash App RB",
      abbreviation: "VCARB",
      color: "#1434CB", // RB VCARB Blue
      fgColor: "#FFFFFF",
      logo: "https://cdn.simpleicons.org/redbull/1434CB",
      drivers: {
          tsunoda: { name: "Yuki Tsunoda", number: "22" },
          hadjar: { name: "Isack Hadjar", number: "6" },
      }
  },
  haas: {
      name: "MoneyGram Haas F1",
      abbreviation: "HAA",
      color: "#B6BABD", // Haas Grey/White
      fgColor: "#000000",
      logo: "https://cdn.simpleicons.org/haas/B6BABD",
      drivers: {
          ocon: { name: "Esteban Ocon", number: "31" },
          bearman: { name: "Oliver Bearman", number: "87" }
      }
  },
  audi: {
      name: "Audi F1 Team",
      abbreviation: "AUD",
      color: "#FF0000", // Audi Red (adjusted for visibility)
      fgColor: "#FFFFFF",
      logo: "https://cdn.simpleicons.org/audi/FF0000",
      drivers: {
          hulkenberg: { name: "Nico Hulkenberg", number: "27" },
          bortoleto: { name: "Gabriel Bortoleto", number: "9" }
      }
  }
};
