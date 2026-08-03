// ISO 4217 Currency Registry
// rateToUSD = units of this currency per 1 USD (test data — replace with live API later)
// Architecture note: swap fetchRates() for CURRENCY_MAP rates to connect a real API.

export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameEn: string;
  nameRu: string;
  nameHe: string;
  rateToUSD: number;
  change24h: number; // mock 24h % change
  flag: string;
}

/** Codes without one honest country/territory flag. Keep this list explicit and audited. */
export const NEUTRAL_ICON_CODES = ['EUR', 'XCD', 'XPF', 'XAF', 'XOF', 'XAU', 'XAG', 'XDR'] as const;
export const NEUTRAL_CURRENCY_ICON = '🌐';

const COUNTRY_BY_CURRENCY: Record<string, string> = {
  ARS: 'AR', AWG: 'AW', BBD: 'BB', BMD: 'BM', BOB: 'BO', BRL: 'BR', BSD: 'BS', BZD: 'BZ',
  CAD: 'CA', CLP: 'CL', COP: 'CO', CRC: 'CR', CUP: 'CU', DOP: 'DO', GTQ: 'GT', GYD: 'GY',
  HNL: 'HN', HTG: 'HT', JMD: 'JM', KYD: 'KY', MXN: 'MX', NIO: 'NI', PAB: 'PA', PEN: 'PE',
  PYG: 'PY', SRD: 'SR', TTD: 'TT', USD: 'US', UYU: 'UY', VES: 'VE',
  ALL: 'AL', AMD: 'AM', AZN: 'AZ', BAM: 'BA', BGN: 'BG', BYN: 'BY', CHF: 'CH', CZK: 'CZ',
  DKK: 'DK', GBP: 'GB', GEL: 'GE', HUF: 'HU', ISK: 'IS', KGS: 'KG', KZT: 'KZ', MDL: 'MD',
  MKD: 'MK', NOK: 'NO', PLN: 'PL', RON: 'RO', RSD: 'RS', RUB: 'RU', SEK: 'SE', TJS: 'TJ',
  TMT: 'TM', TRY: 'TR', UAH: 'UA', UZS: 'UZ', AED: 'AE', AFN: 'AF', BHD: 'BH', ILS: 'IL',
  IQD: 'IQ', IRR: 'IR', JOD: 'JO', KWD: 'KW', LBP: 'LB', OMR: 'OM', QAR: 'QA', SAR: 'SA',
  SYP: 'SY', YER: 'YE', AUD: 'AU', BDT: 'BD', BND: 'BN', BTN: 'BT', CNY: 'CN', FJD: 'FJ',
  HKD: 'HK', IDR: 'ID', INR: 'IN', JPY: 'JP', KHR: 'KH', KPW: 'KP', KRW: 'KR', LAK: 'LA',
  LKR: 'LK', MMK: 'MM', MNT: 'MN', MOP: 'MO', MVR: 'MV', MYR: 'MY', NPR: 'NP', NZD: 'NZ',
  PGK: 'PG', PHP: 'PH', PKR: 'PK', SBD: 'SB', SGD: 'SG', THB: 'TH', TOP: 'TO', TWD: 'TW',
  VND: 'VN', VUV: 'VU', WST: 'WS', AOA: 'AO', BIF: 'BI', BWP: 'BW', CDF: 'CD', CVE: 'CV',
  DJF: 'DJ', DZD: 'DZ', EGP: 'EG', ERN: 'ER', ETB: 'ET', GHS: 'GH', GMD: 'GM', GNF: 'GN',
  KES: 'KE', KMF: 'KM', LRD: 'LR', LSL: 'LS', LYD: 'LY', MAD: 'MA', MGA: 'MG', MRU: 'MR',
  MUR: 'MU', MWK: 'MW', MZN: 'MZ', NAD: 'NA', NGN: 'NG', RWF: 'RW', SCR: 'SC', SDG: 'SD',
  SHP: 'SH', SLL: 'SL', SOS: 'SO', SSP: 'SS', STN: 'ST', SZL: 'SZ', TND: 'TN', TZS: 'TZ',
  UGX: 'UG', ZAR: 'ZA', ZMW: 'ZM', ZWL: 'ZW',
};

