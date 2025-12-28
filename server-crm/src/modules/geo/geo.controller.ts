import { Controller, Get, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { AutocompleteSuggestion } from './models/autocomplete-suggestion.types';
import { PlaceDetails } from './models/place-details.types';

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('autocomplete')
  async autocomplete(
    @Query('input') input: string,
    @Query('language') language?: string,
    @Query('country') country?: string,
  ): Promise<AutocompleteSuggestion[]> {
    if (!input || input.trim().length < 2) return [];
    return this.geoService.getAutocomplete(input.trim(), language || 'en', country);
  }

  @Get('details')
  async details(
    @Query('placeId') placeId: string,
    @Query('language') language?: string,
  ): Promise<PlaceDetails | null> {
    if (!placeId) return null;
    return this.geoService.getDetails(placeId, language || 'en');
  }
}


