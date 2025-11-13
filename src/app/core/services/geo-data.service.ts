import { Injectable } from '@angular/core';

export interface Country {
  code: string;
  name: string;
}

export interface Region {
  code: string;
  name: string;
  countryCode: string;
}

export interface City {
  name: string;
  regionCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeoDataService {
  private countries: Country[] = [
    { code: 'CL', name: 'Chile' },
    { code: 'AR', name: 'Argentina' },
    { code: 'PE', name: 'Perú' },
    { code: 'CO', name: 'Colombia' },
    { code: 'MX', name: 'México' }
  ];

  private regions: Region[] = [
    // Chile
    { code: 'CL-AI', name: 'Arica y Parinacota', countryCode: 'CL' },
    { code: 'CL-TA', name: 'Tarapacá', countryCode: 'CL' },
    { code: 'CL-AN', name: 'Antofagasta', countryCode: 'CL' },
    { code: 'CL-AT', name: 'Atacama', countryCode: 'CL' },
    { code: 'CL-CO', name: 'Coquimbo', countryCode: 'CL' },
    { code: 'CL-VS', name: 'Valparaíso', countryCode: 'CL' },
    { code: 'CL-RM', name: 'Metropolitana de Santiago', countryCode: 'CL' },
    { code: 'CL-LI', name: "Libertador General Bernardo O'Higgins", countryCode: 'CL' },
    { code: 'CL-ML', name: 'Maule', countryCode: 'CL' },
    { code: 'CL-NB', name: 'Ñuble', countryCode: 'CL' },
    { code: 'CL-BI', name: 'Biobío', countryCode: 'CL' },
    { code: 'CL-AR', name: 'La Araucanía', countryCode: 'CL' },
    { code: 'CL-LR', name: 'Los Ríos', countryCode: 'CL' },
    { code: 'CL-LL', name: 'Los Lagos', countryCode: 'CL' },
    { code: 'CL-AY', name: 'Aysén del General Carlos Ibáñez del Campo', countryCode: 'CL' },
    { code: 'CL-MA', name: 'Magallanes y de la Antártica Chilena', countryCode: 'CL' },

    // Argentina - principales provincias
    { code: 'AR-B', name: 'Buenos Aires', countryCode: 'AR' },
    { code: 'AR-C', name: 'Ciudad Autónoma de Buenos Aires', countryCode: 'AR' },
    { code: 'AR-X', name: 'Córdoba', countryCode: 'AR' },
    { code: 'AR-S', name: 'Santa Fe', countryCode: 'AR' },
    { code: 'AR-M', name: 'Mendoza', countryCode: 'AR' },
    { code: 'AR-T', name: 'Tucumán', countryCode: 'AR' },

    // Perú - principales departamentos
    { code: 'PE-LIM', name: 'Lima', countryCode: 'PE' },
    { code: 'PE-ANC', name: 'Ancash', countryCode: 'PE' },
    { code: 'PE-ARE', name: 'Arequipa', countryCode: 'PE' },
    { code: 'PE-CAJ', name: 'Cajamarca', countryCode: 'PE' },
    { code: 'PE-CUS', name: 'Cusco', countryCode: 'PE' },
    { code: 'PE-LAL', name: 'La Libertad', countryCode: 'PE' },

    // Colombia - principales departamentos
    { code: 'CO-DC', name: 'Bogotá D.C.', countryCode: 'CO' },
    { code: 'CO-ANT', name: 'Antioquia', countryCode: 'CO' },
    { code: 'CO-ATL', name: 'Atlántico', countryCode: 'CO' },
    { code: 'CO-BOL', name: 'Bolívar', countryCode: 'CO' },
    { code: 'CO-VAC', name: 'Valle del Cauca', countryCode: 'CO' },

    // México - principales estados
    { code: 'MX-CMX', name: 'Ciudad de México', countryCode: 'MX' },
    { code: 'MX-JAL', name: 'Jalisco', countryCode: 'MX' },
    { code: 'MX-NLE', name: 'Nuevo León', countryCode: 'MX' },
    { code: 'MX-BCN', name: 'Baja California', countryCode: 'MX' },
    { code: 'MX-VER', name: 'Veracruz', countryCode: 'MX' }
  ];

  private cities: City[] = [
    // Región Metropolitana - Chile
    { name: 'Santiago', regionCode: 'CL-RM' },
    { name: 'Maipú', regionCode: 'CL-RM' },
    { name: 'Puente Alto', regionCode: 'CL-RM' },
    { name: 'La Florida', regionCode: 'CL-RM' },
    { name: 'Las Condes', regionCode: 'CL-RM' },
    { name: 'Providencia', regionCode: 'CL-RM' },
    { name: 'Ñuñoa', regionCode: 'CL-RM' },

    // Valparaíso - Chile
    { name: 'Valparaíso', regionCode: 'CL-VS' },
    { name: 'Viña del Mar', regionCode: 'CL-VS' },
    { name: 'Quilpué', regionCode: 'CL-VS' },
    { name: 'Villa Alemana', regionCode: 'CL-VS' },

    // Biobío - Chile
    { name: 'Concepción', regionCode: 'CL-BI' },
    { name: 'Talcahuano', regionCode: 'CL-BI' },
    { name: 'Los Ángeles', regionCode: 'CL-BI' },
    { name: 'Chillán', regionCode: 'CL-BI' },

    // Antofagasta - Chile
    { name: 'Antofagasta', regionCode: 'CL-AN' },
    { name: 'Calama', regionCode: 'CL-AN' },

    // La Araucanía - Chile
    { name: 'Temuco', regionCode: 'CL-AR' },
    { name: 'Angol', regionCode: 'CL-AR' },

    // Argentina
    { name: 'Buenos Aires', regionCode: 'AR-C' },
    { name: 'La Plata', regionCode: 'AR-B' },
    { name: 'Córdoba', regionCode: 'AR-X' },
    { name: 'Rosario', regionCode: 'AR-S' },
    { name: 'Mendoza', regionCode: 'AR-M' },

    // Perú
    { name: 'Lima', regionCode: 'PE-LIM' },
    { name: 'Arequipa', regionCode: 'PE-ARE' },
    { name: 'Cusco', regionCode: 'PE-CUS' },
    { name: 'Trujillo', regionCode: 'PE-LAL' },

    // Colombia
    { name: 'Bogotá', regionCode: 'CO-DC' },
    { name: 'Medellín', regionCode: 'CO-ANT' },
    { name: 'Barranquilla', regionCode: 'CO-ATL' },
    { name: 'Cali', regionCode: 'CO-VAC' },

    // México
    { name: 'Ciudad de México', regionCode: 'MX-CMX' },
    { name: 'Guadalajara', regionCode: 'MX-JAL' },
    { name: 'Monterrey', regionCode: 'MX-NLE' },
    { name: 'Tijuana', regionCode: 'MX-BCN' }
  ];

  getCountries(): Country[] {
    return this.countries;
  }

  getRegionsByCountry(countryCode: string): Region[] {
    return this.regions.filter(region => region.countryCode === countryCode);
  }

  getCitiesByRegion(regionCode: string): City[] {
    return this.cities.filter(city => city.regionCode === regionCode);
  }
}
