export interface UzbekistanCity {
  name: string;
  nameUz: string;
  lat: number;
  lon: number;
  apiRegion: string;
}

export const UZBEKISTAN_REGIONS: { region: string; cities: UzbekistanCity[] }[] = [
  {
    region: "Tashkent",
    cities: [
      { name: "Tashkent", nameUz: "Toshkent", lat: 41.2995, lon: 69.2401, apiRegion: "Toshkent" },
      { name: "Chirchiq", nameUz: "Chirchiq", lat: 41.4689, lon: 69.585, apiRegion: "Toshkent" },
      { name: "Angren", nameUz: "Angren", lat: 41.0167, lon: 70.1436, apiRegion: "Toshkent" },
      { name: "Olmaliq", nameUz: "Olmaliq", lat: 40.8453, lon: 69.5953, apiRegion: "Toshkent" },
      { name: "Bekabad", nameUz: "Bekobod", lat: 40.2167, lon: 69.2667, apiRegion: "Toshkent" },
      { name: "Yangiyul", nameUz: "Yangiyo'l", lat: 41.1133, lon: 69.0458, apiRegion: "Toshkent" },
      { name: "Gazalkent", nameUz: "Gazalkent", lat: 41.5517, lon: 69.7767, apiRegion: "Toshkent" },
      { name: "Akhangaran", nameUz: "Ohangaron", lat: 40.9019, lon: 69.6383, apiRegion: "Toshkent" },
    ],
  },
  {
    region: "Tashkent Region",
    cities: [
      { name: "Nurafshon", nameUz: "Nurafshon", lat: 41.1033, lon: 69.3336, apiRegion: "Toshkent" },
      { name: "Buka", nameUz: "Buka", lat: 40.9167, lon: 69.2, apiRegion: "Toshkent" },
      { name: "Chinoz", nameUz: "Chinoz", lat: 40.9167, lon: 68.8333, apiRegion: "Toshkent" },
      { name: "Qibray", nameUz: "Qibray", lat: 41.3833, lon: 69.45, apiRegion: "Toshkent" },
      { name: "Piskent", nameUz: "Piskent", lat: 40.8833, lon: 69.35, apiRegion: "Toshkent" },
      { name: "Parkent", nameUz: "Parkent", lat: 41.3, lon: 69.7, apiRegion: "Toshkent" },
      { name: "Tashkent (Kumaryk)", nameUz: "Toshkent tumani", lat: 41.2, lon: 69.3, apiRegion: "Toshkent" },
    ],
  },
  {
    region: "Samarkand",
    cities: [
      { name: "Samarkand", nameUz: "Samarqand", lat: 39.6542, lon: 66.9597, apiRegion: "Samarqand" },
      { name: "Jizzakh", nameUz: "Jizzax", lat: 40.1158, lon: 67.8414, apiRegion: "Samarqand" },
      { name: "Kitob", nameUz: "Kitob", lat: 39.0833, lon: 66.8833, apiRegion: "Samarqand" },
      { name: "Urgut", nameUz: "Urgut", lat: 39.4, lon: 67.25, apiRegion: "Samarqand" },
      { name: "Panjakent", nameUz: "Panjakent", lat: 39.4833, lon: 67.3333, apiRegion: "Samarqand" },
      { name: "Kattakurgan", nameUz: "Kattaqo'rg'on", lat: 39.9, lon: 66.25, apiRegion: "Samarqand" },
      { name: "Bulungur", nameUz: "Bulung'ur", lat: 39.7667, lon: 67.2667, apiRegion: "Samarqand" },
      { name: "Ishtixon", nameUz: "Ishtixon", lat: 39.9333, lon: 66.4833, apiRegion: "Samarqand" },
    ],
  },
  {
    region: "Fergana",
    cities: [
      { name: "Fergana", nameUz: "Farg'ona", lat: 40.3842, lon: 71.7869, apiRegion: "Farg'ona" },
      { name: "Margilan", nameUz: "Marg'ilon", lat: 40.4711, lon: 71.7247, apiRegion: "Farg'ona" },
      { name: "Kokand", nameUz: "Qo'qon", lat: 40.5283, lon: 70.9425, apiRegion: "Farg'ona" },
      { name: "Andijan", nameUz: "Andijon", lat: 40.7821, lon: 72.3442, apiRegion: "Andijon" },
      { name: "Namangan", nameUz: "Namangan", lat: 41.0011, lon: 71.6726, apiRegion: "Namangan" },
      { name: "Rishtan", nameUz: "Rishton", lat: 40.35, lon: 71.2833, apiRegion: "Farg'ona" },
      { name: "Quvasoy", nameUz: "Quvasoy", lat: 40.3, lon: 71.5833, apiRegion: "Farg'ona" },
      { name: "Kokand (town)", nameUz: "Qo'qon shahri", lat: 40.53, lon: 70.94, apiRegion: "Farg'ona" },
      { name: "Chust", nameUz: "Chust", lat: 41.0, lon: 71.2333, apiRegion: "Namangan" },
    ],
  },
  {
    region: "Bukhara",
    cities: [
      { name: "Bukhara", nameUz: "Buxoro", lat: 39.7747, lon: 64.4286, apiRegion: "Buxoro" },
      { name: "Kagan", nameUz: "Kogon", lat: 39.7283, lon: 64.5517, apiRegion: "Buxoro" },
      { name: "Gazli", nameUz: "Gazli", lat: 40.0833, lon: 63.45, apiRegion: "Buxoro" },
      { name: "Vobkent", nameUz: "Vobkent", lat: 40.0333, lon: 64.5167, apiRegion: "Buxoro" },
      { name: "Peshku", nameUz: "Peshku", lat: 40.2167, lon: 64.1833, apiRegion: "Buxoro" },
    ],
  },
  {
    region: "Khorezm",
    cities: [
      { name: "Urgench", nameUz: "Urganch", lat: 41.55, lon: 60.6333, apiRegion: "Urganch" },
      { name: "Khiva", nameUz: "Xiva", lat: 41.3786, lon: 60.3564, apiRegion: "Urganch" },
      { name: "Xonqa", nameUz: "Xonqa", lat: 41.45, lon: 60.7833, apiRegion: "Urganch" },
      { name: "Gurlan", nameUz: "Gurlan", lat: 41.35, lon: 60.5833, apiRegion: "Urganch" },
      { name: "Shovot", nameUz: "Shovot", lat: 41.65, lon: 60.3, apiRegion: "Urganch" },
      { name: "Yangiariq", nameUz: "Yangiariq", lat: 41.55, lon: 60.55, apiRegion: "Urganch" },
    ],
  },
  {
    region: "Navoi",
    cities: [
      { name: "Navoi", nameUz: "Navoiy", lat: 40.1, lon: 65.3667, apiRegion: "Navoiy" },
      { name: "Zarafshan", nameUz: "Zarafshon", lat: 41.5667, lon: 64.2, apiRegion: "Navoiy" },
      { name: "Uchkuduk", nameUz: "Uchquduq", lat: 42.15, lon: 63.75, apiRegion: "Navoiy" },
      { name: "Nurata", nameUz: "Nurota", lat: 40.5667, lon: 65.6833, apiRegion: "Navoiy" },
      { name: "Karmana", nameUz: "Karmana", lat: 40.2, lon: 65.55, apiRegion: "Navoiy" },
    ],
  },
  {
    region: "Kashkadarya",
    cities: [
      { name: "Karshi", nameUz: "Qarshi", lat: 38.86, lon: 65.7833, apiRegion: "Qarshi" },
      { name: "Shahrisabz", nameUz: "Shahrisabz", lat: 39.05, lon: 66.8333, apiRegion: "Qarshi" },
      { name: "Kasbi", nameUz: "Kasbi", lat: 39.0333, lon: 65.5667, apiRegion: "Qarshi" },
      { name: "Nishon", nameUz: "Nishon", lat: 38.7, lon: 65.6833, apiRegion: "Qarshi" },
      { name: "Koson", nameUz: "Qo'shon", lat: 39.0667, lon: 65.5333, apiRegion: "Qarshi" },
      { name: "Yakkabog", nameUz: "Yakkabog'", lat: 38.9833, lon: 66.55, apiRegion: "Qarshi" },
    ],
  },
  {
    region: "Surkhandarya",
    cities: [
      { name: "Termez", nameUz: "Termiz", lat: 37.2242, lon: 67.2783, apiRegion: "Termiz" },
      { name: "Denau", nameUz: "Denov", lat: 38.2667, lon: 67.9, apiRegion: "Termiz" },
      { name: "Boysun", nameUz: "Boysun", lat: 38.2167, lon: 67.2, apiRegion: "Termiz" },
      { name: "Jarqurgon", nameUz: "Jarqo'rg'on", lat: 37.5, lon: 67.4167, apiRegion: "Termiz" },
      { name: "Angor", nameUz: "Angor", lat: 37.7167, lon: 67.0, apiRegion: "Termiz" },
      { name: "Sariosiyo", nameUz: "Sariosiyo", lat: 38.4167, lon: 67.9667, apiRegion: "Termiz" },
    ],
  },
  {
    region: "Jizzakh",
    cities: [
      { name: "Jizzakh city", nameUz: "Jizzax shahri", lat: 40.1158, lon: 67.8414, apiRegion: "Jizzax" },
      { name: "Dustlik", nameUz: "Do'stlik", lat: 40.5333, lon: 67.85, apiRegion: "Jizzax" },
      { name: "Olmazor", nameUz: "Olmazor", lat: 40.4167, lon: 68.1667, apiRegion: "Jizzax" },
      { name: "Gagarin", nameUz: "G'ag'aron", lat: 40.6667, lon: 68.1833, apiRegion: "Jizzax" },
      { name: "Zafar", nameUz: "Zafar", lat: 40.3, lon: 67.9833, apiRegion: "Jizzax" },
    ],
  },
  {
    region: "Syrdarya",
    cities: [
      { name: "Gulistan", nameUz: "Guliston", lat: 40.4833, lon: 68.7833, apiRegion: "Guliston" },
      { name: "Yangiyer", nameUz: "Yangiyer", lat: 40.4167, lon: 68.6667, apiRegion: "Guliston" },
      { name: "Sirdaryo", nameUz: "Sirdaryo", lat: 40.35, lon: 68.6167, apiRegion: "Guliston" },
      { name: "Mirzaobod", nameUz: "Mirzaobod", lat: 40.1667, lon: 68.7167, apiRegion: "Guliston" },
      { name: "Boyovut", nameUz: "Bo'yovut", lat: 40.3, lon: 68.8333, apiRegion: "Guliston" },
    ],
  },
  {
    region: "Karakalpakstan",
    cities: [
      { name: "Nukus", nameUz: "Nukus", lat: 42.46, lon: 59.6, apiRegion: "Nukus" },
      { name: "Kanlikul", nameUz: "Qanliko'l", lat: 42.9167, lon: 58.9333, apiRegion: "Nukus" },
      { name: "Kegeyli", nameUz: "Kegeyli", lat: 42.6333, lon: 59.3667, apiRegion: "Nukus" },
      { name: "Mangit", nameUz: "Mo'ynoq", lat: 43.0667, lon: 58.55, apiRegion: "Nukus" },
      { name: "Turtkul", nameUz: "To'rtko'l", lat: 41.55, lon: 61.0, apiRegion: "Nukus" },
      { name: "Chimbay", nameUz: "Chimboy", lat: 42.9333, lon: 59.7667, apiRegion: "Nukus" },
    ],
  },
  {
    region: "Namangan",
    cities: [
      { name: "Namangan city", nameUz: "Namangan shahri", lat: 41.0011, lon: 71.6726, apiRegion: "Namangan" },
      { name: "Kosonsoy", nameUz: "Kosonsoy", lat: 41.25, lon: 71.55, apiRegion: "Namangan" },
      { name: "Pop", nameUz: "Pop", lat: 41.2167, lon: 71.0833, apiRegion: "Namangan" },
      { name: "Uychi", nameUz: "Uychi", lat: 41.0833, lon: 71.8333, apiRegion: "Namangan" },
      { name: "Toshbuloq", nameUz: "Toshbuloq", lat: 41.1167, lon: 71.5667, apiRegion: "Namangan" },
      { name: "Chartak", nameUz: "Chortoq", lat: 41.0667, lon: 71.8, apiRegion: "Namangan" },
    ],
  },
  {
    region: "Andijan",
    cities: [
      { name: "Andijan city", nameUz: "Andijon shahri", lat: 40.7821, lon: 72.3442, apiRegion: "Andijon" },
      { name: "Asaka", nameUz: "Asaka", lat: 40.6333, lon: 72.2333, apiRegion: "Andijon" },
      { name: "Xonobod", nameUz: "Xonobod", lat: 40.8167, lon: 72.9833, apiRegion: "Andijon" },
      { name: "Shahrixon", nameUz: "Shahrixon", lat: 40.7167, lon: 72.05, apiRegion: "Andijon" },
      { name: "Jalaquduq", nameUz: "Jalaquduq", lat: 40.75, lon: 72.6, apiRegion: "Andijon" },
      { name: "Baliqchi", nameUz: "Baliqchi", lat: 40.9, lon: 72.1667, apiRegion: "Andijon" },
      { name: "Oltinkul", nameUz: "Oltinko'l", lat: 40.8833, lon: 72.2833, apiRegion: "Andijon" },
    ],
  },
];
