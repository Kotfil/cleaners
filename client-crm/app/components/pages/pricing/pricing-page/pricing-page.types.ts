export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  offHoursPrice: number;
  minQty: number;
  minutesPerUnit: number;
  isAvailable?: boolean;
}

export interface HoursMatrix {
  [houseSizeCode: string]: {
    [serviceCode: string]: number;
  };
}

export interface CrewSizeMatrix {
  [laborHoursRange: string]: {
    min: number;
    prefer: number;
  };
}

export interface PriceBook {
  id: string;
  name: string;
  status: 'Draft' | 'Published';
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  services: Service[];
  hoursMatrix?: HoursMatrix;
  crewSizeMatrix?: CrewSizeMatrix;
}

export type ViewMode = 'services' | 'hours' | 'crew';

