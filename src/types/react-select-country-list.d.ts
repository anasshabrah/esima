// src/types/react-select-country-list.d.ts

declare module 'react-select-country-list' {
  export interface CountryData {
    label: string;
    value: string;
  }

  export default function countryList(): {
    getData: () => CountryData[];
    // Add other methods if needed
  };
}
