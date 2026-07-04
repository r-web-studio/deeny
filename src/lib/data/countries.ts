export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface Region {
  name: string;
  cities: { name: string; lat: number; lon: number }[];
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  timezone: string;
  prayerMethod: number;
  school?: number; // 0 = Shafi'i, 1 = Hanafi
  api: "aladhan";
  regions: Region[];
}

export const COUNTRIES: Country[] = [
  {
    id: "uzbekistan",
    name: "Uzbekistan",
    flag: "🇺🇿",
    timezone: "Asia/Tashkent",
    prayerMethod: 2,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Tashkent",
        cities: [
          { name: "Tashkent", lat: 41.3028, lon: 69.2785 },
        ],
      },
    ],
  },
  {
    id: "turkey",
    name: "Turkey",
    flag: "🇹🇷",
    timezone: "Europe/Istanbul",
    prayerMethod: 13,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Marmara",
        cities: [
          { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
          { name: "Bursa", lat: 40.1885, lon: 29.061 },
          { name: "Edirne", lat: 41.6818, lon: 26.5623 },
          { name: "Kocaeli", lat: 40.8533, lon: 29.8815 },
          { name: "Tekirdağ", lat: 41.0027, lon: 27.5127 },
        ],
      },
      {
        name: "Central Anatolia",
        cities: [
          { name: "Ankara", lat: 39.9334, lon: 32.8597 },
          { name: "Konya", lat: 37.8746, lon: 32.4932 },
          { name: "Kayseri", lat: 38.7312, lon: 35.4787 },
          { name: "Eskişehir", lat: 39.7767, lon: 30.5206 },
        ],
      },
      {
        name: "Aegean",
        cities: [
          { name: "Izmir", lat: 38.4237, lon: 27.1428 },
          { name: "Manisa", lat: 38.6191, lon: 27.4289 },
          { name: "Aydın", lat: 37.856, lon: 27.8416 },
          { name: "Denizli", lat: 37.7765, lon: 29.0864 },
        ],
      },
      {
        name: "Mediterranean",
        cities: [
          { name: "Antalya", lat: 36.8969, lon: 30.7133 },
          { name: "Adana", lat: 37.0, lon: 35.3213 },
          { name: "Mersin", lat: 36.8121, lon: 34.6415 },
          { name: "Gaziantep", lat: 37.0662, lon: 37.3833 },
        ],
      },
      {
        name: "Black Sea",
        cities: [
          { name: "Trabzon", lat: 41.0027, lon: 39.7168 },
          { name: "Samsun", lat: 41.2867, lon: 36.33 },
          { name: "Rize", lat: 41.0201, lon: 40.5234 },
        ],
      },
      {
        name: "Eastern Anatolia",
        cities: [
          { name: "Erzurum", lat: 39.9055, lon: 41.2658 },
          { name: "Van", lat: 38.4891, lon: 43.4089 },
          { name: "Malatya", lat: 38.3552, lon: 38.3095 },
        ],
      },
    ],
  },
  {
    id: "saudiArabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    timezone: "Asia/Riyadh",
    prayerMethod: 4,
    api: "aladhan",
    regions: [
      {
        name: "Riyadh",
        cities: [
          { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
          { name: "Al Kharj", lat: 24.1556, lon: 47.3125 },
        ],
      },
      {
        name: "Makkah",
        cities: [
          { name: "Mecca", lat: 21.3891, lon: 39.8579 },
          { name: "Jeddah", lat: 21.4858, lon: 39.1925 },
          { name: "Taif", lat: 21.2703, lon: 40.4159 },
        ],
      },
      {
        name: "Madinah",
        cities: [
          { name: "Medina", lat: 24.5247, lon: 39.5692 },
          { name: "Yanbu", lat: 24.0895, lon: 38.0618 },
        ],
      },
      {
        name: "Eastern Province",
        cities: [
          { name: "Dammam", lat: 26.4207, lon: 50.0888 },
          { name: "Dhahran", lat: 26.2361, lon: 50.1695 },
          { name: "Al Khobar", lat: 26.2172, lon: 50.1971 },
        ],
      },
      {
        name: "Asir",
        cities: [
          { name: "Abha", lat: 18.2164, lon: 42.5053 },
          { name: "Khamis Mushait", lat: 18.3061, lon: 42.7291 },
        ],
      },
    ],
  },
  {
    id: "pakistan",
    name: "Pakistan",
    flag: "🇵🇰",
    timezone: "Asia/Karachi",
    prayerMethod: 1,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Punjab",
        cities: [
          { name: "Lahore", lat: 31.5204, lon: 74.3587 },
          { name: "Faisalabad", lat: 31.4504, lon: 73.135 },
          { name: "Rawalpindi", lat: 33.5651, lon: 73.0169 },
          { name: "Multan", lat: 30.1575, lon: 71.5249 },
          { name: "Gujranwala", lat: 32.1877, lon: 74.1945 },
          { name: "Sialkot", lat: 32.4945, lon: 74.5229 },
        ],
      },
      {
        name: "Sindh",
        cities: [
          { name: "Karachi", lat: 24.8607, lon: 67.0011 },
          { name: "Hyderabad", lat: 25.396, lon: 68.3578 },
          { name: "Sukkur", lat: 27.7052, lon: 68.8283 },
        ],
      },
      {
        name: "KPK",
        cities: [
          { name: "Peshawar", lat: 34.0151, lon: 71.5249 },
          { name: "Mardan", lat: 34.1989, lon: 72.0147 },
          { name: "Abbottabad", lat: 34.1469, lon: 73.1952 },
        ],
      },
      {
        name: "Balochistan",
        cities: [
          { name: "Quetta", lat: 30.1798, lon: 66.975 },
          { name: "Gwadar", lat: 25.1264, lon: 62.3266 },
        ],
      },
      {
        name: "Islamabad",
        cities: [
          { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
        ],
      },
    ],
  },
  {
    id: "indonesia",
    name: "Indonesia",
    flag: "🇮🇩",
    timezone: "Asia/Jakarta",
    prayerMethod: 20,
    api: "aladhan",
    regions: [
      {
        name: "Java",
        cities: [
          { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
          { name: "Surabaya", lat: -7.2575, lon: 112.7521 },
          { name: "Bandung", lat: -6.9175, lon: 107.6191 },
          { name: "Semarang", lat: -6.9666, lon: 110.4196 },
          { name: "Yogyakarta", lat: -7.7956, lon: 110.3695 },
          { name: "Malang", lat: -7.9666, lon: 112.6326 },
        ],
      },
      {
        name: "Sumatra",
        cities: [
          { name: "Medan", lat: 3.5952, lon: 98.6722 },
          { name: "Palembang", lat: -2.9761, lon: 104.7754 },
          { name: "Padang", lat: -0.9471, lon: 100.4172 },
          { name: "Pekanbaru", lat: 0.5071, lon: 101.4478 },
        ],
      },
      {
        name: "Kalimantan",
        cities: [
          { name: "Banjarmasin", lat: -3.3186, lon: 114.5944 },
          { name: "Pontianak", lat: -0.0263, lon: 109.3425 },
        ],
      },
      {
        name: "Sulawesi",
        cities: [
          { name: "Makassar", lat: -5.1477, lon: 119.4327 },
          { name: "Manado", lat: 1.4748, lon: 124.8421 },
        ],
      },
    ],
  },
  {
    id: "malaysia",
    name: "Malaysia",
    flag: "🇲🇾",
    timezone: "Asia/Kuala_Lumpur",
    prayerMethod: 17,
    api: "aladhan",
    regions: [
      {
        name: "Kuala Lumpur",
        cities: [
          { name: "Kuala Lumpur", lat: 3.139, lon: 101.6869 },
          { name: "Putrajaya", lat: 2.9264, lon: 101.6964 },
        ],
      },
      {
        name: "Penang",
        cities: [
          { name: "George Town", lat: 5.4141, lon: 100.3288 },
          { name: "Butterworth", lat: 5.3991, lon: 100.3638 },
        ],
      },
      {
        name: "Johor",
        cities: [
          { name: "Johor Bahru", lat: 1.4927, lon: 103.7414 },
          { name: "Iskandar Puteri", lat: 1.4268, lon: 103.6643 },
        ],
      },
      {
        name: "Perak",
        cities: [
          { name: "Ipoh", lat: 4.5975, lon: 101.0901 },
        ],
      },
      {
        name: "Kedah",
        cities: [
          { name: "Alor Setar", lat: 6.1184, lon: 100.3685 },
        ],
      },
    ],
  },
  {
    id: "egypt",
    name: "Egypt",
    flag: "🇪🇬",
    timezone: "Africa/Cairo",
    prayerMethod: 5,
    api: "aladhan",
    regions: [
      {
        name: "Cairo",
        cities: [
          { name: "Cairo", lat: 30.0444, lon: 31.2357 },
          { name: "Giza", lat: 30.0131, lon: 31.2089 },
          { name: "6th of October City", lat: 29.9726, lon: 31.0078 },
        ],
      },
      {
        name: "Alexandria",
        cities: [
          { name: "Alexandria", lat: 31.2001, lon: 29.9187 },
        ],
      },
      {
        name: "Upper Egypt",
        cities: [
          { name: "Luxor", lat: 25.6872, lon: 32.6396 },
          { name: "Aswan", lat: 24.0889, lon: 32.8998 },
        ],
      },
      {
        name: "Delta",
        cities: [
          { name: "Mansoura", lat: 31.0409, lon: 31.3785 },
          { name: "Tanta", lat: 30.7865, lon: 31.0004 },
          { name: "Port Said", lat: 31.2653, lon: 32.3019 },
        ],
      },
    ],
  },
  {
    id: "uae",
    name: "UAE",
    flag: "🇦🇪",
    timezone: "Asia/Dubai",
    prayerMethod: 16,
    api: "aladhan",
    regions: [
      {
        name: "Dubai",
        cities: [
          { name: "Dubai", lat: 25.2048, lon: 55.2708 },
        ],
      },
      {
        name: "Abu Dhabi",
        cities: [
          { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
        ],
      },
      {
        name: "Sharjah",
        cities: [
          { name: "Sharjah", lat: 25.3463, lon: 55.4209 },
        ],
      },
      {
        name: "Northern Emirates",
        cities: [
          { name: "Ajman", lat: 25.4052, lon: 55.5136 },
          { name: "Ras Al Khaimah", lat: 25.7897, lon: 55.9432 },
          { name: "Fujairah", lat: 25.1288, lon: 56.3264 },
        ],
      },
    ],
  },
  {
    id: "kazakhstan",
    name: "Kazakhstan",
    flag: "🇰🇿",
    timezone: "Asia/Almaty",
    prayerMethod: 3,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Almaty",
        cities: [
          { name: "Almaty", lat: 43.222, lon: 76.8512 },
        ],
      },
      {
        name: "Astana",
        cities: [
          { name: "Astana", lat: 51.1694, lon: 71.4491 },
        ],
      },
      {
        name: "Shymkent",
        cities: [
          { name: "Shymkent", lat: 42.3417, lon: 69.5901 },
        ],
      },
      {
        name: "Turkestan",
        cities: [
          { name: "Turkestan", lat: 43.3014, lon: 68.2516 },
        ],
      },
    ],
  },
  {
    id: "russia",
    name: "Russia",
    flag: "🇷🇺",
    timezone: "Europe/Moscow",
    prayerMethod: 14,
    api: "aladhan",
    regions: [
      {
        name: "Moscow",
        cities: [
          { name: "Moscow", lat: 55.7558, lon: 37.6173 },
        ],
      },
      {
        name: "Saint Petersburg",
        cities: [
          { name: "Saint Petersburg", lat: 59.9343, lon: 30.3351 },
        ],
      },
      {
        name: "Tatarstan",
        cities: [
          { name: "Kazan", lat: 55.7887, lon: 49.1221 },
        ],
      },
      {
        name: "Dagestan",
        cities: [
          { name: "Makhachkala", lat: 42.9849, lon: 47.5047 },
        ],
      },
    ],
  },
  {
    id: "kyrgyzstan",
    name: "Kyrgyzstan",
    flag: "🇰🇬",
    timezone: "Asia/Bishkek",
    prayerMethod: 3,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Bishkek",
        cities: [
          { name: "Bishkek", lat: 42.8746, lon: 74.5698 },
        ],
      },
      {
        name: "Osh",
        cities: [
          { name: "Osh", lat: 40.5283, lon: 72.7985 },
        ],
      },
    ],
  },
  {
    id: "tajikistan",
    name: "Tajikistan",
    flag: "🇹🇯",
    timezone: "Asia/Dushanbe",
    prayerMethod: 3,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Dushanbe",
        cities: [
          { name: "Dushanbe", lat: 38.5598, lon: 68.774 },
        ],
      },
      {
        name: "Khujand",
        cities: [
          { name: "Khujand", lat: 40.2827, lon: 69.6222 },
        ],
      },
    ],
  },
  {
    id: "afghanistan",
    name: "Afghanistan",
    flag: "🇦🇫",
    timezone: "Asia/Kabul",
    prayerMethod: 3,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Kabul",
        cities: [
          { name: "Kabul", lat: 34.5553, lon: 69.2075 },
        ],
      },
      {
        name: "Herat",
        cities: [
          { name: "Herat", lat: 34.3529, lon: 62.204 },
        ],
      },
      {
        name: "Mazar-i-Sharif",
        cities: [
          { name: "Mazar-i-Sharif", lat: 36.7069, lon: 67.1108 },
        ],
      },
      {
        name: "Kandahar",
        cities: [
          { name: "Kandahar", lat: 31.6289, lon: 65.7372 },
        ],
      },
    ],
  },
  {
    id: "iran",
    name: "Iran",
    flag: "🇮🇷",
    timezone: "Asia/Tehran",
    prayerMethod: 7,
    api: "aladhan",
    regions: [
      {
        name: "Tehran",
        cities: [
          { name: "Tehran", lat: 35.6892, lon: 51.389 },
        ],
      },
      {
        name: "Isfahan",
        cities: [
          { name: "Isfahan", lat: 32.6546, lon: 51.668 },
        ],
      },
      {
        name: "Mashhad",
        cities: [
          { name: "Mashhad", lat: 36.2972, lon: 59.6067 },
        ],
      },
      {
        name: "Tabriz",
        cities: [
          { name: "Tabriz", lat: 38.08, lon: 46.2919 },
        ],
      },
      {
        name: "Shiraz",
        cities: [
          { name: "Shiraz", lat: 29.5918, lon: 52.5836 },
        ],
      },
    ],
  },
  {
    id: "morocco",
    name: "Morocco",
    flag: "🇲🇦",
    timezone: "Africa/Casablanca",
    prayerMethod: 21,
    api: "aladhan",
    regions: [
      {
        name: "Casablanca",
        cities: [
          { name: "Casablanca", lat: 33.5731, lon: -7.5898 },
        ],
      },
      {
        name: "Rabat",
        cities: [
          { name: "Rabat", lat: 34.0209, lon: -6.8416 },
        ],
      },
      {
        name: "Marrakech",
        cities: [
          { name: "Marrakech", lat: 31.6295, lon: -7.9811 },
        ],
      },
      {
        name: "Fez",
        cities: [
          { name: "Fez", lat: 34.0181, lon: -5.0078 },
        ],
      },
    ],
  },
  {
    id: "jordan",
    name: "Jordan",
    flag: "🇯🇴",
    timezone: "Asia/Amman",
    prayerMethod: 23,
    api: "aladhan",
    regions: [
      {
        name: "Amman",
        cities: [
          { name: "Amman", lat: 31.9454, lon: 35.9284 },
        ],
      },
      {
        name: "Irbid",
        cities: [
          { name: "Irbid", lat: 32.5556, lon: 35.85 },
        ],
      },
      {
        name: "Zarqa",
        cities: [
          { name: "Zarqa", lat: 32.0728, lon: 36.0882 },
        ],
      },
    ],
  },
  {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    timezone: "Europe/Berlin",
    prayerMethod: 3,
    school: 1,
    api: "aladhan",
    regions: [
      {
        name: "Berlin",
        cities: [
          { name: "Berlin", lat: 52.52, lon: 13.405 },
        ],
      },
      {
        name: "Munich",
        cities: [
          { name: "Munich", lat: 48.1351, lon: 11.582 },
        ],
      },
      {
        name: "Hamburg",
        cities: [
          { name: "Hamburg", lat: 53.5511, lon: 9.9937 },
        ],
      },
      {
        name: "Cologne",
        cities: [
          { name: "Cologne", lat: 50.9375, lon: 6.9603 },
        ],
      },
      {
        name: "Frankfurt",
        cities: [
          { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
        ],
      },
    ],
  },
  {
    id: "france",
    name: "France",
    flag: "🇫🇷",
    timezone: "Europe/Paris",
    prayerMethod: 12,
    api: "aladhan",
    regions: [
      {
        name: "Paris",
        cities: [
          { name: "Paris", lat: 48.8566, lon: 2.3522 },
        ],
      },
      {
        name: "Lyon",
        cities: [
          { name: "Lyon", lat: 45.764, lon: 4.8357 },
        ],
      },
      {
        name: "Marseille",
        cities: [
          { name: "Marseille", lat: 43.2965, lon: 5.3698 },
        ],
      },
      {
        name: "Strasbourg",
        cities: [
          { name: "Strasbourg", lat: 48.5734, lon: 7.7521 },
        ],
      },
    ],
  },
  {
    id: "unitedKingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    timezone: "Europe/London",
    prayerMethod: 15,
    api: "aladhan",
    regions: [
      {
        name: "London",
        cities: [
          { name: "London", lat: 51.5074, lon: -0.1278 },
        ],
      },
      {
        name: "Birmingham",
        cities: [
          { name: "Birmingham", lat: 52.4862, lon: -1.8904 },
        ],
      },
      {
        name: "Manchester",
        cities: [
          { name: "Manchester", lat: 53.4808, lon: -2.2426 },
        ],
      },
      {
        name: "Leeds",
        cities: [
          { name: "Leeds", lat: 53.8008, lon: -1.5491 },
        ],
      },
    ],
  },
  {
    id: "unitedStates",
    name: "United States",
    flag: "🇺🇸",
    timezone: "America/New_York",
    prayerMethod: 15,
    api: "aladhan",
    regions: [
      {
        name: "New York",
        cities: [
          { name: "New York City", lat: 40.7128, lon: -74.006 },
          { name: "Brooklyn", lat: 40.6782, lon: -73.9442 },
        ],
      },
      {
        name: "California",
        cities: [
          { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
          { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
          { name: "San Diego", lat: 32.7157, lon: -117.1611 },
        ],
      },
      {
        name: "Texas",
        cities: [
          { name: "Houston", lat: 29.7604, lon: -95.3698 },
          { name: "Dallas", lat: 32.7767, lon: -96.797 },
          { name: "San Antonio", lat: 29.4241, lon: -98.4936 },
        ],
      },
      {
        name: "Illinois",
        cities: [
          { name: "Chicago", lat: 41.8781, lon: -87.6298 },
        ],
      },
      {
        name: "Michigan",
        cities: [
          { name: "Dearborn", lat: 42.3223, lon: -83.1763 },
        ],
      },
      {
        name: "Virginia",
        cities: [
          { name: "Washington D.C.", lat: 38.9072, lon: -77.0369 },
        ],
      },
    ],
  },
  {
    id: "canada",
    name: "Canada",
    flag: "🇨🇦",
    timezone: "America/Toronto",
    prayerMethod: 15,
    api: "aladhan",
    regions: [
      {
        name: "Ontario",
        cities: [
          { name: "Toronto", lat: 43.6532, lon: -79.3832 },
          { name: "Ottawa", lat: 45.4215, lon: -75.6972 },
          { name: "Mississauga", lat: 43.589, lon: -79.6441 },
        ],
      },
      {
        name: "Quebec",
        cities: [
          { name: "Montreal", lat: 45.5017, lon: -73.5673 },
        ],
      },
      {
        name: "Alberta",
        cities: [
          { name: "Calgary", lat: 51.0447, lon: -114.0719 },
          { name: "Edmonton", lat: 53.5461, lon: -113.4938 },
        ],
      },
      {
        name: "British Columbia",
        cities: [
          { name: "Vancouver", lat: 49.2827, lon: -123.1207 },
        ],
      },
    ],
  },
];

export function getCountryById(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id);
}
