// src/components/HeroSection.tsx

'use client';

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  memo,
  useCallback,
} from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Fuse from 'fuse.js';
import {
  FaSpinner,
  FaPlane,
  FaGlobe,
  FaMapMarkerAlt,
  FaSuitcaseRolling,
  FaWifi,
  FaEnvelope,
} from 'react-icons/fa';
import { Country, HeroSectionRef } from '@/types/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { getCountryName } from '@/lib/countryTranslations';
import logger from '@/utils/logger.client';

const Modal = dynamic(() => import('./Modal'), { ssr: false });

type DebouncedFunction = ((...args: any[]) => void) & { cancel: () => void };

const useDebounce = (func: (...args: any[]) => void, delay: number): DebouncedFunction => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  (debouncedFunction as DebouncedFunction).cancel = cancel;

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return debouncedFunction as DebouncedFunction;
};

const HeroSection = forwardRef<HeroSectionRef, {}>((_, ref) => {
  const { t, direction, language } = useTranslations();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCountries, setFilteredCountries] = useState<Country[] | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<Country> | null>(null);
  const [countriesData, setCountriesData] = useState<Country[] | null>(null);

  const { setCurrency, setExchangeRate, setCountryIso } = useCurrency();

  const words = useMemo<string[]>(
    () => [
      t('heroSection.typingEffectTurkey'),
      t('heroSection.typingEffectEurope'),
      t('heroSection.typingEffectFrance'),
      t('heroSection.typingEffectSaudiArabia'),
      t('heroSection.typingEffectAsia'),
      t('heroSection.search.placeholder'),
    ],
    [t, language]
  );

  const typingSpeed: number = 150;
  const deletingSpeed: number = 50;
  const delayBetweenWords: number = 2000;
  const [placeholderText, setPlaceholderText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    focusSearchInput: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    },
  }));

  async function safeFetch<T>(
    url: string,
    options?: RequestInit,
    defaultError?: string
  ): Promise<T> {
    try {
      const response = await fetch(url, options);
      const data: any = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || defaultError || 'An error occurred';
        throw new Error(errorMsg);
      }
      return data as T;
    } catch (error: any) {
      logger.error(`Error fetching ${url}: ${error.message}`);
      throw new Error(error.message || defaultError || 'An unknown error occurred');
    }
  }

  const handleSearch = useCallback(async (term: string) => {
    if (term.trim().length > 0) {
      setIsLoading(true);
      setFetchError('');
      if (!fuseRef.current || !countriesData) {
        try {
          const data: Country[] = await safeFetch<Country[]>(
            `/api/get-all-countries`,
            undefined,
            t('heroSection.error.fetchCountries')
          );
          const updatedData = data.map((country) => ({
            ...country,
            names: [getCountryName(country.iso, language)],
          }));
          setCountriesData(updatedData);
          fuseRef.current = new Fuse(updatedData, {
            keys: ['names'],
            threshold: 0.5,
            ignoreLocation: true,
          });
          const results = fuseRef.current.search(term);
          const filtered = results.map((result) => result.item);
          setFilteredCountries(filtered);
        } catch (error: any) {
          setFetchError(error.message || t('heroSection.error.fetchCountries'));
          setFilteredCountries([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        try {
          const results = fuseRef.current.search(term);
          const filtered = results.map((result) => result.item);
          setFilteredCountries(filtered);
        } catch (error: unknown) {
          setFetchError(t('heroSection.error.search'));
          setFilteredCountries([]);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      setFilteredCountries(null);
      setFetchError('');
      setIsLoading(false);
    }
  }, [countriesData, t, language]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
    setFilteredCountries(null);
    setSearchTerm('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/flags/global.svg';
  };

  useEffect(() => {
    setPlaceholderText('');
    setIsDeleting(false);
    setCurrentWordIndex(0);
    setCurrentCharIndex(0);
  }, [words]);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let typingTimeout: NodeJS.Timeout;

    if (isDeleting) {
      if (currentCharIndex > 0) {
        typingTimeout = setTimeout(() => {
          setPlaceholderText(currentWord.substring(0, currentCharIndex - 1));
          setCurrentCharIndex(currentCharIndex - 1);
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (currentCharIndex < currentWord.length) {
        typingTimeout = setTimeout(() => {
          setPlaceholderText(currentWord.substring(0, currentCharIndex + 1));
          setCurrentCharIndex(currentCharIndex + 1);
        }, typingSpeed);
      } else {
        typingTimeout = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenWords);
      }
    }

    return () => clearTimeout(typingTimeout);
  }, [
    isDeleting,
    currentCharIndex,
    currentWordIndex,
    words,
    deletingSpeed,
    typingSpeed,
    delayBetweenWords,
  ]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const translatedCountryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (countriesData) {
      countriesData.forEach((country) => {
        map.set(country.iso, getCountryName(country.iso, language) || country.name);
      });
    }
    return map;
  }, [countriesData, language]);

  return (
    <section className="bg-gray-50 pt-2 sm:pt-6 pb-6 relative overflow-hidden">
      <div className="container mx-auto text-center border border-gray-300 rounded-lg shadow-lg p-6 bg-blue-20 relative z-10 overflow-hidden">
        <FaPlane
          className={classNames(
            'hidden lg:block absolute top-10 left-10 text-highlight-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform rotate-12',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <FaGlobe
          className={classNames(
            'hidden lg:block absolute top-20 right-10 text-green-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform rotate-45',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <FaMapMarkerAlt
          className={classNames(
            'hidden lg:block absolute bottom-10 left-10 text-red-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <FaSuitcaseRolling
          className={classNames(
            'hidden lg:block absolute bottom-20 right-10 text-yellow-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform rotate-30',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <FaWifi
          className={classNames(
            'hidden xl:block absolute top-1/2 left-10 text-purple-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform -translate-y-1/2 rotate-15',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <FaEnvelope
          className={classNames(
            'hidden xl:block absolute top-1/2 right-10 text-pink-400 opacity-20 text-4xl sm:text-6xl md:text-8xl transform -translate-y-1/2 rotate-165',
            {
              'hidden rtl:block': direction === 'rtl',
              'block rtl:hidden': direction !== 'rtl',
            }
          )}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-100 to-pink-200 opacity-20 rounded-lg pointer-events-none"></div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 relative z-20 inline-block">
          {t('heroSection.title')}
          <span className="block h-1 w-24 bg-highlight mt-2 rounded-full"></span>
        </h1>
        <p className="text-gray-600 text-lg mt-4 relative z-20">
          {t('heroSection.subtitle')}
        </p>
        <div className="mt-4 sm:mt-8 relative z-30">
          <div className="relative w-full sm:w-2/3 lg:w-1/3 mx-auto">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholderText || 'Turk'}
                value={searchTerm}
                onChange={onInputChange}
                className={classNames(
                  `
                    jsx-cbdf62a1b45089b4 p-4 sm:p-3 w-full border-2 border-blue-500 rounded-lg shadow-lg 
                    focus:outline-none focus:border-warning focus:ring-2 focus:ring-highlight 
                    text-black transition duration-300 ease-in-out 
                    pr-20 rtl:pl-20 glow-placeholder
                  `,
                  {
                    'ltr:pl-20 rtl:pr-20': direction === 'rtl',
                  }
                )}
                style={{ fontWeight: 'bold', zIndex: 10 }}
                aria-label="Country Search"
                inputMode="search"
              />
              <div
                className={classNames(
                  'absolute inset-y-0 flex items-center space-x-2 rtl:space-x-reverse',
                  {
                    'right-3 rtl:left-3': direction !== 'rtl',
                    'left-3 rtl:right-3': direction === 'rtl',
                  }
                )}
                style={{ pointerEvents: 'none' }}
              >
                {isLoading && (
                  <>
                    <FaSpinner
                      className="animate-spin text-[#90A4AE] text-lg sm:text-xl"
                      aria-label="Loading"
                    />
                    <div className="w-px h-6 bg-gray-300" aria-hidden="true"></div>
                  </>
                )}
                <FaPlane
                  className={classNames('text-blue-600 text-lg sm:text-xl', {
                    'transform rotate-0': direction !== 'rtl',
                    'transform rotate-180': direction === 'rtl',
                  })}
                  aria-label="Bundle Icon"
                />
              </div>
            </div>
            {filteredCountries && (
              <ul
                className={classNames(
                  'absolute top-full mt-1 bg-blue-50 border border-blue-400 max-h-60 overflow-y-auto rounded-md shadow-lg z-40',
                  {
                    'left-0': direction !== 'rtl',
                    'right-0': direction === 'rtl',
                    'w-full': true,
                  }
                )}
                role="listbox"
                aria-label="Country Search Results"
              >
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <li
                      key={country.iso}
                      onClick={() => handleCountrySelect(country)}
                      className="flex items-center cursor-pointer px-4 py-3 border-b border-dotted border-gray-300 last:border-b-0 hover:bg-blue-100 transition-colors focus:bg-blue-200 focus:outline-none"
                      role="option"
                      aria-selected={false}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCountrySelect(country);
                        }
                      }}
                    >
                      <Image
                        src={`/flags/${country.iso.toUpperCase()}.svg`}
                        alt={`Flag of ${translatedCountryMap.get(country.iso) || country.name}`}
                        width={24}
                        height={24}
                        className="mr-4 flex-shrink-0"
                        onError={handleImageError}
                        priority={false}
                        loading="lazy"
                      />
                      <span className="text-base text-gray-800">
                        {translatedCountryMap.get(country.iso) || country.name}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-gray-500">
                    No countries found.
                  </li>
                )}
              </ul>
            )}
            {filteredCountries &&
              filteredCountries.length === 0 &&
              !isLoading &&
              !fetchError && (
                <div
                  className={classNames(
                    'absolute top-full mt-1 bg-blue-50 border border-blue-400 max-h-60 overflow-y-auto rounded-md shadow-lg z-40 p-4 text-gray-500',
                    {
                      'left-0': direction !== 'rtl',
                      'right-0': direction === 'rtl',
                      'w-full': true,
                    }
                  )}
                >
                  No countries found.
                </div>
              )}
            {fetchError && (
              <div className="text-red-600 mt-2 text-sm sm:text-base">
                {fetchError}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 sm:mt-12 flex justify-center relative z-10">
          <Image
            src="/images/heroimage.avif"
            alt={t('heroSection.title')}
            width={300}
            height={300}
            priority={true}
            quality={75}
            sizes="(max-width: 768px) 100vw, 300px"
            className="animate-bounce-smooth"
            onError={handleImageError}
            loading="eager"
          />
        </div>
      </div>
      {selectedCountry && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          country={selectedCountry}
        />
      )}
      <style jsx global>{`
        @keyframes bounce-smooth {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-smooth {
          animation: bounce-smooth 3s ease-in-out infinite;
          will-change: transform;
        }
        .glow-placeholder::placeholder {
          color: #6b7280;
          font-weight: bold;
          animation: glow 1.5s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from {
            text-shadow: 0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ff00ff,
              0 0 30px #ff00ff, 0 0 40px #ff00ff;
          }
          to {
            text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ff00ff,
              0 0 40px #ff00ff, 0 0 50px #ff00ff;
          }
        }
      `}</style>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default memo(HeroSection);
