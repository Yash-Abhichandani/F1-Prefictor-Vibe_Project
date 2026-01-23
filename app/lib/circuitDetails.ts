export interface CircuitDetail {
  id: string; // matches the Code (AUS, BHR, etc)
  lengthKM: string;
  laps: number;
  lapRecord: {
    time: string;
    driver: string;
    year: string;
  };
}

export const CIRCUIT_DETAILS: Record<string, CircuitDetail> = {
  AUS: { id: "AUS", lengthKM: "5.278", laps: 58, lapRecord: { time: "1:14.127", driver: "Pérez", year: "2024" } },
  BHR: { id: "BHR", lengthKM: "5.412", laps: 57, lapRecord: { time: "1:31.447", driver: "De la Rosa", year: "2005" } },
  SAU: { id: "SAU", lengthKM: "6.174", laps: 50, lapRecord: { time: "1:27.472", driver: "Hamilton", year: "2021" } },
  JPN: { id: "JPN", lengthKM: "5.807", laps: 53, lapRecord: { time: "1:30.983", driver: "Hamilton", year: "2019" } },
  CHN: { id: "CHN", lengthKM: "5.451", laps: 56, lapRecord: { time: "1:31.095", driver: "Schumacher", year: "2004" } },
  MIA: { id: "MIA", lengthKM: "5.412", laps: 57, lapRecord: { time: "1:27.241", driver: "Verstappen", year: "2023" } },
  EMI: { id: "EMI", lengthKM: "4.909", laps: 63, lapRecord: { time: "1:15.117", driver: "Hamilton", year: "2020" } },
  MCO: { id: "MCO", lengthKM: "3.337", laps: 78, lapRecord: { time: "1:10.166", driver: "Hamilton", year: "2019" } },
  ESP: { id: "ESP", lengthKM: "4.657", laps: 66, lapRecord: { time: "1:11.383", driver: "Norris", year: "2024" } },
  CAN: { id: "CAN", lengthKM: "4.361", laps: 70, lapRecord: { time: "1:13.078", driver: "Bottas", year: "2019" } },
  AUT: { id: "AUT", lengthKM: "4.318", laps: 71, lapRecord: { time: "1:05.619", driver: "Sainz", year: "2020" } },
  GBR: { id: "GBR", lengthKM: "5.891", laps: 52, lapRecord: { time: "1:26.720", driver: "Hamilton", year: "2020" } },
  HUN: { id: "HUN", lengthKM: "4.381", laps: 70, lapRecord: { time: "1:16.627", driver: "Hamilton", year: "2020" } },
  BEL: { id: "BEL", lengthKM: "7.004", laps: 44, lapRecord: { time: "1:41.252", driver: "Hamilton", year: "2020" } },
  NED: { id: "NED", lengthKM: "4.259", laps: 72, lapRecord: { time: "1:10.567", driver: "Hamilton", year: "2021" } },
  ITA: { id: "ITA", lengthKM: "5.793", laps: 53, lapRecord: { time: "1:21.046", driver: "Barrichello", year: "2004" } },
  MAD: { id: "MAD", lengthKM: "5.474", laps: 55, lapRecord: { time: "TBD", driver: "-", year: "2026" } },
  AZE: { id: "AZE", lengthKM: "6.003", laps: 51, lapRecord: { time: "1:40.495", driver: "Leclerc", year: "2019" } },
  SGP: { id: "SGP", lengthKM: "4.940", laps: 62, lapRecord: { time: "1:35.867", driver: "Hamilton", year: "2023" } },
  USA: { id: "USA", lengthKM: "5.513", laps: 56, lapRecord: { time: "1:36.169", driver: "Leclerc", year: "2019" } },
  MEX: { id: "MEX", lengthKM: "4.304", laps: 71, lapRecord: { time: "1:17.774", driver: "Bottas", year: "2021" } },
  BRA: { id: "BRA", lengthKM: "4.309", laps: 71, lapRecord: { time: "1:10.540", driver: "Bottas", year: "2018" } },
  LVS: { id: "LVS", lengthKM: "6.201", laps: 50, lapRecord: { time: "1:35.490", driver: "Piastri", year: "2023" } },
  QAT: { id: "QAT", lengthKM: "5.419", laps: 57, lapRecord: { time: "1:24.319", driver: "Verstappen", year: "2023" } },
  ABU: { id: "ABU", lengthKM: "5.281", laps: 58, lapRecord: { time: "1:26.103", driver: "Verstappen", year: "2021" } },
};
