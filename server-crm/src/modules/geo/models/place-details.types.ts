export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
}


