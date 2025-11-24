export type SportType = 'all' | 'football' | 'basketball' | 'running' | 'volleyball' | 'tennis' | 'hockey' | 'boxing' | 'wrestling' | 'judo' | 'karate' | 'taekwondo' | 'sambo' | 'gymnastics' | 'swimming' | 'athletics' | 'skiing' | 'biathlon' | 'figureskating' | 'speedskating' | 'chess' | 'badminton' | 'tabletennis' | 'cycling' | 'rowing' | 'shooting' | 'archery' | 'fencing' | 'weightlifting' | 'triathlon' | 'pentathlon' | 'handball' | 'waterpolo' | 'rugby' | 'baseball' | 'softball' | 'golf' | 'equestrian' | 'sailing' | 'surfing' | 'climbing' | 'skateboarding' | 'bmx' | 'mountainbike' | 'freestyleskiing' | 'snowboarding' | 'curling' | 'bobsleigh' | 'luge' | 'skeleton';

export type EventLevel = 'municipal' | 'intermunicipal' | 'regional' | 'interregional' | 'cfo' | 'national' | 'european' | 'world';

export interface RequiredDocument {
  type: 'approval_letter' | 'police_notification' | 'security_plan' | 'regulations' | 'protocols';
  name: string;
  uploaded: boolean;
  url?: string;
  fileName?: string;
}

export interface Event {
  id: number;
  eventNumber?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  eventType?: 'local' | 'away';
  eventLevel?: EventLevel;
  sport: SportType;
  participants: number;
  maxParticipants: number;
  maxSpectators?: number;
  status: 'upcoming' | 'past';
  description: string;
  organizer: string;
  result?: string;
  approved: boolean;
  submittedAt: string;
  submittedBy?: string;
  documents?: { name: string; url: string }[];
  media?: { type: 'image' | 'video'; url: string; name: string }[];
  requiredDocuments?: RequiredDocument[];
}

export interface User {
  id?: number;
  email: string;
  name: string;
  phone: string;
  password?: string;
  userType?: string;
  approved?: boolean;
  submittedAt?: string;
  birthDate?: string;
  passportSeries?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportIssuedBy?: string;
  inn?: string;
  companyName?: string;
  legalAddress?: string;
}

export const eventLevelNames: Record<EventLevel, string> = {
  municipal: 'Муниципальное',
  intermunicipal: 'Межмуниципальное',
  regional: 'Региональное',
  interregional: 'Межрегиональное',
  cfo: 'ЦФО',
  national: 'Всероссийское',
  european: 'Европейское',
  world: 'Мировое'
};

export const requiredDocumentNames: Record<RequiredDocument['type'], string> = {
  approval_letter: 'Письмо о согласовании',
  police_notification: 'Уведомление ОМВД',
  security_plan: 'План ОБ',
  regulations: 'Положение',
  protocols: 'Протоколы'
};

export const sportIcons: Record<SportType, string> = {
  all: 'Trophy',
  football: 'Circle',
  basketball: 'CircleDot',
  running: 'Zap',
  volleyball: 'Disc',
  tennis: 'Target',
  hockey: 'Disc',
  boxing: 'Hexagon',
  wrestling: 'Activity',
  judo: 'Activity',
  karate: 'Activity',
  taekwondo: 'Activity',
  sambo: 'Activity',
  gymnastics: 'Users',
  swimming: 'Waves',
  athletics: 'Zap',
  skiing: 'Mountain',
  biathlon: 'Mountain',
  figureskating: 'Sparkles',
  speedskating: 'Zap',
  chess: 'Grid3x3',
  badminton: 'Target',
  tabletennis: 'Target',
  cycling: 'Bike',
  rowing: 'Waves',
  shooting: 'Target',
  archery: 'Target',
  fencing: 'Sword',
  weightlifting: 'Dumbbell',
  triathlon: 'Activity',
  pentathlon: 'Award',
  handball: 'Circle',
  waterpolo: 'Waves',
  rugby: 'Circle',
  baseball: 'Circle',
  softball: 'Circle',
  golf: 'Flag',
  equestrian: 'Horse',
  sailing: 'Anchor',
  surfing: 'Waves',
  climbing: 'Mountain',
  skateboarding: 'Activity',
  bmx: 'Bike',
  mountainbike: 'Bike',
  freestyleskiing: 'Mountain',
  snowboarding: 'Mountain',
  curling: 'Disc',
  bobsleigh: 'Zap',
  luge: 'Zap',
  skeleton: 'Zap'
};

