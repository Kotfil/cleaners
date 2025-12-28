import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../../iam/redis/redis.service';
import { AutocompleteSuggestion } from './models/autocomplete-suggestion.types';
import { PlaceDetails } from './models/place-details.types';

 

@Injectable()
export class GeoService {
  private readonly apiKey: string;
  private readonly autocompleteUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
  private readonly detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.apiKey = this.config.get<string>('GOOGLE_MAPS_API_KEY') || '';
  }

  async getAutocomplete(input: string, language = 'en', country?: string): Promise<AutocompleteSuggestion[]> {
    const cacheKey = `geo:auto:${language}:${country || 'any'}:${input}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as AutocompleteSuggestion[];
    }

    const params: Record<string, string> = {
      input,
      key: this.apiKey,
      types: 'address',
      language,
    };
    if (country) params.components = `country:${country}`;

    const { data } = await firstValueFrom(this.http.get(this.autocompleteUrl, { params }));
    const suggestions: AutocompleteSuggestion[] = (data?.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
    }));

    await this.redis.set(cacheKey, JSON.stringify(suggestions), 60 * 10);
    return suggestions;
  }

  async getDetails(placeId: string, language = 'en'): Promise<PlaceDetails | null> {
    const cacheKey = `geo:details:${placeId}:${language}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as PlaceDetails;
    }

    const { data } = await firstValueFrom(
      this.http.get(this.detailsUrl, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          language,
          fields: 'place_id,formatted_address,address_component,geometry',
        },
      }),
    );

    const result = data?.result;
    if (!result) return null;

    const components: Record<string, string> = {};
    for (const c of result.address_components || []) {
      const types: string[] = c.types || [];
      if (types.includes('street_number')) components.street_number = c.long_name;
      if (types.includes('route')) components.route = c.long_name;
      if (types.includes('locality')) components.city = c.long_name;
      if (types.includes('administrative_area_level_1')) components.state = c.short_name || c.long_name;
      if (types.includes('postal_code')) components.zip = c.long_name;
      if (types.includes('country')) components.country = c.short_name;
      if (types.includes('subpremise')) components.subpremise = c.long_name; // apt/suite
    }

    const addressLine1 = [components.route, components.street_number].filter(Boolean).join(' ');
    const addressLine2 = components.subpremise;
    const latitude: number | undefined = result.geometry?.location?.lat;
    const longitude: number | undefined = result.geometry?.location?.lng;

    const normalized: PlaceDetails = {
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      addressLine1: addressLine1 || undefined,
      addressLine2: addressLine2 || undefined,
      city: components.city,
      state: components.state,
      zipCode: components.zip,
      countryCode: components.country,
      latitude,
      longitude,
    };

    await this.redis.set(cacheKey, JSON.stringify(normalized), 60 * 60 * 24 * 7);
    return normalized;
  }
}


