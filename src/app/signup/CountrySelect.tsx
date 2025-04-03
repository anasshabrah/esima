// src/app/signup/CountrySelect.tsx

'use client';

import React from 'react';
import Select, { SingleValue } from 'react-select';
import countryList, { CountryData } from 'react-select-country-list';

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  ariaDescribedBy?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  error,
  touched,
  ariaDescribedBy,
}) => {
  const countries: CountryData[] = countryList().getData();

  const handleChange = (option: SingleValue<CountryData>) => {
    if (option) {
      onChange(option.value);
    } else {
      onChange('');
    }
  };

  const selectedOption = countries.find(
    (option: CountryData) => option.value === value
  ) || null;

  return (
    <div>
      <Select
        options={countries}
        onChange={handleChange}
        placeholder="Select your country"
        classNamePrefix="react-select"
        isClearable
        instanceId="country-select"
        value={selectedOption}
        aria-invalid={error && touched ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
      />
      {error && touched && (
        <p className="mt-2 text-sm text-red-600" id={ariaDescribedBy}>
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySelect;