export const sportNames: Record<SportType, string> = {
  all: 'Все виды',
  football: 'Футбол',
  basketball: 'Баскетбол',
  running: 'Бег',
  volleyball: 'Волейбол',
  tennis: 'Теннис',
  hockey: 'Хоккей',
  boxing: 'Бокс',
  wrestling: 'Борьба',
  judo: 'Дзюдо',
  karate: 'Карате',
  taekwondo: 'Тхэквондо',
  sambo: 'Самбо',
  gymnastics: 'Гимнастика',
  swimming: 'Плавание',
  athletics: 'Лёгкая атлетика',
  skiing: 'Лыжные гонки',
  biathlon: 'Биатлон',
  figureskating: 'Фигурное катание',
  speedskating: 'Конькобежный спорт',
  chess: 'Шахматы',
  badminton: 'Бадминтон',
  tabletennis: 'Настольный теннис',
  cycling: 'Велоспорт',
  rowing: 'Гребля',
  shooting: 'Стрельба',
  archery: 'Стрельба из лука',
  fencing: 'Фехтование',
  weightlifting: 'Тяжёлая атлетика',
  triathlon: 'Триатлон',
  pentathlon: 'Пятиборье',
  handball: 'Гандбол',
  waterpolo: 'Водное поло',
  rugby: 'Регби',
  baseball: 'Бейсбол',
  softball: 'Софтбол',
  golf: 'Гольф',
  equestrian: 'Конный спорт',
  sailing: 'Парусный спорт',
  surfing: 'Сёрфинг',
  climbing: 'Скалолазание',
  skateboarding: 'Скейтбординг',
  bmx: 'BMX',
  mountainbike: 'Маунтинбайк',
  freestyleskiing: 'Фристайл',
  snowboarding: 'Сноубординг',
  curling: 'Кёрлинг',
  bobsleigh: 'Бобслей',
  luge: 'Санный спорт',
  skeleton: 'Скелетон'
};

export const createDefaultRequiredDocuments = (): RequiredDocument[] => [
  { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: false },
  { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: false },
  { type: 'security_plan', name: 'План ОБ', uploaded: false },
  { type: 'regulations', name: 'Положение', uploaded: false },
  { type: 'protocols', name: 'Протоколы', uploaded: false }
];

export const getDocumentStatus = (event: Event): 'red' | 'yellow' | 'blue' | 'green' => {
  if (!event.requiredDocuments) return 'red';
  
  const approvalLetter = event.requiredDocuments.find(d => d.type === 'approval_letter')?.uploaded || false;
  const policeNotification = event.requiredDocuments.find(d => d.type === 'police_notification')?.uploaded || false;
  const securityPlan = event.requiredDocuments.find(d => d.type === 'security_plan')?.uploaded || false;
  const regulations = event.requiredDocuments.find(d => d.type === 'regulations')?.uploaded || false;
  const protocols = event.requiredDocuments.find(d => d.type === 'protocols')?.uploaded || false;
  
  const hasMedia = event.media && event.media.length > 0;
  
  if (!approvalLetter || !policeNotification || !securityPlan || !regulations) {
    return 'red';
  }
  
  if (!protocols) {
    return 'yellow';
  }
  
  if (!hasMedia) {
    return 'blue';
  }
  
  return 'green';
};

