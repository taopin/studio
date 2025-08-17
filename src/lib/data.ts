export type DataEntry = {
  timestamp: string;
  deviceId: string;
  sourceUnit: string;
  animalId: string;
  animalWeight: number;
};

// Generates a random date within the last 90 days
const randomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generates a random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const mockData: DataEntry[] = Array.from({ length: 150 }, (_, i) => {
    const deviceNum = randomInt(1, 5);
    const unitNum = Math.ceil(deviceNum / 2);
    return {
        timestamp: randomDate(),
        deviceId: `DEV-${String(deviceNum).padStart(3, '0')}`,
        sourceUnit: `Unit-${String.fromCharCode(64 + unitNum)}`,
        animalId: `ANI-${String(randomInt(1, 50)).padStart(4, '0')}`,
        animalWeight: parseFloat((Math.random() * (200 - 5) + 5).toFixed(2)),
    }
});

export const availableDevices = [...new Set(mockData.map(d => d.deviceId))];
