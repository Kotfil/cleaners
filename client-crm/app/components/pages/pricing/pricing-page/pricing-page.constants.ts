import { Service } from './pricing-page.types';

export const HOME_SIZE_OPTIONS = [
  { sqftRangeCode: 'LT1000_1BA', sqftLabel: 'Less than 1,000 sqft • 1 ba' },
  { sqftRangeCode: 'LT1000_1.5BA', sqftLabel: 'Less than 1,000 sqft • 1.5 ba' },
  { sqftRangeCode: 'LT1000_2BA', sqftLabel: 'Less than 1,000 sqft • 2 ba' },
  { sqftRangeCode: 'LT1000_2.5BA', sqftLabel: 'Less than 1,000 sqft • 2.5 ba' },
  { sqftRangeCode: '1001-1600_1BA', sqftLabel: '1,001–1,600 sqft • 1 ba' },
  { sqftRangeCode: '1001-1600_1.5BA', sqftLabel: '1,001–1,600 sqft • 1.5 ba' },
  { sqftRangeCode: '1001-1600_2BA', sqftLabel: '1,001–1,600 sqft • 2 ba' },
];

export const SERVICES_DATA: Record<string, Service[]> = {
  primary: [
    { id: '1', code: 'STANDARD', name: 'Standard', category: 'Primary Service', unit: 'hour', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 60, isAvailable: true },
    { id: '2', code: 'DEEP', name: 'Deep', category: 'Primary Service', unit: 'hour', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 60, isAvailable: true },
    { id: '3', code: 'MOVE-IN', name: 'Move-in', category: 'Primary Service', unit: 'hour', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 60, isAvailable: true },
    { id: '4', code: 'MOVE-OUT', name: 'Move-out', category: 'Primary Service', unit: 'hour', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 60, isAvailable: true },
    { id: '5', code: 'CUSTOM-HRS', name: 'Custom Hours', category: 'Primary Service', unit: 'hour', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 60, isAvailable: true },
  ],
  special: [
    { id: '10', code: 'CARP-BED', name: 'Carpet Cleaning - Bedrooms', category: 'Special Services', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
    { id: '11', code: 'CARP-LIVING', name: 'Carpet Cleaning - Living rooms', category: 'Special Services', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
    { id: '12', code: 'UPHOLSTERY', name: 'Upholstery Cleaning', category: 'Special Services', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
  ],
  addons: [
    { id: '50', code: 'ADD-DISH', name: 'Dishwashing', category: 'Addons', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
    { id: '51', code: 'ADD-FRIDGE', name: 'Refrigerator', category: 'Addons', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
    { id: '52', code: 'ADD-OVEN', name: 'Oven', category: 'Addons', unit: 'each', price: 0, offHoursPrice: 0, minQty: 1, minutesPerUnit: 30, isAvailable: true },
  ],
};

export const getDefaultHoursMatrix = () => {
  const matrix: any = {};
  HOME_SIZE_OPTIONS.forEach(homeSize => {
    matrix[homeSize.sqftRangeCode] = {
      STANDARD: 0,
      DEEP: 0,
      'MOVE-IN': 0,
      'MOVE-OUT': 0,
    };
  });
  return matrix;
};

export const getDefaultCrewSizeMatrix = () => {
  const matrix: any = {};
  for (let i = 0; i <= 35; i += 5) {
    const rangeKey = `${i}-${i + 5}`;
    matrix[rangeKey] = { min: 2, prefer: 3 };
  }
  return matrix;
};