export const initialEvents: Event[] = [
  {
    id: 1,
    eventNumber: 'МО-2025-001',
    title: 'Первенство муниципального округа Истра по самбо среди юношей 2012-2013 года рождения',
    date: '2025-11-15',
    time: '10:00',
    location: 'Спортивный комплекс "Истра", ул. Ленина, 1',
    eventType: 'local',
    eventLevel: 'municipal',
    sport: 'sambo',
    participants: 0,
    maxParticipants: 50,
    status: 'upcoming',
    description: 'Соревнования по самбо среди юношей 2012-2013 года рождения. Регистрация участников до 10 ноября 2025 года.',
    organizer: 'Управление физической культуры и спорта м.о. Истра',
    approved: true,
    submittedAt: new Date().toISOString(),
    documents: [
      { name: 'Положение о первенстве по самбо.pdf', url: '#' },
      { name: 'Регламент соревнований.pdf', url: '#' },
      { name: 'Заявка на участие.docx', url: '#' }
    ],
    requiredDocuments: [
      { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: true, url: '#', fileName: 'approval.pdf' },
      { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: true, url: '#', fileName: 'police.pdf' },
      { type: 'security_plan', name: 'План ОБ', uploaded: true, url: '#', fileName: 'security.pdf' },
      { type: 'regulations', name: 'Положение', uploaded: true, url: '#', fileName: 'regulations.pdf' },
      { type: 'protocols', name: 'Протоколы', uploaded: true, url: '#', fileName: 'protocols.pdf' }
    ],
    media: [
      { type: 'image', url: '#', name: 'photo1.jpg' }
    ]
  },
  {
    id: 2,
    eventNumber: 'МО-2025-002',
    eventType: 'local',
    eventLevel: 'municipal',
    title: 'Турнир по баскетболу среди школ (красный индикатор)',
    date: '2025-11-18',
    time: '14:00',
    location: 'Спортивная школа №3',
    sport: 'basketball',
    participants: 0,
    maxParticipants: 80,
    status: 'upcoming',
    description: 'Школьный турнир по баскетболу для учеников 8-11 классов.',
    organizer: 'Спортивная школа №3',
    approved: true,
    submittedAt: new Date().toISOString(),
    requiredDocuments: [
      { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: false },
      { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: false },
      { type: 'security_plan', name: 'План ОБ', uploaded: false },
      { type: 'regulations', name: 'Положение', uploaded: false },
      { type: 'protocols', name: 'Протоколы', uploaded: false }
    ]
  },
  {
    id: 3,
    eventNumber: 'МО-2025-003',
    eventType: 'local',
    eventLevel: 'municipal',
    title: 'Соревнования по плаванию (желтый индикатор)',
    date: '2025-11-20',
    time: '11:00',
    location: 'Бассейн "Олимп"',
    sport: 'swimming',
    participants: 0,
    maxParticipants: 40,
    status: 'upcoming',
    description: 'Открытые соревнования по плаванию среди юниоров.',
    organizer: 'Плавательный клуб "Дельфин"',
    approved: true,
    submittedAt: new Date().toISOString(),
    requiredDocuments: [
      { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: true, url: '#', fileName: 'approval.pdf' },
      { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: true, url: '#', fileName: 'police.pdf' },
      { type: 'security_plan', name: 'План ОБ', uploaded: true, url: '#', fileName: 'security.pdf' },
      { type: 'regulations', name: 'Положение', uploaded: true, url: '#', fileName: 'regulations.pdf' },
      { type: 'protocols', name: 'Протоколы', uploaded: false }
    ]
  },
  {
    id: 4,
    eventNumber: 'МО-2025-004',
    eventType: 'local',
    eventLevel: 'municipal',
    title: 'Чемпионат по теннису (синий индикатор)',
    date: '2025-11-22',
    time: '10:00',
    location: 'Теннисный центр',
    sport: 'tennis',
    participants: 0,
    maxParticipants: 32,
    status: 'upcoming',
    description: 'Областной турнир по теннису.',
    organizer: 'Теннисный клуб "Ас"',
    approved: true,
    submittedAt: new Date().toISOString(),
    requiredDocuments: [
      { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: true, url: '#', fileName: 'approval.pdf' },
      { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: true, url: '#', fileName: 'police.pdf' },
      { type: 'security_plan', name: 'План ОБ', uploaded: true, url: '#', fileName: 'security.pdf' },
      { type: 'regulations', name: 'Положение', uploaded: true, url: '#', fileName: 'regulations.pdf' },
      { type: 'protocols', name: 'Протоколы', uploaded: true, url: '#', fileName: 'protocols.pdf' }
    ]
  }
];