function countryFlag(countryCode: string) {
  return [...countryCode].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');
}

// ~160 active ISO 4217 currencies
const RAW: Array<[
  string,   // code
  string,   // symbol
  string,   // nameEn
  string,   // nameRu
  string,   // nameHe
  number,   // rateToUSD
  number,   // change24h
]> = [
  // ── Americas ──────────────────────────────────────────────────────────────
  ['ARS', '$',   'Argentine Peso',         'Аргентинский песо',      'פסו ארגנטינאי',      837.0,    1.24],
  ['AWG', 'ƒ',   'Aruban Florin',          'Арубский флорин',        'פלורין ארובאי',       1.79,    0.00],
  ['BBD', '$',   'Barbadian Dollar',       'Барбадосский доллар',    'דולר ברבדוסי',       2.00,    0.00],
  ['BMD', '$',   'Bermudian Dollar',       'Бермудский доллар',      'דולר ברמודאי',       1.00,    0.00],
  ['BOB', 'Bs.', 'Bolivian Boliviano',     'Боливийский боливиано',  'בוליביאנו בוליביאני', 6.91,   0.05],
  ['BRL', 'R$',  'Brazilian Real',         'Бразильский реал',       'ריאל ברזילאי',       4.97,   -0.31],
  ['BSD', '$',   'Bahamian Dollar',        'Багамский доллар',       'דולר בהאמי',          1.00,    0.00],
  ['BZD', '$',   'Belize Dollar',          'Белизский доллар',       'דולר מ-בליז',         2.00,    0.00],
  ['CAD', '$',   'Canadian Dollar',        'Канадский доллар',       'דולר קנדי',           1.358,  -0.18],
  ['CLP', '$',   'Chilean Peso',           'Чилийский песо',         'פסו צ׳יליאני',        971.0,   0.41],
  ['COP', '$',   'Colombian Peso',         'Колумбийский песо',      'פסו קולומביאני',     3938.0,   0.62],
  ['CRC', '₡',   'Costa Rican Colón',      'Коста-риканский колон',  'קולון קוסטה-ריקאי',   521.0,   0.10],
  ['CUP', '$',   'Cuban Peso',             'Кубинский песо',         'פסו קובני',            24.0,   0.00],
  ['DOP', 'RD$', 'Dominican Peso',         'Доминиканский песо',     'פסו דומיניקני',        56.7,   0.15],
  ['GTQ', 'Q',   'Guatemalan Quetzal',     'Гватемальский кетсаль',  'קצאל גואטמלי',         7.82,   0.05],
  ['GYD', '$',   'Guyanese Dollar',        'Гайанский доллар',       'דולר גיאנאי',         209.0,   0.00],
  ['HNL', 'L',   'Honduran Lempira',       'Гондурасская лемпира',   'למפירה הונדוראסית',    24.7,   0.08],
  ['HTG', 'G',   'Haitian Gourde',         'Гаитянский гурд',        'גורד האיטי',          133.0,   0.20],
  ['JMD', '$',   'Jamaican Dollar',        'Ямайский доллар',        'דולר ג׳מייקני',        156.0,   0.12],
  ['KYD', '$',   'Cayman Islands Dollar',  'Доллар Каймановых о-вов','דולר איי קיימן',        0.82,   0.00],
  ['MXN', '$',   'Mexican Peso',           'Мексиканский песо',      'פסו מקסיקני',          17.15, -0.22],
  ['NIO', 'C$',  'Nicaraguan Córdoba',     'Никарагуанская кордоба', 'קורדובה ניקרגואי',     36.5,   0.07],
  ['PAB', 'B/.',  'Panamanian Balboa',      'Панамское бальбоа',      'בלבואה פנמי',           1.00,   0.00],
  ['PEN', 'S/',   'Peruvian Sol',           'Перуанский соль',        'סול פרואני',            3.71,   0.18],
  ['PYG', '₲',   'Paraguayan Guaraní',     'Парагвайский гуарани',   'גוארני פרגוואי',      7293.0,   0.30],
  ['SRD', '$',   'Surinamese Dollar',      'Суринамский доллар',     'דולר סורינאמי',         36.5,   0.25],
  ['TTD', '$',   'Trinidad & Tobago Dollar','Доллар Тринидад и Тобаго','דולר טרינידד וטובגו',  6.77,  0.00],
  ['USD', '$',   'US Dollar',              'Доллар США',             'דולר אמריקאי',          1.00,   0.00],
  ['UYU', '$',   'Uruguayan Peso',         'Уругвайский песо',       'פסו אורוגוואי',         39.5,   0.35],
  ['VES', 'Bs.',  'Venezuelan Bolívar',     'Венесуэльский боливар',  'בוליבר ונצואלי',        36.5,   1.20],
  ['XCD', '$',   'East Caribbean Dollar',  'Восточно-карибский доллар','דולר מזרח קריבי',      2.70,  0.00],

  // ── Europe ────────────────────────────────────────────────────────────────
  ['ALL', 'L',   'Albanian Lek',           'Албанский лек',          'לק אלבני',            101.5,   0.15],
  ['AMD', '֏',   'Armenian Dram',          'Армянский драм',         'דרם ארמני',           387.0,   0.44],
  ['AZN', '₼',   'Azerbaijani Manat',      'Азербайджанский манат',  'מאנט אזרבייג׳אני',      1.70,   0.00],
  ['BAM', 'KM',  'Bosnia-Herzegovina Mark','Боснийская марка',        'מארקה בוסנית',          1.814,  0.10],
  ['BGN', 'лв',  'Bulgarian Lev',          'Болгарский лев',         'לב בולגרי',             1.814,  0.10],
  ['BYN', 'Br',  'Belarusian Ruble',       'Белорусский рубль',      'רובל בלרוסי',            3.27,  0.22],
  ['CHF', 'Fr',  'Swiss Franc',            'Швейцарский франк',      'פרנק שוויצרי',           0.891,  0.05],
  ['CZK', 'Kč',  'Czech Koruna',           'Чешская крона',          'קורונה צ׳כית',           22.8,  -0.12],
  ['DKK', 'kr',  'Danish Krone',           'Датская крона',          'כתר דני',                6.884, -0.08],
  ['EUR', '€',   'Euro',                   'Евро',                   'יורו',                   0.925,  0.12],
  ['GBP', '£',   'British Pound',          'Британский фунт',        'פאונד בריטי',            0.787, -0.09],
  ['GEL', '₾',   'Georgian Lari',          'Грузинский лари',        'לארי גיאורגי',            2.68,   0.30],
  ['HUF', 'Ft',  'Hungarian Forint',       'Венгерский форинт',      'פורינט הונגרי',          356.0, -0.25],
  ['ISK', 'kr',  'Icelandic Króna',        'Исландская крона',       'כתר איסלנדי',            138.0,  0.18],
  ['KGS', 'с',   'Kyrgyzstani Som',        'Киргизский сом',         'סום קירגיזסטני',          89.2,   0.10],
  ['KZT', '₸',   'Kazakhstani Tenge',      'Казахстанский тенге',    'טנגה קזחסטני',           449.0,  0.35],
  ['MDL', 'L',   'Moldovan Leu',           'Молдавский лей',         'לאו מולדבי',              17.8,  0.20],
  ['MKD', 'ден', 'Macedonian Denar',       'Македонский денар',      'דינר מקדוני',             56.9,  0.10],
  ['NOK', 'kr',  'Norwegian Krone',        'Норвежская крона',       'כתר נורווגי',            10.54, -0.14],
  ['PLN', 'zł',  'Polish Złoty',           'Польский злотый',        'זלוטי פולני',             3.97, -0.10],
  ['RON', 'lei', 'Romanian Leu',           'Румынский лей',          'לאו רומני',               4.643, 0.08],
  ['RSD', 'дин', 'Serbian Dinar',          'Сербский динар',         'דינר סרבי',              108.5,  0.12],
  ['RUB', '₽',   'Russian Ruble',          'Российский рубль',       'רובל רוסי',               90.5,  0.85],
  ['SEK', 'kr',  'Swedish Krona',          'Шведская крона',         'כתר שוודי',               10.42, -0.11],
  ['TJS', 'SM',  'Tajikistani Somoni',     'Таджикский сомони',      'סומוני טג׳יקי',            10.9,  0.10],
  ['TMT', 'T',   'Turkmenistani Manat',    'Туркменский манат',      'מאנט טורקמנסטני',          3.50,  0.00],
  ['TRY', '₺',   'Turkish Lira',           'Турецкая лира',          'לירה טורקית',             32.1,   0.55],
  ['UAH', '₴',   'Ukrainian Hryvnia',      'Украинская гривна',      'הריבניה האוקראינית',       38.5,   0.40],
  ['UZS', 'сум', 'Uzbekistani Som',        'Узбекский сум',          'סום אוזבקי',           12500.0,  0.20],

  // ── Middle East & Central Asia ────────────────────────────────────────────
  ['AED', 'د.إ', 'UAE Dirham',             'Дирхам ОАЭ',             'דירהם איחוד האמירויות',   3.672,  0.00],
  ['AFN', '؋',   'Afghan Afghani',         'Афганский афгани',       'אפגני אפגני',             71.5,   0.30],
  ['BHD', '.د.ب','Bahraini Dinar',          'Бахрейнский динар',      'דינר בחריני',              0.377,  0.00],
  ['ILS', '₪',   'Israeli New Shekel',     'Израильский шекель',     'שקל ישראלי חדש',           3.67,  -0.43],
  ['IQD', 'ع.د', 'Iraqi Dinar',            'Иракский динар',         'דינר עיראקי',            1310.0,  0.10],
  ['IRR', '﷼',   'Iranian Rial',           'Иранский риал',          'ריאל איראני',           42000.0,  0.00],
  ['JOD', 'د.ا', 'Jordanian Dinar',        'Иорданский динар',       'דינר ירדני',               0.709,  0.00],
  ['KWD', 'د.ك', 'Kuwaiti Dinar',          'Кувейтский динар',       'דינר כוויתי',              0.307,  0.00],
  ['LBP', 'ل.ل', 'Lebanese Pound',         'Ливанский фунт',         'לירה לבנונית',          89500.0,  0.50],
  ['OMR', 'ر.ع.','Omani Rial',              'Оманский риал',          'ריאל עומאני',              0.385,  0.00],
  ['QAR', 'ر.ق', 'Qatari Riyal',           'Катарский риял',         'ריאל קטרי',                3.641,  0.00],
  ['SAR', '﷼',   'Saudi Riyal',            'Саудовский риял',        'ריאל סעודי',               3.75,   0.00],
  ['SYP', '£',   'Syrian Pound',           'Сирийский фунт',         'לירה סורית',           13000.0,  0.00],
  ['YER', '﷼',   'Yemeni Rial',            'Йеменский риал',         'ריאל תימני',               250.0,  0.00],

  // ── Asia Pacific ─────────────────────────────────────────────────────────
  ['AUD', '$',   'Australian Dollar',      'Австралийский доллар',   'דולר אוסטרלי',            1.527, -0.15],
  ['BDT', '৳',   'Bangladeshi Taka',       'Бангладешская така',     'טאקה בנגלדשי',            109.5,  0.22],
  ['BND', '$',   'Brunei Dollar',          'Брунейский доллар',      'דולר ברונאי',              1.342,  0.05],
  ['BTN', 'Nu',  'Bhutanese Ngultrum',     'Бутанский нгултрум',     'נגולטרום בהוטני',          83.5,   0.20],
  ['CNY', '¥',   'Chinese Yuan',           'Китайский юань',         'יואן סיני',                7.24,   0.10],
  ['FJD', '$',   'Fijian Dollar',          'Фиджийский доллар',      'דולר פיג׳יאני',             2.24,   0.15],
  ['HKD', '$',   'Hong Kong Dollar',       'Гонконгский доллар',     'דולר הונג קונגי',          7.821, -0.05],
  ['IDR', 'Rp',  'Indonesian Rupiah',      'Индонезийская рупия',    'רופיה אינדונזית',       15600.0,  0.30],
  ['INR', '₹',   'Indian Rupee',           'Индийская рупия',        'רופי הודי',                83.5,   0.18],
  ['JPY', '¥',   'Japanese Yen',           'Японская иена',          'ין יפני',                 149.5,   0.22],
  ['KHR', '៛',   'Cambodian Riel',         'Камбоджийский риель',    'ריל קמבודי',             4099.0,  0.00],
  ['KPW', '₩',   'North Korean Won',       'Северокорейская вона',   'וון צפון קוריאני',         900.0,  0.00],
  ['KRW', '₩',   'South Korean Won',       'Южнокорейская вона',     'וון דרום קוריאני',        1325.0,  0.35],
  ['LAK', '₭',   'Lao Kip',               'Лаосский кип',           'קיפ לאוסי',             20900.0,  0.20],
  ['LKR', 'Rs',  'Sri Lankan Rupee',       'Шри-ланкийская рупия',   'רופי סרי-לנקי',           325.0,  0.40],
  ['MMK', 'K',   'Myanmar Kyat',           'Мьянманский кьят',       'קיאט מיאנמרי',           2096.0,  0.15],
  ['MNT', '₮',   'Mongolian Tögrög',       'Монгольский тугрик',     'טוגריק מונגולי',          3413.0,  0.25],
  ['MOP', 'P',   'Macanese Pataca',        'Макаосская патака',      'פאטאקה מקאוי',             8.07,  -0.03],
  ['MVR', 'Rf',  'Maldivian Rufiyaa',      'Мальдивская руфия',      'רופייה מלדיבית',           15.4,   0.00],
  ['MYR', 'RM',  'Malaysian Ringgit',      'Малайзийский ринггит',   'רינגיט מלזי',              4.70,   0.20],
  ['NPR', 'Rs',  'Nepalese Rupee',         'Непальская рупия',       'רופי נפאלי',              133.0,   0.20],
  ['NZD', '$',   'New Zealand Dollar',     'Новозеландский доллар',  'דולר ניו זילנדי',          1.628, -0.12],
  ['PGK', 'K',   'Papua New Guinean Kina', 'Кина Папуа Новой Гвинеи','קינה של פפואה גינאה',     3.73,   0.10],
  ['PHP', '₱',   'Philippine Peso',        'Филиппинский песо',      'פסו פיליפיני',             56.5,   0.15],
  ['PKR', 'Rs',  'Pakistani Rupee',        'Пакистанская рупия',     'רופי פקיסטני',            279.0,   0.55],
  ['SBD', '$',   'Solomon Islands Dollar', 'Доллар Соломоновых о-вов','דולר איי שלמה',            8.45,  0.10],
  ['SGD', '$',   'Singapore Dollar',       'Сингапурский доллар',    'דולר סינגפורי',            1.342,  0.05],
  ['THB', '฿',   'Thai Baht',              'Тайский бат',            'באט תאילנדי',              35.0,   0.12],
  ['TOP', 'T$',  'Tongan Paʻanga',         'Тонганская паанга',      'פאאנגה טונגי',             2.36,   0.05],
  ['TWD', '$',   'New Taiwan Dollar',      'Новый тайваньский доллар','דולר טייוואני חדש',       31.8,   0.18],
  ['VND', '₫',   'Vietnamese Đồng',        'Вьетнамский донг',       'דונג וייטנאמי',          24350.0,  0.20],
  ['VUV', 'Vt',  'Vanuatu Vatu',           'Вату Вануату',           'ואטו ואנואטו',             118.5,  0.05],
  ['WST', 'T',   'Samoan Tālā',            'Самоанская тала',        'טאלה סמואי',               2.73,   0.05],
  ['XPF', 'Fr',  'CFP Franc',              'Франк КФП',              'פרנק CFP',                110.5,  0.10],

  // ── Africa ────────────────────────────────────────────────────────────────
  ['AOA', 'Kz',  'Angolan Kwanza',         'Ангольская кванза',      'קוונזה אנגולי',            851.0,  0.50],
  ['BIF', 'Fr',  'Burundian Franc',        'Бурундийский франк',     'פרנק בורונדי',            2857.0,  0.10],
  ['BWP', 'P',   'Botswanan Pula',         'Ботсванская пула',       'פולה בוצואנית',             13.5,   0.20],
  ['CDF', 'Fr',  'Congolese Franc',        'Конголезский франк',     'פרנק קונגולזי',           2750.0,  0.30],
  ['CVE', '$',   'Cape Verdean Escudo',    'Эскудо Кабо-Верде',      'אסקודו כף ורד',           101.5,   0.10],
  ['DJF', 'Fr',  'Djiboutian Franc',       'Джибутийский франк',     'פרנק ג׳יבוטי',             178.0,  0.00],
  ['DZD', 'دج',  'Algerian Dinar',         'Алжирский динар',        'דינר אלג׳ירי',             134.5,  0.15],
  ['EGP', '£',   'Egyptian Pound',         'Египетский фунт',        'פאונד מצרי',               30.9,   0.40],
  ['ERN', 'Nfk', 'Eritrean Nakfa',         'Эритрейская накфа',      'נאקפה אריתראי',             15.0,  0.00],
  ['ETB', 'Br',  'Ethiopian Birr',         'Эфиопский быр',          'בִּיר אתיופי',              56.5,  0.35],
  ['GHS', 'GH₵', 'Ghanaian Cedi',          'Ганский седи',           'צ׳דה גאני',                 12.5,   0.55],
  ['GMD', 'D',   'Gambian Dalasi',         'Гамбийский даласи',      'דלאסי גמבי',                67.0,  0.20],
  ['GNF', 'Fr',  'Guinean Franc',          'Гвинейский франк',       'פרנק גינאי',             8600.0,   0.20],
  ['KES', 'KSh', 'Kenyan Shilling',        'Кенийский шиллинг',      'שילינג קניאני',             130.0,  0.30],
  ['KMF', 'Fr',  'Comorian Franc',         'Коморский франк',        'פרנק קומורי',              454.0,  0.10],
  ['LRD', '$',   'Liberian Dollar',        'Либерийский доллар',     'דולר ליבריאני',            184.0,  0.15],
  ['LSL', 'L',   'Lesotho Loti',           'Лотийский лоти',         'לוטי לסות׳ו',               18.62, 0.20],
  ['LYD', 'ل.د', 'Libyan Dinar',           'Ливийский динар',        'דינר לובי',                 4.84,  0.00],
  ['MAD', 'د.م.','Moroccan Dirham',         'Марокканский дирхам',    'דירהם מרוקאי',              10.05, -0.10],
  ['MGA', 'Ar',  'Malagasy Ariary',        'Малагасийский ариари',   'אריארי מדגסקרי',          4670.0,  0.25],
  ['MRU', 'UM',  'Mauritanian Ouguiya',    'Мавританская угия',      'אוגייה מאוריטנית',          37.5,  0.10],
  ['MUR', 'Rs',  'Mauritian Rupee',        'Маврикийская рупия',     'רופי מאוריציאני',           44.5,  0.20],
  ['MWK', 'MK',  'Malawian Kwacha',        'Малавийская квача',      'קוואצ׳ה מלאווי',          1734.0,  0.40],
  ['MZN', 'MT',  'Mozambican Metical',     'Мозамбикский метикал',   'מטיקל מוזמביקי',            63.5,  0.30],
  ['NAD', '$',   'Namibian Dollar',        'Намибийский доллар',     'דולר נמיבי',                18.62, 0.20],
  ['NGN', '₦',   'Nigerian Naira',         'Нигерийская найра',      'נאירה ניגרית',            1580.0,  0.80],
  ['RWF', 'Fr',  'Rwandan Franc',          'Руандийский франк',      'פרנק רואנדי',             1283.0,  0.10],
  ['SCR', 'Rs',  'Seychellois Rupee',      'Сейшельская рупия',      'רופי סיישלי',               13.5,  0.15],
  ['SDG', 'ج.س.','Sudanese Pound',          'Суданский фунт',         'פאונד סודני',              605.0,  0.50],
  ['SHP', '£',   'Saint Helena Pound',     'Фунт Острова Святой Елены','פאונד סנט הלנה',           0.787,  0.00],
  ['SLL', 'Le',  'Sierra Leonean Leone',   'Сьерра-леонский леоне',  'ליאונה סיירה לאונה',      22000.0, 0.20],
  ['SOS', 'Sh',  'Somali Shilling',        'Сомалийский шиллинг',    'שילינג סומלי',              571.0,  0.10],
  ['SSP', '£',   'South Sudanese Pound',   'Южносуданский фунт',     'פאונד סודן הדרומי',        1300.0,  0.80],
  ['STN', 'Db',  'São Tomé & Príncipe Dobra','Добра Сан-Томе и Принсипи','דוברה סאו-טומה',         22.6,  0.10],
  ['SZL', 'L',   'Swazi Lilangeni',        'Свазилендский лилангени','ליאלנגני סוואזי',           18.62, 0.20],
  ['TND', 'د.ت', 'Tunisian Dinar',         'Тунисский динар',        'דינר טוניסי',               3.11,   0.05],
  ['TZS', 'Sh',  'Tanzanian Shilling',     'Танзанийский шиллинг',   'שילינג טנזני',            2506.0,  0.25],
  ['UGX', 'Sh',  'Ugandan Shilling',       'Угандийский шиллинг',    'שילינג אוגנדי',           3774.0,  0.20],
  ['XAF', 'Fr',  'Central African CFA Franc','Франк КФА Центральной Африки','פרנק CFA מרכז אפריקה', 607.0, 0.10],
  ['XOF', 'Fr',  'West African CFA Franc', 'Франк КФА Западной Африки','פרנק CFA מערב אפריקה',   607.0,  0.10],
  ['ZAR', 'R',   'South African Rand',     'Южноафриканский рэнд',   'ראנד דרום אפריקאי',        18.62,  0.20],
  ['ZMW', 'ZK',  'Zambian Kwacha',         'Замбийская квача',       'קוואצ׳ה זמבי',               26.5,  0.35],
  ['ZWL', '$',   'Zimbabwean Dollar',      'Зимбабвийский доллар',   'דולר זימבבואי',            6000.0, 0.50],

  // ── Special / Supranational ───────────────────────────────────────────────
  ['XAU', 'oz',  'Gold (Troy Oz)',          'Золото (тр. унция)',     'זהב (אונקיה)',             0.000526, 0.38],
  ['XAG', 'oz',  'Silver (Troy Oz)',        'Серебро (тр. унция)',    'כסף (אונקיה)',             0.0435, 0.62],
  ['XDR', 'SDR', 'IMF Special Drawing Right','Специальные права заимствования МВФ','זכות משיכה מיוחדת של קרן המטבע', 0.754, 0.05],
];

export const ALL_CURRENCIES: CurrencyInfo[] = RAW.map(
  ([code, symbol, nameEn, nameRu, nameHe, rateToUSD, change24h]) => ({
    code, symbol,
    nameEn, nameRu,
    nameHe: nameHe || nameEn,
    rateToUSD, change24h,
    flag: COUNTRY_BY_CURRENCY[code]
      ? countryFlag(COUNTRY_BY_CURRENCY[code])
      : NEUTRAL_CURRENCY_ICON,
  })
).sort((a, b) => a.code.localeCompare(b.code));

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {};
for (const c of ALL_CURRENCIES) {
  CURRENCY_MAP[c.code] = c;
}

// Top currencies shown prominently in picker and home screen
export const POPULAR_CODES: string[] = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY',
  'AUD', 'CAD', 'CHF', 'ILS', 'RUB',
  'BYN', 'TRY', 'AED', 'SAR', 'INR',
];

// Market overview on home screen
export const MARKET_DISPLAY_CODES: string[] = ['ILS', 'EUR', 'GBP', 'JPY', 'RUB', 'BYN'];
