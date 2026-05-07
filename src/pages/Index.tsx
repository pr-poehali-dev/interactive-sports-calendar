import { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import MediaUploader from '@/components/MediaUploader';

type SportType = 'all' | 'football' | 'basketball' | 'running' | 'volleyball' | 'tennis' | 'hockey' | 'boxing' | 'wrestling' | 'judo' | 'karate' | 'taekwondo' | 'sambo' | 'gymnastics' | 'swimming' | 'athletics' | 'skiing' | 'biathlon' | 'figureskating' | 'speedskating' | 'chess' | 'badminton' | 'tabletennis' | 'cycling' | 'rowing' | 'shooting' | 'archery' | 'fencing' | 'weightlifting' | 'triathlon' | 'pentathlon' | 'handball' | 'waterpolo' | 'rugby' | 'baseball' | 'softball' | 'golf' | 'equestrian' | 'sailing' | 'surfing' | 'climbing' | 'skateboarding' | 'bmx' | 'mountainbike' | 'freestyleskiing' | 'snowboarding' | 'curling' | 'bobsleigh' | 'luge' | 'skeleton';

type EventLevel = 'municipal' | 'intermunicipal' | 'regional' | 'interregional' | 'cfo' | 'national' | 'european' | 'world';

interface RequiredDocument {
  type: 'approval_letter' | 'police_notification' | 'security_plan' | 'regulations' | 'protocols';
  name: string;
  uploaded: boolean;
  url?: string;
  fileName?: string;
}

interface Event {
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
  responsiblePerson?: string;
  responsiblePosition?: string;
  responsiblePhone?: string;
  result?: string;
  actualParticipants?: number;
  actualSpectators?: number;
  actualComment?: string;
  approved: boolean;
  submittedAt: string;
  submittedBy?: string;
  documents?: { name: string; url: string }[];
  media?: { type: 'image' | 'video'; url: string; name: string }[];
  requiredDocuments?: RequiredDocument[];
  additionalDates?: string[];
}

const eventLevelNames: Record<EventLevel, string> = {
  municipal: 'Муниципальное',
  intermunicipal: 'Межмуниципальное',
  regional: 'Региональное',
  interregional: 'Межрегиональное',
  cfo: 'ЦФО',
  national: 'Всероссийское',
  european: 'Европейское',
  world: 'Мировое'
};

const requiredDocumentNames: Record<RequiredDocument['type'], string> = {
  approval_letter: 'Письмо о согласовании',
  police_notification: 'Уведомление ОМВД',
  security_plan: 'План ОБ',
  regulations: 'Положение',
  protocols: 'Протоколы'
};

const createDefaultRequiredDocuments = (): RequiredDocument[] => [
  { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: false },
  { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: false },
  { type: 'security_plan', name: 'План ОБ', uploaded: false },
  { type: 'regulations', name: 'Положение', uploaded: false },
  { type: 'protocols', name: 'Протоколы', uploaded: false }
];

// Функция определения статуса документов
const getDocumentStatus = (event: Event): 'red' | 'yellow' | 'blue' | 'green' => {
  if (!event.requiredDocuments) return 'red';
  
  const approvalLetter = event.requiredDocuments.find(d => d.type === 'approval_letter')?.uploaded || false;
  const policeNotification = event.requiredDocuments.find(d => d.type === 'police_notification')?.uploaded || false;
  const securityPlan = event.requiredDocuments.find(d => d.type === 'security_plan')?.uploaded || false;
  const regulations = event.requiredDocuments.find(d => d.type === 'regulations')?.uploaded || false;
  const protocols = event.requiredDocuments.find(d => d.type === 'protocols')?.uploaded || false;
  
  const hasMedia = event.media && event.media.length > 0;
  
  // Красный: не загружены основные 4 документа
  if (!approvalLetter || !policeNotification || !securityPlan || !regulations) {
    return 'red';
  }
  
  // Желтый: загружены основные 4, но нет протоколов
  if (!protocols) {
    return 'yellow';
  }
  
  // Синий: все обязательные документы есть, но нет медиа
  if (!hasMedia) {
    return 'blue';
  }
  
  // Зеленый: все есть
  return 'green';
};

const initialEvents: Event[] = [
  {
    id: 1,
    eventNumber: 'МО-2025-001',
    title: 'Городской марафон "5 Верст"',
    date: '2025-11-29',
    time: '09:00',
    location: 'Центральный парк, г. Истра',
    eventType: 'local',
    eventLevel: 'municipal',
    sport: 'running',
    participants: 0,
    maxParticipants: 50,
    status: 'upcoming',
    description: '',
    organizer: 'Истран',
    approved: false,
    submittedAt: '2025-11-24T13:09:24.755503Z',
    submittedBy: 'ereminvaleriy87@gmail.com',
    documents: [],
    media: [],
    requiredDocuments: [
      { type: 'approval_letter', name: 'Письмо о согласовании', uploaded: false },
      { type: 'police_notification', name: 'Уведомление ОМВД', uploaded: false },
      { type: 'security_plan', name: 'План ОБ', uploaded: false },
      { type: 'regulations', name: 'Положение', uploaded: false },
      { type: 'protocols', name: 'Протоколы', uploaded: false }
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

const sportIcons: Record<SportType, string> = {
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

const sportNames: Record<SportType, string> = {
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

interface User {
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

export default function Index() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [selectedDocStatus, setSelectedDocStatus] = useState<'all' | 'red' | 'yellow' | 'blue' | 'green'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('adminEmail') || 'admin@istraevents.ru';
  });
  const [storedAdminPassword, setStoredAdminPassword] = useState(() => {
    return localStorage.getItem('adminPassword') || 'admin123';
  });
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isManageFilesDialogOpen, setIsManageFilesDialogOpen] = useState(false);
  const [manageFilesEvent, setManageFilesEvent] = useState<Event | null>(null);
  const [uploadFileType, setUploadFileType] = useState<'document' | 'media'>('document');
  const [uploadMediaType, setUploadMediaType] = useState<'image' | 'video'>('image');
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<string>('');
  const [messageSubject, setMessageSubject] = useState<string>('');
  const [messageBody, setMessageBody] = useState<string>('');
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState<string>('');
  const [broadcastBody, setBroadcastBody] = useState<string>('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportEvent, setReportEvent] = useState<Event | null>(null);
  const [reportActualParticipants, setReportActualParticipants] = useState<string>('');
  const [reportActualSpectators, setReportActualSpectators] = useState<string>('');
  const [reportActualComment, setReportActualComment] = useState<string>('');
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isDeleteAllEventsDialogOpen, setIsDeleteAllEventsDialogOpen] = useState(false);
  const [deleteAllEventsPassword, setDeleteAllEventsPassword] = useState('');
  const [isDeletingAllEvents, setIsDeletingAllEvents] = useState(false);
  const [deletePeriodType, setDeletePeriodType] = useState<'all' | 'year' | 'month' | 'range'>('all');
  const [deleteYear, setDeleteYear] = useState<string>(new Date().getFullYear().toString());
  const [deleteMonth, setDeleteMonth] = useState<string>('');
  const [deleteDateFrom, setDeleteDateFrom] = useState<string>('');
  const [deleteDateTo, setDeleteDateTo] = useState<string>('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectingEventId, setRejectingEventId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    name: '', 
    phone: '',
    userType: 'individual' as 'individual' | 'legal',
    inn: '',
    companyName: '',
    legalAddress: '',
    birthDate: '',
    passportSeries: '',
    passportNumber: '',
    passportIssueDate: '',
    passportIssuedBy: '',
    agreeToTerms: false
  });
  const [registrations, setRegistrations] = useState<Array<{
    id: number;
    fullName: string;
    phone: string;
    email: string;
    eventName: string;
    createdAt: string;
  }>>([]);
  const [users, setUsers] = useState<Array<User & { 
    password: string;
    userType?: 'individual' | 'legal';
    inn?: string;
    companyName?: string;
    legalAddress?: string;
    birthDate?: string;
    passportSeries?: string;
    passportNumber?: string;
    passportIssueDate?: string;
    passportIssuedBy?: string;
    approved?: boolean;
    submittedAt?: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customSport, setCustomSport] = useState('');
  const [showCustomSportInput, setShowCustomSportInput] = useState(false);
  const [suggestedEventType, setSuggestedEventType] = useState<'local' | 'away' | null>(null);
  const [manualEventNumber, setManualEventNumber] = useState('');
  const [showManualEventNumber, setShowManualEventNumber] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    location: '',
    sport: 'running',
    eventLevel: 'municipal',
    description: '',
    organizer: '',
    maxParticipants: 50,
    participants: 0,
    status: 'upcoming',
    additionalDates: []
  });
  const [eventDaysCount, setEventDaysCount] = useState<number>(1);

  useEffect(() => {
    const loadUsers = () => {
      fetch('https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?action=list')
        .then(res => res.json())
        .then(data => {
          if (data.users) {
            setUsers(data.users.map((u: Record<string, unknown>) => ({
              id: u.id,
              email: u.email,
              name: u.name,
              phone: u.phone || '',
              password: '',
              userType: u.user_type,
              approved: u.approved,
              submittedAt: u.submitted_at,
              birthDate: u.birth_date,
              passportSeries: u.passport_series,
              passportNumber: u.passport_number,
              passportIssueDate: u.passport_issue_date,
              passportIssuedBy: u.passport_issued_by,
              inn: u.inn,
              companyName: u.company_name,
              legalAddress: u.legal_address
            })));
          }
        })
        .catch(err => console.error('Failed to load users:', err));
    };

    if (isAdmin) {
      loadUsers();
      const interval = setInterval(loadUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const loadEvents = async () => {
    try {
      const url = 'https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?action=list&resource=events';
      const response = await fetch(url);
      const data = await response.json();
      if (data.events) {
        const mapped = data.events.map((e: Record<string, unknown>) => ({
          ...e,
          eventNumber: e.event_number,
          eventType: e.event_type,
          eventLevel: e.event_level,
          maxParticipants: e.max_participants,
          maxSpectators: e.max_spectators,
          submittedAt: e.submitted_at,
          submittedBy: e.submitted_by,
          requiredDocuments: e.required_documents,
          responsiblePerson: e.responsible_person,
          responsiblePosition: e.responsible_position,
          responsiblePhone: e.responsible_phone,
          additionalDates: (e.additional_dates as string[]) || [],
          actualParticipants: e.actual_participants as number | undefined,
          actualSpectators: e.actual_spectators as number | undefined,
          actualComment: e.actual_comment as string | undefined,
        }));
        setEvents(mapped);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updatedEvents = events.map(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      if (eventDate < today && event.status === 'upcoming') {
        return { ...event, status: 'past' as const };
      }
      return event;
    });
    
    const hasChanges = updatedEvents.some((e, i) => e.status !== events[i].status);
    if (hasChanges) {
      setEvents(updatedEvents);
    }
  }, [events]);

  const approvedEvents = events.filter(event => event.approved);
  const pendingEvents = events.filter(event => !event.approved);
  
  const approvedUsers = useMemo(() => users.filter(user => user.approved), [users]);
  const pendingUsers = useMemo(() => users.filter(user => !user.approved), [users]);
  
  const filteredEvents = approvedEvents.filter(event => {
    const matchesSport = selectedSport === 'all' ? true : event.sport === selectedSport;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.eventNumber && event.eventNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDocStatus = selectedDocStatus === 'all' ? true : getDocumentStatus(event) === selectedDocStatus;
    return matchesSport && matchesSearch && matchesDocStatus;
  });

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.status === 'past');
  
  const upcomingDocStats = useMemo(() => {
    const stats = { red: 0, yellow: 0, blue: 0, green: 0 };
    upcomingEvents.forEach(event => {
      const status = getDocumentStatus(event);
      stats[status]++;
    });
    return stats;
  }, [upcomingEvents]);
  
  const pastDocStats = useMemo(() => {
    const stats = { red: 0, yellow: 0, blue: 0, green: 0 };
    pastEvents.forEach(event => {
      const status = getDocumentStatus(event);
      stats[status]++;
    });
    return stats;
  }, [pastEvents]);

  useEffect(() => {
    localStorage.setItem('adminEmail', adminEmail);
  }, [adminEmail]);

  useEffect(() => {
    localStorage.setItem('adminPassword', storedAdminPassword);
  }, [storedAdminPassword]);

  const handleRegister = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    setRegisteredEvents([...registeredEvents, eventId]);
    
    if (event) {
      toast({
        title: "Регистрация успешна",
        description: `Вы зарегистрированы на "${event.title}"`
      });
    }
  };

  const exportToExcel = (eventsToExport: Event[], filename: string) => {
    const rows = eventsToExport.map((e) => ({
      'Номер': e.eventNumber || '',
      'Название': e.title,
      'Дата': new Date(e.date).toLocaleDateString('ru-RU'),
      'Время': e.time,
      'Место проведения': e.location,
      'Вид спорта': e.sport,
      'Статус мероприятия': e.eventLevel || '',
      'Тип': e.eventType === 'away' ? 'Выездное' : 'Местное',
      'Организатор': e.organizer,
      'ФИО ответственного': e.responsiblePerson || '',
      'Должность': e.responsiblePosition || '',
      'Телефон ответственного': e.responsiblePhone || '',
      'Участников': e.participants,
      'Макс. участников': e.maxParticipants,
      'Описание': e.description,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Мероприятия');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.organizer || !newEvent.eventLevel || !newEvent.responsiblePerson || !newEvent.responsiblePhone) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }
    
    if (showCustomSportInput && !customSport.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите название вида спорта",
        variant: "destructive"
      });
      return;
    }
    
    const eventType = newEvent.eventType || suggestedEventType || 'local';
    const eventLevel = newEvent.eventLevel;
    
    let finalEventNumber: string | undefined;
    if (manualEventNumber.trim()) {
      finalEventNumber = manualEventNumber.trim();
    }
    
    const finalSport = showCustomSportInput ? customSport : newEvent.sport;
    const finalTitle = showCustomSportInput 
      ? `${newEvent.title} (${customSport})`
      : newEvent.title;
    
    const eventData = {
      event_number: finalEventNumber,
      title: finalTitle,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      event_type: eventType,
      event_level: newEvent.eventLevel,
      sport: (showCustomSportInput ? 'all' : newEvent.sport) as SportType,
      description: newEvent.description || '',
      organizer: newEvent.organizer,
      responsible_person: newEvent.responsiblePerson,
      responsible_position: newEvent.responsiblePosition,
      responsible_phone: newEvent.responsiblePhone,
      max_participants: newEvent.maxParticipants || 50,
      max_spectators: newEvent.maxSpectators,
      participants: 0,
      status: 'upcoming',
      approved: isAdmin,
      submitted_by: currentUser?.email,
      additional_dates: (newEvent.additionalDates || []).filter(d => d)
    };
    
    console.log('Отправка мероприятия:', eventData);
    
    fetch('https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })
    .then(response => {
      console.log('Ответ сервера:', response.status, response.statusText);
      return response.json();
    })
    .then(data => {
      console.log('Данные ответа:', data);
      if (data.success) {
        setIsAddDialogOpen(false);
        loadEvents();
        
        if (isAdmin) {
          toast({
            title: "Мероприятие добавлено",
            description: `"${eventData.title}" успешно добавлено в календарь`
          });
        } else {
          // Дублируем в заявки для совместимости
          fetch('https://functions.poehali.dev/c7d95915-b55a-4c1f-a5ad-58bbb6f2cb28', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: currentUser?.name || 'Неизвестный',
              phone: currentUser?.phone || 'Не указан',
              email: currentUser?.email || 'Не указан',
              eventName: `${eventData.title} (${new Date(eventData.date).toLocaleDateString('ru-RU')})`
            })
          }).catch(() => {});
          
          toast({
            title: "Заявка отправлена",
            description: `"${eventData.title}" сохранена и отправлена на модерацию`
          });
        }
      }
    })
    .catch(error => {
      console.error('Ошибка сохранения мероприятия:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить мероприятие",
        variant: "destructive"
      });
    });
    
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      sport: 'running',
      eventLevel: 'municipal',
      description: '',
      organizer: '',
      responsiblePerson: '',
      responsiblePosition: '',
      responsiblePhone: '',
      maxParticipants: 50,
      maxSpectators: undefined,
      participants: 0,
      status: 'upcoming',
      additionalDates: []
    });
    setEventDaysCount(1);
    setCustomSport('');
    setShowCustomSportInput(false);
    setManualEventNumber('');
    setShowManualEventNumber(false);
  };
  
  const handleApproveEvent = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=approve&event_id=${eventId}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve event');
      }
      
      const data = await response.json();
      const eventNumber = data.event_number;
      
      await loadEvents();
      
      toast({
        title: "Мероприятие одобрено ✅",
        description: eventNumber 
          ? `"${event.title}" добавлено. Номер: ${eventNumber}. Email отправлен организатору.`
          : `"${event.title}" добавлено. Email отправлен организатору.`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить мероприятие",
        variant: "destructive"
      });
    }
  };
  

  const handleRejectEvent = async (eventId: number, reason?: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    let deleteSuccess = false;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&event_id=${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete event failed:', errorData);
        toast({
          title: "Ошибка удаления",
          description: errorData.error || "Не удалось удалить мероприятие из базы",
          variant: "destructive"
        });
        return;
      }
      
      deleteSuccess = true;
      await loadEvents();
    } catch (error) {
      console.error('handleRejectEvent error:', error);
      toast({
        title: "Ошибка сети",
        description: `Не удалось связаться с сервером: ${error}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!deleteSuccess) return;
    
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Заявка на мероприятие отклонена</h2>
          
          <p>Добрый день!</p>
          <p>К сожалению, ваша заявка на проведение мероприятия не прошла модерацию.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border-left: 4px solid #dc2626;">
            <tr style="background: #fee;">
              <td colspan="2" style="padding: 15px; border: 1px solid #ddd;"><strong style="color: #dc2626; font-size: 18px;">${event.title}</strong></td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd; width: 40%;"><strong>Дата:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${event.time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Место:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.location}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Организатор:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.organizer}</td>
            </tr>
          </table>
          
          ${reason ? `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Причина отклонения:</strong></p>
            <p style="margin: 10px 0 0 0;">${reason}</p>
          </div>
          ` : `
          <p><strong>Возможные причины отклонения:</strong></p>
          <ul>
            <li>Неполная или некорректная информация о мероприятии</li>
            <li>Несоответствие календарному плану</li>
            <li>Конфликт по датам с другими событиями</li>
            <li>Недостаточная подготовка документации</li>
          </ul>
          `}
          
          <p>Вы можете уточнить детали и подать заявку повторно с учётом замечаний.</p>
          
          <p style="margin: 30px 0;">
            <a href="${window.location.origin}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Подать заявку повторно</a>
          </p>
          
          <p><strong>Для получения консультации свяжитесь с нами:</strong></p>
          <p>Телефон: +7 (495) 994-85-55 (доб. 429)<br>
          Email: info@sportvokrugistra.ru</p>
          
          <p>С уважением,<br>Управление физической культуры и спорта м.о. Истра</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
            г. Истра, ул. Ленина, д. 81 | +7 (495) 994-85-55 (доб. 429)<br>
            info@sportvokrugistra.ru
          </p>
        </body>
      </html>
    `;
    
    if (event.submittedBy) {
      try {
        await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: event.submittedBy,
            subject: `Заявка на мероприятие "${event.title}" отклонена`,
            html: emailHtml
          })
        });
      } catch (error) {
        // Игнорируем ошибки отправки
      }
    }
    
    setIsRejectDialogOpen(false);
    setRejectingEventId(null);
    setRejectionReason('');
    
    toast({
      title: "Мероприятие отклонено",
      description: `"${event.title}" было удалено из заявок`,
      variant: "destructive"
    });
  };
  
  const openRejectDialog = (eventId: number) => {
    setRejectingEventId(eventId);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };
  
  const confirmRejectEvent = () => {
    if (rejectingEventId) {
      handleRejectEvent(rejectingEventId, rejectionReason || undefined);
    }
  };
  
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      sport: event.sport,
      eventType: event.eventType,
      eventLevel: event.eventLevel,
      description: event.description,
      organizer: event.organizer,
      maxParticipants: event.maxParticipants,
      maxSpectators: event.maxSpectators,
      status: event.status
    });
    setManualEventNumber(event.eventNumber || '');
    const needsManualNumber = !(event.eventType === 'local' && (event.eventLevel === 'municipal' || event.eventLevel === 'intermunicipal'));
    setShowManualEventNumber(needsManualNumber);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveFiles = async (eventData: typeof manageFilesEvent) => {
    if (!eventData) return;
    try {
      const response = await fetch(
        `https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=save-files&event_id=${eventData.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documents: eventData.documents || [],
            media: eventData.media || [],
            required_documents: eventData.requiredDocuments || [],
            requester_email: currentUser?.email || null,
            is_admin: isAdmin
          })
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Ошибка сохранения');
      await loadEvents();
      toast({ title: 'Файлы сохранены', description: 'Изменения успешно записаны' });
    } catch (error) {
      toast({ title: 'Ошибка', description: `${error}`, variant: 'destructive' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.organizer || !newEvent.eventLevel) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }
    
    const eventType = newEvent.eventType || 'local';
    const eventLevel = newEvent.eventLevel;
    const isAutoNumber = eventType === 'local' && (eventLevel === 'municipal' || eventLevel === 'intermunicipal');
    
    let finalEventNumber: string | undefined;
    if (isAutoNumber) {
      finalEventNumber = editingEvent.eventNumber;
    } else if (manualEventNumber.trim()) {
      finalEventNumber = manualEventNumber.trim();
    }
    
    const updateData = {
      event_number: finalEventNumber,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      event_type: eventType,
      event_level: newEvent.eventLevel,
      sport: newEvent.sport,
      description: newEvent.description || '',
      organizer: newEvent.organizer,
      max_participants: newEvent.maxParticipants || 50,
      max_spectators: newEvent.maxSpectators,
      status: newEvent.status,
      participants: editingEvent.participants,
      requester_email: currentUser?.email || null,
      is_admin: isAdmin
    };
    
    try {
      const response = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=update&event_id=${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update event');
      }
      
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        sport: 'running',
        eventLevel: 'municipal',
        description: '',
        organizer: '',
        maxParticipants: 50,
        maxSpectators: undefined,
        participants: 0,
        status: 'upcoming'
      });
      setManualEventNumber('');
      setShowManualEventNumber(false);
      
      await loadEvents();
      
      toast({
        title: "Изменения сохранены",
        description: `Мероприятие "${updateData.title}" обновлено`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить мероприятие",
        variant: "destructive"
      });
    }
  };
  
  const handleOpenReport = (event: Event) => {
    setReportEvent(event);
    setReportActualParticipants(event.actualParticipants != null ? String(event.actualParticipants) : '');
    setReportActualSpectators(event.actualSpectators != null ? String(event.actualSpectators) : '');
    setReportActualComment(event.actualComment || '');
    setIsReportDialogOpen(true);
  };

  const handleSaveReport = async () => {
    if (!reportEvent) return;
    setIsSavingReport(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=report&event_id=${reportEvent.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actual_participants: reportActualParticipants !== '' ? Number(reportActualParticipants) : null,
            actual_spectators: reportActualSpectators !== '' ? Number(reportActualSpectators) : null,
            actual_comment: reportActualComment || null,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'error');
      setIsReportDialogOpen(false);
      setReportEvent(null);
      await loadEvents();
      toast({ title: 'Итоги сохранены', description: `Данные по мероприятию обновлены` });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить итоги', variant: 'destructive' });
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleAdminLogin = async () => {
    if (adminPassword === storedAdminPassword) {
      setIsAdmin(true);
      setIsAdminDialogOpen(false);
      setAdminPassword('');
      
      // Загружаем заявки из БД
      try {
        const regResponse = await fetch('https://functions.poehali.dev/c7d95915-b55a-4c1f-a5ad-58bbb6f2cb28');
        const regData = await regResponse.json();
        if (regData.registrations) {
          setRegistrations(regData.registrations);
        }
      } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
      }
      
      // Загружаем пользователей из БД
      try {
        const usersResponse = await fetch('https://functions.poehali.dev/9cd5f036-0bca-495b-9742-de598c37754f');
        const usersData = await usersResponse.json();
        if (usersData.users) {
          setUsers(usersData.users);
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
      
      toast({
        title: "Вход выполнен",
        description: "Вы вошли в режим администратора"
      });
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный пароль",
        variant: "destructive"
      });
    }
  };
  
  const handleAdminLogout = () => {
    setIsAdmin(false);
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из режима администратора"
    });
  };
  
  const handleUserRegister = async () => {
    if (!registerForm.email || !registerForm.password || !registerForm.name || !registerForm.phone) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }
    
    if (registerForm.userType === 'individual' && (!registerForm.birthDate || !registerForm.passportSeries || !registerForm.passportNumber || !registerForm.passportIssueDate || !registerForm.passportIssuedBy)) {
      toast({
        title: "Ошибка",
        description: "Для физических лиц необходимо заполнить все паспортные данные",
        variant: "destructive"
      });
      return;
    }
    
    if (registerForm.userType === 'legal' && (!registerForm.inn || !registerForm.companyName || !registerForm.legalAddress)) {
      toast({
        title: "Ошибка",
        description: "Для юридических лиц необходимо заполнить все дополнительные поля",
        variant: "destructive"
      });
      return;
    }
    
    if (!registerForm.agreeToTerms) {
      toast({
        title: "Ошибка",
        description: "Необходимо дать согласие на обработку персональных данных",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          name: registerForm.name,
          phone: registerForm.phone,
          user_type: registerForm.userType,
          inn: registerForm.inn,
          company_name: registerForm.companyName,
          legal_address: registerForm.legalAddress,
          birth_date: registerForm.birthDate,
          passport_series: registerForm.passportSeries,
          passport_number: registerForm.passportNumber,
          passport_issue_date: registerForm.passportIssueDate,
          passport_issued_by: registerForm.passportIssuedBy
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Ошибка регистрации",
          description: data.error || "Не удалось зарегистрироваться",
          variant: "destructive"
        });
        return;
      }
      
      const newUser = {
        id: data.user_id,
        email: registerForm.email,
        password: '',
        name: registerForm.name,
        phone: registerForm.phone,
        userType: registerForm.userType,
        inn: registerForm.inn,
        companyName: registerForm.companyName,
        legalAddress: registerForm.legalAddress,
        birthDate: registerForm.birthDate,
        passportSeries: registerForm.passportSeries,
        passportNumber: registerForm.passportNumber,
        passportIssueDate: registerForm.passportIssueDate,
        passportIssuedBy: registerForm.passportIssuedBy,
        approved: false,
        submittedAt: new Date().toISOString()
      };
      
      const userTypeText = newUser.userType === 'individual' ? 'Физическое лицо' : 'Юридическое лицо';
      const adminEmailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">Новая регистрация пользователя</h2>
            
            <p>Поступила новая заявка на регистрацию в системе "Единый календарный план м.о. Истра".</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Тип пользователя:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${userTypeText}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>ФИО / Название:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${newUser.name}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${newUser.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Телефон:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${newUser.phone}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Дата подачи:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date(newUser.submittedAt!).toLocaleString('ru-RU')}</td>
              </tr>
            </table>
            
            ${newUser.userType === 'individual' ? `
              <h3 style="color: #667eea;">Паспортные данные</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Дата рождения:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.birthDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Паспорт:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.passportSeries} ${newUser.passportNumber}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Дата выдачи:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.passportIssueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Кем выдан:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.passportIssuedBy}</td>
                </tr>
              </table>
            ` : `
              <h3 style="color: #667eea;">Данные организации</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>ИНН:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.inn}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Организация:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.companyName}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Адрес:</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${newUser.legalAddress}</td>
                </tr>
              </table>
            `}
            
            <p style="margin-top: 30px;">Проверьте данные пользователя и одобрите или отклоните заявку в панели администратора.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
              Автоматическое уведомление из системы "Единый календарный план м.о. Истра"
            </p>
          </body>
        </html>
      `;
      
      fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: 'Новая регистрация - Единый календарный план Истра',
          html: adminEmailHtml
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log('Email notification sent:', data);
      })
      .catch(err => {
        console.error('Email notification failed:', err);
      });
      
      setIsRegisterDialogOpen(false);
      setRegisterForm({ 
        email: '', 
        password: '', 
        name: '', 
        phone: '',
        userType: 'individual',
        inn: '',
        companyName: '',
        legalAddress: '',
        birthDate: '',
        passportSeries: '',
        passportNumber: '',
        passportIssueDate: '',
        passportIssuedBy: '',
        agreeToTerms: false
      });
      
      toast({
        title: "Заявка отправлена",
        description: "Ваша регистрация будет проверена администратором. Вы получите уведомление после одобрения."
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте позже.",
        variant: "destructive"
      });
    }
  };
  
  const handleUserLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Attempting login for:', loginForm.email);
      
      const response = await fetch('https://functions.poehali.dev/25a9ecf9-110a-4838-b707-39c64fa07f05', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok || !data.success) {
        toast({
          title: "Ошибка входа",
          description: data.error || "Неверный email или пароль",
          variant: "destructive"
        });
        return;
      }
      
      const user = data.user;
      setCurrentUser({ email: user.email, name: user.name, phone: user.phone });
      setIsLoggedIn(true);
      setIsLoginDialogOpen(false);
      setLoginForm({ email: '', password: '' });
      
      toast({
        title: "Вход выполнен",
        description: `Добро пожаловать, ${user.name}!`
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить вход. Попробуйте позже.",
        variant: "destructive"
      });
    }
  };
  
  const handleUserLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
  };
  
  const handleApproveUser = async (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user || !user.id) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=users&action=approve&user_id=${user.id}`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve user');
      }
      
      setUsers(users.map(u => u.id === user.id ? {...u, approved: true} : u));
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить пользователя",
        variant: "destructive"
      });
      return;
    }
    
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Регистрация одобрена!</h2>
          
          <p>Здравствуйте, ${user.name}!</p>
          <p>Ваша регистрация на платформе <strong>Единый календарный план м.о. Истра</strong> успешно одобрена администратором.</p>
          
          <p><strong>Теперь вы можете:</strong></p>
          <ul>
            <li>Просматривать все спортивные мероприятия</li>
            <li>Регистрироваться на события</li>
            <li>Предлагать свои мероприятия</li>
          </ul>
          
          <p style="margin: 30px 0;">
            <a href="${window.location.origin}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Войти на сайт</a>
          </p>
          
          <p>С уважением,<br>Управление физической культуры и спорта м.о. Истра</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
            г. Истра, ул. Ленина, д. 81 | +7 (495) 994-85-55 (доб. 429)<br>
            info@sportvokrugistra.ru
          </p>
        </body>
      </html>
    `;
    
    console.log('Отправка email пользователю:', email);
    try {
      const emailPayload = {
        to: email,
        subject: 'Регистрация одобрена - Единый календарный план Истра',
        html: emailHtml
      };
      console.log('Email payload:', emailPayload);
      
      const response = await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      
      console.log('Email response status:', response.status);
      const responseData = await response.json();
      console.log('Email response data:', responseData);
      
      if (response.ok) {
        toast({
          title: "Пользователь одобрен ✅",
          description: `Email отправлен на ${email}`
        });
      } else {
        console.error('Email error:', responseData);
        toast({
          title: "Пользователь одобрен ✅",
          description: `Email не отправлен: ${responseData.error || 'Проверьте SMTP настройки'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: "Пользователь одобрен ✅",
        description: `Ошибка отправки email: ${error}`,
        variant: "destructive"
      });
    }
  };
  
  const handleRejectUser = async (email: string) => {
    const user = users.find(u => u.email === email);
    console.log('handleRejectUser called for:', email, 'user:', user);
    
    if (!user || !user.id) {
      console.error('User not found or missing ID:', user);
      toast({
        title: "Ошибка",
        description: "Пользователь не найден или отсутствует ID",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const url = `https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=users&user_id=${user.id}`;
      console.log('DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      console.log('DELETE response status:', response.status);
      const data = await response.json();
      console.log('DELETE response data:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setUsers(users.filter(u => u.id !== user.id));
      console.log('User removed from local state');
    } catch (error) {
      console.error('handleRejectUser error:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось отклонить пользователя: ${error}`,
        variant: "destructive"
      });
      return;
    }
    
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Регистрация отклонена</h2>
          
          <p>Здравствуйте, ${user.name}!</p>
          <p>К сожалению, ваша заявка на регистрацию в системе <strong>Единый календарный план м.о. Истра</strong> не прошла модерацию.</p>
          
          <p><strong>Возможные причины отклонения:</strong></p>
          <ul>
            <li>Неполные или некорректные персональные данные</li>
            <li>Несоответствие требованиям платформы</li>
            <li>Дублирование существующей учетной записи</li>
          </ul>
          
          <p>Вы можете подать заявку повторно с корректными данными.</p>
          
          <p style="margin: 30px 0;">
            <a href="${window.location.origin}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Зарегистрироваться повторно</a>
          </p>
          
          <p><strong>Для получения дополнительной информации свяжитесь с нами:</strong></p>
          <p>Телефон: +7 (495) 994-85-55 (доб. 429)<br>
          Email: info@sportvokrugistra.ru</p>
          
          <p>С уважением,<br>Управление физической культуры и спорта м.о. Истра</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
            г. Истра, ул. Ленина, д. 81 | +7 (495) 994-85-55 (доб. 429)<br>
            info@sportvokrugistra.ru
          </p>
        </body>
      </html>
    `;
    
    try {
      await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Регистрация отклонена - Единый календарный план Истра',
          html: emailHtml
        })
      });
    } catch (error) {
      // Игнорируем ошибки отправки
    }
    
    toast({
      title: "Регистрация отклонена",
      description: "Пользователь удалён из системы. Email-уведомление отправлено."
    });
  };
  
  const handleToggleEventStatus = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const newStatus = event.status === 'upcoming' ? 'past' : 'upcoming';
    
    try {
      await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=update&event_id=${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...event, status: newStatus })
      });
      
      toast({
        title: "Статус изменен",
        description: `Мероприятие перемещено в раздел "${newStatus === 'upcoming' ? 'Предстоящие' : 'Прошедшие'}"`
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCurrentUserAccount = async () => {
    if (!currentUser) return;
    
    if (!deleteAccountPassword) {
      toast({
        title: "Ошибка",
        description: "Введите пароль для подтверждения удаления",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Проверяем пароль через login endpoint
      const loginResponse = await fetch('https://functions.poehali.dev/25a9ecf9-110a-4838-b707-39c64fa07f05', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          password: deleteAccountPassword
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok || !loginData.success) {
        toast({
          title: "Неверный пароль",
          description: "Введён неправильный пароль",
          variant: "destructive"
        });
        return;
      }
      
      // Если пароль верный, удаляем аккаунт
      const user = users.find(u => u.email === currentUser.email);
      if (!user || !user.id) {
        toast({
          title: "Ошибка",
          description: "Пользователь не найден",
          variant: "destructive"
        });
        return;
      }
      
      const deleteResponse = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?action=delete&user_id=${user.id}`, {
        method: 'DELETE'
      });
      
      const deleteData = await deleteResponse.json();
      
      if (!deleteResponse.ok || !deleteData.success) {
        throw new Error('Failed to delete account');
      }
      
      setUsers(users.filter(u => u.email !== currentUser.email));
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsDeleteAccountDialogOpen(false);
      setDeleteAccountPassword('');
      
      toast({
        title: "Аккаунт удалён",
        description: "Ваш аккаунт успешно удалён из системы"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аккаунт. Попробуйте позже.",
        variant: "destructive"
      });
    }
  };
  
  const handleAdminDeleteUser = async (email: string) => {
    const user = users.find(u => u.email === email);
    console.log('handleAdminDeleteUser called for:', email, 'user:', user);
    if (!user || !user.id) {
      console.error('User not found or missing ID');
      return;
    }
    
    try {
      const url = `https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=users&user_id=${user.id}`;
      console.log('DELETE request URL:', url);
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      console.log('DELETE response status:', response.status);
      const data = await response.json();
      console.log('DELETE response data:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setUsers(users.filter(u => u.id !== user.id));
      
      toast({
        title: "Пользователь удалён",
        description: `${user.name} удалён из системы`
      });
    } catch (error) {
      console.error('handleAdminDeleteUser error:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось удалить пользователя: ${error}`,
        variant: "destructive"
      });
    }
  };
  
  const handleSendMessage = async () => {
    if (!messageRecipient || !messageSubject || !messageBody) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля сообщения",
        variant: "destructive"
      });
      return;
    }
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-body { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Сообщение от администратора</h1>
            </div>
            <div class="content">
              <p>Добрый день!</p>
              <p>Вам пришло сообщение от администратора <strong>Единого календарного плана м.о. Истра</strong>:</p>
              
              <div class="message-body">
                <p style="white-space: pre-wrap;">${messageBody}</p>
              </div>
              
              <p>С уважением,<br>Управление физической культуры и спорта м.о. Истра</p>
            </div>
            <div class="footer">
              <p>г. Истра, ул. Ленина, д. 81 | +7 (495) 994-85-55 (доб. 429)</p>
              <p>info@sportvokrugistra.ru</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    try {
      const response = await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: messageRecipient,
          subject: `📧 ${messageSubject} - Единый календарный план м.о. Истра`,
          html: emailHtml
        })
      });
      
      if (response.ok) {
        toast({
          title: "Сообщение отправлено ✅",
          description: `Email отправлен на ${messageRecipient}`
        });
        setIsSendMessageDialogOpen(false);
        setMessageRecipient('');
        setMessageSubject('');
        setMessageBody('');
      } else {
        const errorData = await response.json();
        console.error('Email error:', errorData);
        toast({
          title: "Ошибка отправки ⚠️",
          description: "Проверьте SMTP настройки",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: "Ошибка отправки ⚠️",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };
  
  const handleBroadcastMessage = async () => {
    if (!broadcastSubject || !broadcastBody) {
      toast({
        title: "Ошибка",
        description: "Заполните тему и текст рассылки",
        variant: "destructive"
      });
      return;
    }
    
    const approvedUsers = users.filter(u => u.approved);
    if (approvedUsers.length === 0) {
      toast({
        title: "Нет получателей",
        description: "Нет одобренных пользователей для рассылки",
        variant: "destructive"
      });
      return;
    }
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .message-body { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #2563eb; }
            .badge { display: inline-block; background: #2563eb; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📢 Важное объявление</h1>
            </div>
            <div class="content">
              <span class="badge">МАССОВАЯ РАССЫЛКА</span>
              <p>Добрый день!</p>
              <p>Администрация <strong>Единого календарного плана м.о. Истра</strong> информирует:</p>
              
              <div class="message-body">
                <p style="white-space: pre-wrap;">${broadcastBody}</p>
              </div>
              
              <p>С уважением,<br>Управление физической культуры и спорта м.о. Истра</p>
            </div>
            <div class="footer">
              <p>г. Истра, ул. Ленина, д. 81 | +7 (495) 994-85-55 (доб. 429)</p>
              <p>info@sportvokrugistra.ru</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    setIsSendingBroadcast(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const user of approvedUsers) {
      try {
        const response = await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `📢 ${broadcastSubject} - Единый календарный план м.о. Истра`,
            html: emailHtml
          })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to send to ${user.email}`);
        }
        
        // Задержка между отправками чтобы не перегружать SMTP
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failCount++;
        console.error(`Error sending to ${user.email}:`, error);
      }
    }
    
    setIsSendingBroadcast(false);
    setIsBroadcastDialogOpen(false);
    setBroadcastSubject('');
    setBroadcastBody('');
    
    if (successCount > 0) {
      toast({
        title: "Рассылка завершена ✅",
        description: `Отправлено: ${successCount} из ${approvedUsers.length}${failCount > 0 ? `. Ошибок: ${failCount}` : ''}`
      });
    } else {
      toast({
        title: "Ошибка рассылки ⚠️",
        description: "Не удалось отправить ни одно сообщение. Проверьте SMTP настройки.",
        variant: "destructive"
      });
    }
  };
  
  const handleOpenAddDialog = () => {
    if (!isLoggedIn && !isAdmin) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите или зарегистрируйтесь, чтобы предложить мероприятие",
        variant: "destructive"
      });
      setIsLoginDialogOpen(true);
      return;
    }
    setIsAddDialogOpen(true);
  };

  const getEventsToDelete = () => {
    if (deletePeriodType === 'all') {
      return events;
    }
    
    if (deletePeriodType === 'year') {
      return events.filter(e => {
        const eventYear = new Date(e.date).getFullYear().toString();
        return eventYear === deleteYear;
      });
    }
    
    if (deletePeriodType === 'month') {
      if (!deleteMonth) return [];
      return events.filter(e => {
        const eventDate = new Date(e.date);
        const eventYearMonth = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
        return eventYearMonth === deleteMonth;
      });
    }
    
    if (deletePeriodType === 'range') {
      if (!deleteDateFrom || !deleteDateTo) return [];
      const fromDate = new Date(deleteDateFrom);
      const toDate = new Date(deleteDateTo);
      return events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= fromDate && eventDate <= toDate;
      });
    }
    
    return [];
  };

  const handleDeleteAllEvents = async () => {
    if (deleteAllEventsPassword !== storedAdminPassword) {
      toast({
        title: "Ошибка",
        description: "Неверный пароль администратора",
        variant: "destructive"
      });
      return;
    }
    
    const eventsToDelete = getEventsToDelete();
    
    if (eventsToDelete.length === 0) {
      toast({
        title: "Нет мероприятий",
        description: "В выбранном периоде нет мероприятий для удаления",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeletingAllEvents(true);
    
    try {
      const eventIdsToDelete = eventsToDelete.map(e => e.id);
      let successCount = 0;
      let failCount = 0;
      
      for (const eventId of eventIdsToDelete) {
        try {
          const response = await fetch(`https://functions.poehali.dev/81518783-b8d7-4699-a43b-cbae1cb085ba?resource=events&action=delete&event_id=${eventId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Failed to delete event ${eventId}:`, error);
        }
      }
      
      await loadEvents();
      
      setIsDeletingAllEvents(false);
      setIsDeleteAllEventsDialogOpen(false);
      setDeleteAllEventsPassword('');
      setDeletePeriodType('all');
      setDeleteMonth('');
      setDeleteDateFrom('');
      setDeleteDateTo('');
      
      if (successCount > 0) {
        toast({
          title: "Мероприятия удалены",
          description: `Удалено: ${successCount} из ${eventIdsToDelete.length}${failCount > 0 ? `. Ошибок: ${failCount}` : ''}`
        });
      } else {
        toast({
          title: "Ошибка удаления",
          description: "Не удалось удалить мероприятия",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsDeletingAllEvents(false);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении мероприятий",
        variant: "destructive"
      });
    }
  };

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: number; hasEvents: boolean; events: Event[]; isToday: boolean }> = [];
    const today = new Date();
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: 0, hasEvents: false, events: [], isToday: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = upcomingEvents.filter(e => e.date === dateStr || (e.additionalDates || []).includes(dateStr));
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      days.push({ date: day, hasEvents: dayEvents.length > 0, events: dayEvents, isToday });
    }
    
    return days;
  }, [currentMonth, upcomingEvents]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-red-50">
      <div className="fixed top-0 left-0 right-0 h-8 z-50 flex shadow-md">
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-blue-600"></div>
        <div className="flex-1 bg-red-600"></div>
      </div>
      <div className="container mx-auto px-4 py-8 pt-16 bg-slate-50">
        <div className="absolute top-12 right-4 flex gap-2 items-center z-50">
          {!isLoggedIn && !isAdmin && (
            <>
              <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="LogIn" size={18} />
                    Войти
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Вход в систему</DialogTitle>
                    <DialogDescription>
                      Войдите, чтобы предлагать мероприятия
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && handleUserLogin()}
                        placeholder="Введите пароль"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleUserLogin}>
                      <Icon name="LogIn" size={18} className="mr-2" />
                      Войти
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    Нет аккаунта?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => {
                        setIsLoginDialogOpen(false);
                        setIsRegisterDialogOpen(true);
                      }}
                    >
                      Зарегистрироваться
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="UserPlus" size={18} />
                    Регистрация
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Регистрация</DialogTitle>
                    <DialogDescription>*Физические лица - организаторы физкультурных мероприятий; Юридические лица - организаторы физкультурных и спортивных мероприятий</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Тип регистрации *</Label>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={registerForm.userType === 'individual' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setRegisterForm({...registerForm, userType: 'individual'})}
                        >
                          <Icon name="User" size={18} className="mr-2" />
                          Физическое лицо
                        </Button>
                        <Button
                          type="button"
                          variant={registerForm.userType === 'legal' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setRegisterForm({...registerForm, userType: 'legal'})}
                        >
                          <Icon name="Building" size={18} className="mr-2" />
                          Юридическое лицо
                        </Button>
                      </div>
                    </div>

                    {registerForm.userType === 'individual' ? (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="register-name">Фамилия Имя Отчество *</Label>
                          <Input
                            id="register-name"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                            placeholder="Иванов Иван Иванович"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-email">Email *</Label>
                          <Input
                            id="register-email"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-phone">Телефон *</Label>
                          <Input
                            id="register-phone"
                            type="tel"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-password">Пароль *</Label>
                          <Input
                            id="register-password"
                            type="password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            placeholder="Минимум 6 символов"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-birthdate">Дата рождения *</Label>
                          <Input
                            id="register-birthdate"
                            type="date"
                            value={registerForm.birthDate}
                            onChange={(e) => setRegisterForm({...registerForm, birthDate: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="register-passport-series">Серия паспорта *</Label>
                            <Input
                              id="register-passport-series"
                              value={registerForm.passportSeries}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setRegisterForm({...registerForm, passportSeries: value});
                              }}
                              placeholder="1234"
                              maxLength={4}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="register-passport-number">Номер паспорта *</Label>
                            <Input
                              id="register-passport-number"
                              value={registerForm.passportNumber}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setRegisterForm({...registerForm, passportNumber: value});
                              }}
                              placeholder="567890"
                              maxLength={6}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-passport-date">Дата выдачи паспорта *</Label>
                          <Input
                            id="register-passport-date"
                            type="date"
                            value={registerForm.passportIssueDate}
                            onChange={(e) => setRegisterForm({...registerForm, passportIssueDate: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-passport-issued">Кем выдан паспорт *</Label>
                          <Textarea
                            id="register-passport-issued"
                            value={registerForm.passportIssuedBy}
                            onChange={(e) => setRegisterForm({...registerForm, passportIssuedBy: e.target.value})}
                            placeholder="Отделением УФМС России..."
                            rows={2}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="register-company">Название организации *</Label>
                          <Input
                            id="register-company"
                            value={registerForm.companyName}
                            onChange={(e) => setRegisterForm({...registerForm, companyName: e.target.value})}
                            placeholder="ООО «Спортклуб»"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-inn">ИНН *</Label>
                          <Input
                            id="register-inn"
                            value={registerForm.inn}
                            onChange={(e) => setRegisterForm({...registerForm, inn: e.target.value})}
                            placeholder="1234567890"
                            maxLength={12}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-legal-address">Юридический адрес *</Label>
                          <Input
                            id="register-legal-address"
                            value={registerForm.legalAddress}
                            onChange={(e) => setRegisterForm({...registerForm, legalAddress: e.target.value})}
                            placeholder="г. Москва, ул. Примерная, д. 1"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-name-legal">Контактное лицо (ФИО) *</Label>
                          <Input
                            id="register-name-legal"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                            placeholder="Иванов Иван Иванович"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-email-legal">Email *</Label>
                          <Input
                            id="register-email-legal"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                            placeholder="company@email.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-phone-legal">Телефон *</Label>
                          <Input
                            id="register-phone-legal"
                            type="tel"
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="register-password-legal">Пароль *</Label>
                          <Input
                            id="register-password-legal"
                            type="password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            placeholder="Минимум 6 символов"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-start gap-2 pt-2">
                      <Checkbox 
                        id="agree-terms"
                        checked={registerForm.agreeToTerms}
                        onCheckedChange={(checked) => setRegisterForm({...registerForm, agreeToTerms: checked as boolean})}
                      />
                      <Label 
                        htmlFor="agree-terms" 
                        className="text-sm font-normal leading-tight cursor-pointer"
                      >
                        Я согласен(на) на{' '}
                        <a 
                          href="/privacy-policy" 
                          target="_blank"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          обработку персональных данных
                        </a>
                        {' '}и принимаю условия{' '}
                        <a 
                          href="/terms-of-service" 
                          target="_blank"
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          пользовательского соглашения
                        </a>
                        {' '}*
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleUserRegister}>
                      <Icon name="UserPlus" size={18} className="mr-2" />
                      Зарегистрироваться
                    </Button>
                  </div>
                  <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    Уже есть аккаунт?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => {
                        setIsRegisterDialogOpen(false);
                        setIsLoginDialogOpen(true);
                      }}
                    >
                      Войти
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {isLoggedIn && !isAdmin && (
            <>
              <Button variant="outline" onClick={() => setIsDeleteAccountDialogOpen(true)} className="gap-2" title="Удалить аккаунт">
                <Icon name="Trash2" size={18} />
              </Button>
              <Button variant="outline" onClick={handleUserLogout} className="gap-2">
                <Icon name="User" size={18} />
                {currentUser?.name}
                <Icon name="LogOut" size={16} className="ml-2" />
              </Button>
            </>
          )}
          
          {!isAdmin ? (
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Icon name="Lock" size={18} />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Вход администратора</DialogTitle>
                  <DialogDescription>
                    Введите пароль для доступа к панели модерации
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                      id="password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      placeholder="Введите пароль"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAdminLogin}>
                    <Icon name="LogIn" size={18} className="mr-2" />
                    Войти
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <>
              <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Настройки">
                    <Icon name="Settings" size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Настройки администратора</DialogTitle>
                    <DialogDescription>
                      Управление параметрами системы
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Icon name="Info" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">Настройка email-уведомлений</p>
                          <p>Для отправки уведомлений настройте SMTP в разделе Secrets проекта:</p>
                          <ul className="list-disc ml-4 mt-1 text-xs">
                            <li>SMTP_HOST (smtp.gmail.com)</li>
                            <li>SMTP_PORT (587)</li>
                            <li>SMTP_USER (ваш email)</li>
                            <li>SMTP_PASSWORD (app password)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="admin-email">Email администратора</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        На этот адрес будут приходить уведомления о новых регистрациях и заявках на мероприятия
                      </p>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="admin-password">Пароль администратора</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={storedAdminPassword}
                        onChange={(e) => setStoredAdminPassword(e.target.value)}
                        placeholder="Введите новый пароль"
                      />
                      <p className="text-sm text-muted-foreground">
                        Пароль для входа в панель администратора
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={() => {
                      setIsSettingsDialogOpen(false);
                      toast({
                        title: "Настройки сохранены",
                        description: "Настройки администратора обновлены"
                      });
                    }}>
                      <Icon name="Save" size={18} className="mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleAdminLogout} className="gap-2">
                <Icon name="LogOut" size={18} />
                Выйти из режима администратора
              </Button>
            </>
          )}
        </div>
        
        <header className="text-center mb-12 mt-20 animate-fade-in">
          <div className="flex items-center justify-center gap-6 mb-6">
            <img 
              src="https://cdn.poehali.dev/files/70c7c537-7bd0-406b-907d-dc090e56ba00.png" 
              alt="Герб муниципального округа Истра"
              className="h-24 w-auto object-contain"
            />
            <img 
              src="https://cdn.poehali.dev/files/4f1ca257-0059-45f5-9da9-0e74c73d16fb.png" 
              alt="ГТО - Территория спорта"
              className="h-24 w-auto object-contain"
            />
            <img 
              src="https://cdn.poehali.dev/files/5171b1ba-a553-4f60-9a44-3c3364d0c883.jpg" 
              alt="Мособлспорт"
              className="h-24 w-auto object-contain"
            />
            <img 
              src="https://cdn.poehali.dev/files/IMG_9203.jpg" 
              alt="Спорт Истра"
              className="h-24 w-auto object-contain"
            />
            <img 
              src="https://cdn.poehali.dev/projects/7867f842-bbad-4ff0-83bb-b1a44cc1c5c5/bucket/b91abbfc-231c-4b1d-84c8-5997700d5b5a.jpg" 
              alt="Школьная Лига Истра"
              className="h-24 w-auto object-contain"
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Trophy" size={48} className="text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-red-600 bg-clip-text text-blue-800">Единый календарный план - 2026</h1>
          </div>
          <p className="text-xl text-gray-700">Физкультурных, спортивных и выездных мероприятий м.о. Истра</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-4 justify-center items-center animate-slide-up bg-slate-900">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, месту, номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px] pl-10 border-2 hover:border-primary transition-colors"
            />
          </div>
          
          <Select value={selectedSport} onValueChange={(value) => setSelectedSport(value as SportType)}>
            <SelectTrigger className="w-[200px] border-2 hover:border-primary transition-colors">
              <SelectValue placeholder="Вид спорта" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sportNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Icon name={sportIcons[key as SportType]} size={16} />
                    {name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button className="gap-2" onClick={handleOpenAddDialog}>
            <Icon name="Plus" size={18} />
            {isAdmin ? 'Добавить мероприятие' : 'Предложить мероприятие'}
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новое спортивное мероприятие</DialogTitle>
                <DialogDescription>
                  {isAdmin ? 'Заполните информацию о мероприятии' : 'Ваше предложение будет отправлено на модерацию администратору'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Название мероприятия *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Например: Городской марафон"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Дата начала *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        if (eventDaysCount > 1 && newDate) {
                          const base = new Date(newDate);
                          const dates = Array.from({ length: eventDaysCount - 1 }, (_, i) => {
                            const d = new Date(base);
                            d.setDate(base.getDate() + i + 1);
                            return d.toISOString().split('T')[0];
                          });
                          setNewEvent({ ...newEvent, date: newDate, additionalDates: dates });
                        } else {
                          setNewEvent({ ...newEvent, date: newDate });
                        }
                      }}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="time">Время *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="daysCount">Количество дней проведения</Label>
                  <Input
                    id="daysCount"
                    type="number"
                    min={1}
                    max={30}
                    value={eventDaysCount}
                    onChange={(e) => {
                      const count = Math.max(1, parseInt(e.target.value) || 1);
                      setEventDaysCount(count);
                      if (count <= 1) {
                        setNewEvent({ ...newEvent, additionalDates: [] });
                      } else if (newEvent.date) {
                        const base = new Date(newEvent.date);
                        const dates = Array.from({ length: count - 1 }, (_, i) => {
                          const d = new Date(base);
                          d.setDate(base.getDate() + i + 1);
                          return d.toISOString().split('T')[0];
                        });
                        setNewEvent({ ...newEvent, additionalDates: dates });
                      } else {
                        setNewEvent({ ...newEvent, additionalDates: Array(count - 1).fill('') });
                      }
                    }}
                  />
                </div>

                {eventDaysCount > 1 && (
                  <div className="grid gap-2">
                    <Label>Даты проведения мероприятия</Label>
                    <div className="bg-muted/40 rounded-lg p-3 grid gap-2">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        <span className="font-medium">День 1 (основная дата):</span>
                        <span className="text-muted-foreground">{newEvent.date ? new Date(newEvent.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                      </div>
                      {Array.from({ length: eventDaysCount - 1 }, (_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 2}</span>
                          <span className="text-sm font-medium whitespace-nowrap">День {i + 2}:</span>
                          <Input
                            type="date"
                            value={(newEvent.additionalDates || [])[i] || ''}
                            onChange={(e) => {
                              const dates = [...(newEvent.additionalDates || [])];
                              dates[i] = e.target.value;
                              setNewEvent({ ...newEvent, additionalDates: dates });
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Место проведения *</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => {
                      const location = e.target.value;
                      setNewEvent({...newEvent, location});
                      
                      const isIstra = location.toLowerCase().includes('истр') || 
                                      location.toLowerCase().includes('istra');
                      setSuggestedEventType(isIstra ? 'local' : 'away');
                    }}
                    placeholder="Например: Центральный парк, г. Истра"
                  />
                  {suggestedEventType && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900">
                          {suggestedEventType === 'local' 
                            ? 'Определено как местное мероприятие (на территории м.о. Истра)'
                            : 'Определено как выездное мероприятие (за пределами м.о. Истра)'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={newEvent.eventType === 'local' ? 'default' : 'outline'}
                            onClick={() => setNewEvent({...newEvent, eventType: 'local'})}
                          >
                            <Icon name="MapPin" size={14} className="mr-1" />
                            Местное
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={newEvent.eventType === 'away' ? 'default' : 'outline'}
                            onClick={() => setNewEvent({...newEvent, eventType: 'away'})}
                          >
                            <Icon name="Plane" size={14} className="mr-1" />
                            Выездное
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="sport">Вид спорта *</Label>
                  {!showCustomSportInput ? (
                    <div className="space-y-2">
                      <Select 
                        value={newEvent.sport} 
                        onValueChange={(value) => setNewEvent({...newEvent, sport: value as SportType})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sportNames)
                            .filter(([key]) => key !== 'all')
                            .sort((a, b) => a[1].localeCompare(b[1], 'ru'))
                            .map(([key, name]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <Icon name={sportIcons[key as SportType]} size={16} />
                                  {name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setShowCustomSportInput(true)}
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Указать свой вид спорта
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Введите название вида спорта"
                        value={customSport}
                        onChange={(e) => setCustomSport(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setShowCustomSportInput(false);
                            setCustomSport('');
                          }}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Отмена
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ваш вариант: <strong>{customSport || '(не указан)'}</strong>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="eventLevel">Статус мероприятия *</Label>
                  <Select 
                    value={newEvent.eventLevel} 
                    onValueChange={(value) => {
                      const level = value as EventLevel;
                      setNewEvent({...newEvent, eventLevel: level});
                      const eventType = newEvent.eventType || suggestedEventType || 'local';
                      const needsManualNumber = !(eventType === 'local' && (level === 'municipal' || level === 'intermunicipal'));
                      setShowManualEventNumber(needsManualNumber);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventLevelNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {showManualEventNumber && (
                  <div className="grid gap-2">
                    <Label htmlFor="manualEventNumber">Номер мероприятия</Label>
                    <Input
                      id="manualEventNumber"
                      value={manualEventNumber}
                      onChange={(e) => setManualEventNumber(e.target.value)}
                      placeholder="Например: РФ-2025-123 или МО-456"
                    />
                    <p className="text-xs text-muted-foreground">
                      Укажите номер мероприятия вручную (необязательно)
                    </p>
                  </div>
                )}
                
                {!showManualEventNumber && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">
                        Номер мероприятия будет присвоен автоматически
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Ожидаемое кол-во участников</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent({...newEvent, maxParticipants: parseInt(e.target.value) || 50})}
                      min="1"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="maxSpectators">Максимальное кол-во зрителей</Label>
                    <Input
                      id="maxSpectators"
                      type="number"
                      value={newEvent.maxSpectators || ''}
                      onChange={(e) => setNewEvent({...newEvent, maxSpectators: e.target.value ? parseInt(e.target.value) : undefined})}
                      min="1"
                      placeholder="Не ограничено"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="organizer">Организатор *</Label>
                  <Input
                    id="organizer"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                    placeholder="Например: Спортивный клуб"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="responsiblePerson">ФИО ответственного за организацию *</Label>
                  <Input
                    id="responsiblePerson"
                    value={newEvent.responsiblePerson || ''}
                    onChange={(e) => setNewEvent({...newEvent, responsiblePerson: e.target.value})}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="responsiblePosition">Должность</Label>
                    <Input
                      id="responsiblePosition"
                      value={newEvent.responsiblePosition || ''}
                      onChange={(e) => setNewEvent({...newEvent, responsiblePosition: e.target.value})}
                      placeholder="Например: Директор"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="responsiblePhone">Телефон ответственного *</Label>
                    <Input
                      id="responsiblePhone"
                      value={newEvent.responsiblePhone || ''}
                      onChange={(e) => setNewEvent({...newEvent, responsiblePhone: e.target.value})}
                      placeholder="+7 (900) 000-00-00"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Подробное описание мероприятия"
                    rows={4}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="documents">Документы мероприятия</Label>
                  <div className="space-y-2">
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        
                        setIsUploading(true);
                        const uploadedDocs: { name: string; url: string }[] = [];
                        
                        try {
                          for (const file of files) {
                            const reader = new FileReader();
                            const fileContent = await new Promise<string>((resolve) => {
                              reader.onload = () => {
                                const base64 = (reader.result as string).split(',')[1];
                                resolve(base64);
                              };
                              reader.readAsDataURL(file);
                            });
                            
                            const response = await fetch('https://functions.poehali.dev/3b73897b-697b-4c87-b36f-0fcc17893bc3', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                fileName: file.name,
                                fileContent: fileContent
                              })
                            });
                            
                            const result = await response.json();
                            uploadedDocs.push({ name: file.name, url: result.url });
                          }
                          
                          setNewEvent({...newEvent, documents: uploadedDocs});
                          toast({
                            title: "Файлы загружены",
                            description: `Загружено ${uploadedDocs.length} файл(ов)`
                          });
                        } catch (error) {
                          toast({
                            title: "Ошибка загрузки",
                            description: "Не удалось загрузить файлы",
                            variant: "destructive"
                          });
                        } finally {
                          setIsUploading(false);
                        }
                      }}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isUploading ? 'Загрузка файлов...' : 'Загрузите положение, регламент и другие документы (PDF, DOC, DOCX)'}
                    </p>
                    {newEvent.documents && newEvent.documents.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">Прикреплённые файлы:</p>
                        {newEvent.documents.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="FileText" size={14} />
                              {doc.name}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedDocs = newEvent.documents?.filter((_, index) => index !== i);
                                setNewEvent({...newEvent, documents: updatedDocs});
                              }}
                            >
                              <Icon name="X" size={16} className="text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddEvent}>
                  <Icon name={isAdmin ? "Plus" : "Send"} size={18} className="mr-2" />
                  {isAdmin ? 'Добавить' : 'Отправить на модерацию'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Редактирование мероприятия</DialogTitle>
                <DialogDescription>
                  Внесите изменения в информацию о мероприятии
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Название мероприятия *</Label>
                  <Input
                    id="edit-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Например: Городской марафон"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Дата *</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="edit-time">Время *</Label>
                    <Input
                      id="edit-time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Место проведения *</Label>
                  <Input
                    id="edit-location"
                    value={newEvent.location}
                    onChange={(e) => {
                      const location = e.target.value;
                      setNewEvent({...newEvent, location});
                      
                      const isIstra = location.toLowerCase().includes('истр') || 
                                      location.toLowerCase().includes('istra');
                      setSuggestedEventType(isIstra ? 'local' : 'away');
                    }}
                    placeholder="Например: Центральный парк, г. Истра"
                  />
                  {suggestedEventType && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900">
                          {suggestedEventType === 'local' 
                            ? 'Определено как местное мероприятие (на территории м.о. Истра)'
                            : 'Определено как выездное мероприятие (за пределами м.о. Истра)'}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={newEvent.eventType === 'local' ? 'default' : 'outline'}
                            onClick={() => setNewEvent({...newEvent, eventType: 'local'})}
                          >
                            <Icon name="MapPin" size={14} className="mr-1" />
                            Местное
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={newEvent.eventType === 'away' ? 'default' : 'outline'}
                            onClick={() => setNewEvent({...newEvent, eventType: 'away'})}
                          >
                            <Icon name="Plane" size={14} className="mr-1" />
                            Выездное
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-eventLevel">Статус мероприятия *</Label>
                  <Select 
                    value={newEvent.eventLevel} 
                    onValueChange={(value) => {
                      const level = value as EventLevel;
                      setNewEvent({...newEvent, eventLevel: level});
                      const eventType = newEvent.eventType || suggestedEventType || 'local';
                      const needsManualNumber = !(eventType === 'local' && (level === 'municipal' || level === 'intermunicipal'));
                      setShowManualEventNumber(needsManualNumber);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventLevelNames).map(([key, name]) => (
                        <SelectItem key={key} value={key}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {showManualEventNumber && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-manualEventNumber">Номер мероприятия</Label>
                    <Input
                      id="edit-manualEventNumber"
                      value={manualEventNumber}
                      onChange={(e) => setManualEventNumber(e.target.value)}
                      placeholder="Например: РФ-2025-123 или МО-456"
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-organizer">Организатор *</Label>
                  <Input
                    id="edit-organizer"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
                    placeholder="Например: Спортивный клуб"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Описание</Label>
                  <Textarea
                    id="edit-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Подробное описание мероприятия"
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingEvent(null);
                }}>
                  Отмена
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить изменения
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isAdmin && (
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5 animate-fade-in">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Всего мероприятий в плане</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{approvedEvents.length}</div>
                  <Icon name="Calendar" size={32} className="opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Предстоящих</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{approvedEvents.filter(e => e.status === 'upcoming').length}</div>
                  <Icon name="CalendarPlus" size={32} className="opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Прошедших</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{approvedEvents.filter(e => e.status === 'past').length}</div>
                  <Icon name="CheckCircle" size={32} className="opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Мероприятия на модерации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{pendingEvents.length}</div>
                  <Icon name="Clock" size={32} className="opacity-50" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Пользователи на модерации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{users.filter(u => !u.approved).length}</div>
                  <Icon name="UserX" size={32} className="opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {isAdmin && pastEvents.length > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-2 animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} className="text-primary" />
                  Топ-5 видов спорта
                </CardTitle>
                <CardDescription>По количеству прошедших мероприятий</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const sportStats = pastEvents.reduce((acc, event) => {
                      const sport = event.sport;
                      acc[sport] = (acc[sport] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    const topSports = Object.entries(sportStats)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5);
                    
                    const maxCount = topSports[0]?.[1] || 1;
                    
                    return topSports.map(([sport, count], index) => (
                      <div key={sport} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-primary">#{index + 1}</span>
                            <Icon name={sportIcons[sport as SportType]} size={16} className="text-primary" />
                            <span className="font-medium">{sportNames[sport as SportType]}</span>
                          </div>
                          <span className="font-bold text-primary">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-primary" />
                  Статистика участников
                </CardTitle>
                <CardDescription>Данные по прошедшим мероприятиям</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const reportedEvents = pastEvents.filter(e => e.actualParticipants != null);
                    const unreportedEvents = pastEvents.filter(e => e.actualParticipants == null);
                    const totalParticipants = pastEvents.reduce((sum, event) => sum + (event.actualParticipants ?? event.participants ?? 0), 0);
                    const avgParticipants = reportedEvents.length > 0
                      ? Math.round(reportedEvents.reduce((sum, e) => sum + (e.actualParticipants ?? 0), 0) / reportedEvents.length)
                      : 0;
                    const maxParticipants = Math.max(...pastEvents.map(e => e.actualParticipants ?? e.participants ?? 0), 0);
                    const maxEvent = pastEvents.find(e => (e.actualParticipants ?? e.participants ?? 0) === maxParticipants);
                    
                    return (
                      <>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Icon name="Users" size={24} className="text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Всего участников</div>
                              <div className="text-2xl font-bold text-blue-700">{totalParticipants}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Icon name="TrendingUp" size={24} className="text-white" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">Среднее на мероприятие</div>
                              <div className="text-2xl font-bold text-green-700">{avgParticipants}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Icon name="ClipboardCheck" size={16} className="text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Внесение итогов</span>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1 text-center p-2 bg-green-100 rounded-lg">
                              <div className="text-xl font-bold text-green-700">{reportedEvents.length}</div>
                              <div className="text-xs text-green-600 mt-0.5">итоги внесены</div>
                            </div>
                            <div className="flex-1 text-center p-2 bg-orange-100 rounded-lg">
                              <div className="text-xl font-bold text-orange-700">{unreportedEvents.length}</div>
                              <div className="text-xs text-orange-600 mt-0.5">ожидают внесения</div>
                            </div>
                          </div>
                          {pastEvents.length > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Заполнено</span>
                                <span>{Math.round(reportedEvents.length / pastEvents.length * 100)}%</span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${Math.round(reportedEvents.length / pastEvents.length * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {unreportedEvents.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <div className="text-xs font-medium text-slate-600 mb-1.5">Ожидают внесения итогов:</div>
                              {unreportedEvents.map(e => (
                                <div key={e.id} className="flex items-center justify-between text-xs bg-white border border-orange-200 rounded-md px-2 py-1.5 gap-2">
                                  <span className="text-slate-700 truncate flex-1">{e.title}</span>
                                  <span className="text-slate-400 shrink-0">{new Date(e.date).toLocaleDateString('ru-RU')}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {maxEvent && maxParticipants > 0 && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon name="Trophy" size={18} className="text-purple-600" />
                              <span className="text-sm font-medium text-purple-900">Самое массовое</span>
                            </div>
                            <div className="text-sm text-gray-700 mb-1">{maxEvent.title}</div>
                            <div className="text-2xl font-bold text-purple-700">{maxParticipants} участников</div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="calendar" className="animate-scale-in bg-slate-50">
          <TabsList className={`grid w-full max-w-3xl mx-auto ${isAdmin ? 'grid-cols-6' : 'grid-cols-3'} mb-8`}>
            <TabsTrigger value="calendar" className="text-lg">
              <Icon name="CalendarDays" size={18} className="mr-2" />
              Календарь
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-lg">
              <Icon name="Calendar" size={18} className="mr-2" />
              Предстоящие
            </TabsTrigger>
            <TabsTrigger value="past" className="text-lg">
              <Icon name="History" size={18} className="mr-2" />
              Прошедшие
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="pending" className="text-lg relative">
                  <Icon name="Clock" size={18} className="mr-2" />
                  Мероприятия
                  {pendingEvents.length > 0 && (
                    <Badge className="ml-2 bg-orange-500">{pendingEvents.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="registrations" className="text-lg relative">
                  <Icon name="FileText" size={18} className="mr-2" />
                  Заявки
                  {registrations.length > 0 && (
                    <Badge className="ml-2 bg-blue-500">{registrations.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="users" className="text-lg relative">
                  <Icon name="Users" size={18} className="mr-2" />
                  Пользователи
                  {users.filter(u => !u.approved).length > 0 && (
                    <Badge className="ml-2 bg-red-500">{users.filter(u => !u.approved).length}</Badge>
                  )}
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="calendar">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-6 border-2 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => changeMonth(-1)}
                      className="text-white border-white hover:bg-blue-700 transition-colors"
                    >
                      <Icon name="ChevronLeft" size={20} />
                    </Button>
                    <CardTitle className="text-2xl capitalize text-white">{monthName}</CardTitle>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => changeMonth(1)}
                      className="text-white border-white hover:bg-blue-700 transition-colors"
                    >
                      <Icon name="ChevronRight" size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="grid grid-cols-7 gap-2">
                    {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                      <div key={day} className="text-center font-bold text-sm text-blue-700 py-2">
                        {day}
                      </div>
                    ))}
                    {calendarData.map((day, index) => (
                      <button
                        key={index}
                        disabled={day.date === 0}
                        onClick={() => day.date > 0 && setSelectedDate(day.date > 0 ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}` : null)}
                        className={`
                          aspect-square p-2 rounded-lg text-center transition-all duration-200 text-blue-700
                          ${day.date === 0 ? 'invisible' : ''}
                          ${day.isToday ? 'ring-2 ring-accent font-bold' : ''}
                          ${day.hasEvents ? 'bg-gradient-to-br from-blue-100 to-blue-200 font-semibold hover:from-blue-200 hover:to-blue-300' : 'hover:bg-blue-50'}
                          ${selectedDate === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}` ? 'bg-blue-600 text-white hover:bg-blue-600' : ''}
                        `}
                      >
                        <div className="text-sm">{day.date || ''}</div>
                        {day.hasEvents && (
                          <div className="flex gap-0.5 justify-center mt-1">
                            {day.events.slice(0, 3).map((event, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-blue-600" />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedDate && (
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Icon name="CalendarCheck" size={24} className="text-primary" />
                    События на {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcomingEvents.filter(e => e.date === selectedDate || (e.additionalDates || []).includes(selectedDate)).map((event) => {
                      const docStatus = event.approved ? getDocumentStatus(event) : null;
                      const statusColors = {
                        red: 'bg-red-500',
                        yellow: 'bg-yellow-500',
                        blue: 'bg-blue-500',
                        green: 'bg-green-500'
                      };
                      const statusText = {
                        red: 'Основные документы не загружены',
                        yellow: 'Требуются протоколы',
                        blue: 'Требуются медиафайлы',
                        green: 'Все документы загружены'
                      };
                      
                      return (
                      <Card key={event.id} className="hover:shadow-lg transition-all border-2 hover:border-primary relative">
                        {docStatus && (
                          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusColors[docStatus]}`} 
                               title={statusText[docStatus]} />
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                              <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                              {sportNames[event.sport]}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Icon name="Clock" size={14} />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={14} />
                              {event.location}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="w-full bg-gradient-to-r from-primary to-secondary"
                                onClick={() => setSelectedEvent(event)}
                              >
                                <Icon name="Info" size={16} className="mr-2" />
                                Подробнее
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl flex items-center gap-2">
                                  <Icon name={sportIcons[event.sport]} size={24} className="text-primary" />
                                  {event.title}
                                </DialogTitle>
                                <DialogDescription className="text-base space-y-3 pt-4">
                                  {event.eventNumber && (
                                    <div className="flex items-center gap-2 bg-primary/10 p-2 rounded">
                                      <Icon name="Hash" size={18} className="text-primary" />
                                      <strong>Номер мероприятия:</strong> {event.eventNumber}
                                    </div>
                                  )}
                                  {event.eventType && (
                                    <div className="flex items-center gap-2">
                                      <Icon name={event.eventType === 'local' ? 'MapPin' : 'Plane'} size={18} className="text-primary" />
                                      <strong>Тип мероприятия:</strong> {event.eventType === 'local' ? 'Местное' : 'Выездное'}
                                    </div>
                                  )}
                                  {event.eventLevel && (
                                    <div className="flex items-center gap-2">
                                      <Icon name="Award" size={18} className="text-primary" />
                                      <strong>Статус:</strong> {eventLevelNames[event.eventLevel]}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Icon name="Calendar" size={18} className="text-primary" />
                                    <strong>Дата:</strong> {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                                  </div>
                                  {event.additionalDates && event.additionalDates.length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <Icon name="CalendarDays" size={18} className="text-primary mt-0.5" />
                                      <div>
                                        <strong>Все даты ({event.additionalDates.length + 1} дн.):</strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {[event.date, ...event.additionalDates].map((d, i) => (
                                            <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                              {new Date(d).toLocaleDateString('ru-RU')}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" size={18} className="text-secondary" />
                                    <strong>Место:</strong> {event.location}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="Building" size={18} className="text-muted-foreground" />
                                    <strong>Организатор:</strong> {event.organizer}
                                  </div>
                                  {event.responsiblePerson && (
                                    <div className="flex items-center gap-2">
                                      <Icon name="UserCheck" size={18} className="text-muted-foreground" />
                                      <strong>Ответственный:</strong> {event.responsiblePerson}{event.responsiblePosition ? `, ${event.responsiblePosition}` : ''}
                                    </div>
                                  )}
                                  {event.responsiblePhone && (
                                    <div className="flex items-center gap-2">
                                      <Icon name="Phone" size={18} className="text-muted-foreground" />
                                      <strong>Телефон:</strong> {event.responsiblePhone}
                                    </div>
                                  )}
                                  <div className="pt-2">
                                    <p className="text-foreground">{event.description}</p>
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                              
                              {event.requiredDocuments && event.requiredDocuments.length > 0 && (
                                <div className="pt-4 border-t">
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Icon name="ClipboardCheck" size={18} className="text-primary" />
                                    Обязательные документы
                                  </h3>
                                  <div className="space-y-2">
                                    {event.requiredDocuments.map((doc, i) => (
                                      <div 
                                        key={i} 
                                        className={`p-3 rounded-md border-2 flex items-center justify-between ${
                                          doc.uploaded 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-amber-50 border-amber-300'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          {doc.uploaded ? (
                                            <Icon name="CheckCircle2" size={20} className="text-green-600 flex-shrink-0" />
                                          ) : (
                                            <Icon name="AlertCircle" size={20} className="text-amber-600 flex-shrink-0" />
                                          )}
                                          <div className="flex-1">
                                            <p className="font-medium text-sm">{doc.name}</p>
                                            {doc.uploaded && doc.fileName && (
                                              <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                            )}
                                          </div>
                                        </div>
                                        {doc.uploaded && doc.url ? (
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => window.open(doc.url, '_blank')}
                                          >
                                            <Icon name="Download" size={14} className="mr-1" />
                                            Скачать
                                          </Button>
                                        ) : (
                                          <Badge variant="outline" className="border-amber-600 text-amber-600 text-xs">
                                            Требуется
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {event.documents && event.documents.length > 0 && (
                                <div className="pt-4 border-t">
                                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Icon name="FileText" size={18} className="text-primary" />
                                    Дополнительные документы
                                  </h3>
                                  <div className="space-y-2">
                                    {event.documents.map((doc, i) => (
                                      <Button 
                                        key={i}
                                        variant="outline" 
                                        className="w-full justify-start"
                                        onClick={() => window.open(doc.url, '_blank')}
                                      >
                                        <Icon name="Download" size={16} className="mr-2" />
                                        {doc.name}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {(isAdmin || (isLoggedIn && currentUser && event.submittedBy === currentUser.email)) && (
                                <div className="pt-4 border-t space-y-2">
                                  {isLoggedIn && currentUser && event.submittedBy === currentUser.email && (
                                    <Button 
                                      variant="default" 
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                      onClick={() => {
                                        setManageFilesEvent(event);
                                        setIsManageFilesDialogOpen(true);
                                      }}
                                    >
                                      <Icon name="Upload" size={16} className="mr-2" />
                                      Управление файлами
                                    </Button>
                                  )}
                                  {isAdmin && (
                                    <>
                                      <Button 
                                        variant="secondary" 
                                        className="w-full"
                                        onClick={() => handleToggleEventStatus(event.id)}
                                      >
                                        <Icon name={event.status === 'upcoming' ? 'Archive' : 'ArchiveRestore'} size={16} className="mr-2" />
                                        {event.status === 'upcoming' ? 'Переместить в прошедшие' : 'Вернуть в предстоящие'}
                                      </Button>
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          className="flex-1"
                                          onClick={() => {
                                            handleEditEvent(event);
                                          }}
                                        >
                                          <Icon name="Edit" size={16} className="mr-2" />
                                          Редактировать
                                        </Button>
                                        <Button 
                                          variant="destructive" 
                                          className="flex-1"
                                          onClick={() => handleRejectEvent(event.id)}
                                        >
                                          <Icon name="Trash2" size={16} className="mr-2" />
                                          Удалить
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                  {upcomingEvents.filter(e => e.date === selectedDate).length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Icon name="CalendarX" size={48} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">На эту дату событий не запланировано</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!selectedDate && (
                <Card className="text-center py-12 border-2 border-dashed">
                  <CardContent>
                    <Icon name="MousePointerClick" size={48} className="mx-auto text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Выберите дату в календаре, чтобы увидеть события</p>
                  </CardContent>
                </Card>
              )}

              {/* Легенда индикаторов документов */}
              <Card className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Info" size={20} className="text-blue-600" />
                    Статус документов мероприятий
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500">
                      <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-red-900">Критическая нехватка</div>
                        <div className="text-gray-600">Не загружены основные документы</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-yellow-900">Требуются протоколы</div>
                        <div className="text-gray-600">Основные документы загружены</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-blue-900">Требуются медиафайлы</div>
                        <div className="text-gray-600">Все документы загружены</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-semibold text-green-900">Полный комплект</div>
                        <div className="text-gray-600">Все документы и медиа загружены</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            {/* Легенда индикаторов */}
            <Card className="mb-6 max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-blue-600" />
                  Статус документов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-red-900">Критическая нехватка</div>
                      <div className="text-gray-600">Не загружены основные документы</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-yellow-900">Требуются протоколы</div>
                      <div className="text-gray-600">Основные документы загружены</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900">Требуются медиафайлы</div>
                      <div className="text-gray-600">Все документы загружены</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-900">Полный комплект</div>
                      <div className="text-gray-600">Все документы и медиа загружены</div>
                    </div>
                  </div>
                </div>
                
                {/* Фильтр по статусу документов */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Filter" size={16} />
                      Фильтр по статусу
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(upcomingEvents, 'Предстоящие_мероприятия')}
                      className="flex items-center gap-2"
                    >
                      <Icon name="Download" size={14} />
                      Экспорт в Excel
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedDocStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('all')}
                      className="flex items-center gap-2"
                    >
                      <Icon name="List" size={14} />
                      Все мероприятия
                      <Badge variant="secondary" className="ml-1">{upcomingEvents.length}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'red' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('red')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Критические
                      <Badge variant="secondary" className="ml-1">{upcomingDocStats.red}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'yellow' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('yellow')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Без протоколов
                      <Badge variant="secondary" className="ml-1">{upcomingDocStats.yellow}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'blue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('blue')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Без медиа
                      <Badge variant="secondary" className="ml-1">{upcomingDocStats.blue}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'green' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('green')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Полный комплект
                      <Badge variant="secondary" className="ml-1">{upcomingDocStats.green}</Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, index) => {
                const docStatus = event.approved ? getDocumentStatus(event) : null;
                const statusColors = {
                  red: 'bg-red-500',
                  yellow: 'bg-yellow-500',
                  blue: 'bg-blue-500',
                  green: 'bg-green-500'
                };
                const statusText = {
                  red: 'Основные документы не загружены',
                  yellow: 'Требуются протоколы',
                  blue: 'Требуются медиафайлы',
                  green: 'Все документы загружены'
                };
                
                return (
                <Card 
                  key={event.id} 
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary animate-fade-in relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {docStatus && (
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${statusColors[docStatus]} z-10`} 
                         title={statusText[docStatus]} />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary text-white">
                        <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                        {sportNames[event.sport]}
                      </Badge>
                      <Icon name="CalendarDays" size={20} className="text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                    {event.eventNumber && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-1">
                        <Icon name="Hash" size={13} />
                        {event.eventNumber}
                      </div>
                    )}
                    <CardDescription className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                        {event.additionalDates && event.additionalDates.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                            {event.additionalDates.length + 1} дн.
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} />
                        {event.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Icon name="Info" size={18} className="mr-2" />
                          Подробнее
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Icon name={sportIcons[event.sport]} size={24} className="text-primary" />
                            {event.title}
                          </DialogTitle>
                          <DialogDescription className="text-base space-y-3 pt-4">
                            {event.eventNumber && (
                              <div className="flex items-center gap-2 bg-primary/10 p-2 rounded">
                                <Icon name="Hash" size={18} className="text-primary" />
                                <strong>Номер мероприятия:</strong> {event.eventNumber}
                              </div>
                            )}
                            {event.eventType && (
                              <div className="flex items-center gap-2">
                                <Icon name={event.eventType === 'local' ? 'MapPin' : 'Plane'} size={18} className="text-primary" />
                                <strong>Тип мероприятия:</strong> {event.eventType === 'local' ? 'Местное' : 'Выездное'}
                              </div>
                            )}
                            {event.eventLevel && (
                              <div className="flex items-center gap-2">
                                <Icon name="Award" size={18} className="text-primary" />
                                <strong>Статус:</strong> {eventLevelNames[event.eventLevel]}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={18} className="text-primary" />
                              <strong>Дата:</strong> {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                            </div>
                            {event.additionalDates && event.additionalDates.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Icon name="CalendarDays" size={18} className="text-primary mt-0.5" />
                                <div>
                                  <strong>Все даты ({event.additionalDates.length + 1} дн.):</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {[event.date, ...event.additionalDates].map((d, i) => (
                                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        {new Date(d).toLocaleDateString('ru-RU')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={18} className="text-secondary" />
                              <strong>Место:</strong> {event.location}
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon name="Building" size={18} className="text-muted-foreground" />
                              <strong>Организатор:</strong> {event.organizer}
                            </div>
                            {event.responsiblePerson && (
                              <div className="flex items-center gap-2">
                                <Icon name="UserCheck" size={18} className="text-muted-foreground" />
                                <strong>Ответственный:</strong> {event.responsiblePerson}{event.responsiblePosition ? `, ${event.responsiblePosition}` : ''}
                              </div>
                            )}
                            {event.responsiblePhone && (
                              <div className="flex items-center gap-2">
                                <Icon name="Phone" size={18} className="text-muted-foreground" />
                                <strong>Телефон:</strong> {event.responsiblePhone}
                              </div>
                            )}
                            <div className="pt-2">
                              <p className="text-foreground">{event.description}</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        {event.documents && event.documents.length > 0 && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="FileText" size={18} className="text-primary" />
                              Документы о мероприятии
                            </h3>
                            <div className="space-y-2">
                              {event.documents.map((doc, i) => (
                                <Button 
                                  key={i}
                                  variant="outline" 
                                  className="w-full justify-start"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <Icon name="Download" size={16} className="mr-2" />
                                  {doc.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {event.media && event.media.length > 0 && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="Images" size={18} className="text-primary" />
                              Фото и видео
                            </h3>
                            <MediaUploader 
                              eventId={event.id} 
                              existingMedia={event.media}
                              isReadOnly={true}
                            />
                          </div>
                        )}
                        {(isAdmin || (isLoggedIn && currentUser && event.submittedBy === currentUser.email)) && (
                          <div className="pt-4 border-t space-y-2">
                            {isLoggedIn && currentUser && event.submittedBy === currentUser.email && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      handleEditEvent(event);
                                    }}
                                  >
                                    <Icon name="Edit" size={16} className="mr-2" />
                                    Редактировать
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      setManageFilesEvent(event);
                                      setIsManageFilesDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="Upload" size={16} className="mr-2" />
                                    Файлы и медиа
                                  </Button>
                                </div>
                              </div>
                            )}
                            {isAdmin && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  className="w-full"
                                  onClick={() => handleToggleEventStatus(event.id)}
                                >
                                  <Icon name={event.status === 'upcoming' ? 'Archive' : 'ArchiveRestore'} size={16} className="mr-2" />
                                  {event.status === 'upcoming' ? 'Переместить в прошедшие' : 'Вернуть в предстоящие'}
                                </Button>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => {
                                      handleEditEvent(event);
                                    }}
                                  >
                                    <Icon name="Edit" size={16} className="mr-2" />
                                    Редактировать
                                  </Button>
                                  <Button
                                    variant="default"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      setManageFilesEvent(event);
                                      setIsManageFilesDialogOpen(true);
                                    }}
                                  >
                                    <Icon name="Upload" size={16} className="mr-2" />
                                    Файлы и медиа
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => handleRejectEvent(event.id)}
                                  >
                                    <Icon name="Trash2" size={16} className="mr-2" />
                                    Удалить
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="past">
            {/* Легенда индикаторов */}
            <Card className="mb-6 max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-blue-600" />
                  Статус документов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-red-500">
                    <div className="w-4 h-4 rounded-full bg-red-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-red-900">Критическая нехватка</div>
                      <div className="text-gray-600">Не загружены основные документы</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-yellow-500">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-yellow-900">Требуются протоколы</div>
                      <div className="text-gray-600">Основные документы загружены</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900">Требуются медиафайлы</div>
                      <div className="text-gray-600">Все документы загружены</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-green-500">
                    <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-900">Полный комплект</div>
                      <div className="text-gray-600">Все документы и медиа загружены</div>
                    </div>
                  </div>
                </div>
                
                {/* Фильтр по статусу документов */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Filter" size={16} />
                      Фильтр по статусу
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(pastEvents, 'Прошедшие_мероприятия')}
                      className="flex items-center gap-2"
                    >
                      <Icon name="Download" size={14} />
                      Экспорт в Excel
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedDocStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('all')}
                      className="flex items-center gap-2"
                    >
                      <Icon name="List" size={14} />
                      Все мероприятия
                      <Badge variant="secondary" className="ml-1">{pastEvents.length}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'red' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('red')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Критические
                      <Badge variant="secondary" className="ml-1">{pastDocStats.red}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'yellow' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('yellow')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Без протоколов
                      <Badge variant="secondary" className="ml-1">{pastDocStats.yellow}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'blue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('blue')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Без медиа
                      <Badge variant="secondary" className="ml-1">{pastDocStats.blue}</Badge>
                    </Button>
                    <Button
                      variant={selectedDocStatus === 'green' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDocStatus('green')}
                      className={`flex items-center gap-2 ${selectedDocStatus === 'green' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Полный комплект
                      <Badge variant="secondary" className="ml-1">{pastDocStats.green}</Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event, index) => {
                const docStatus = event.approved ? getDocumentStatus(event) : null;
                const statusColors = {
                  red: 'bg-red-500',
                  yellow: 'bg-yellow-500',
                  blue: 'bg-blue-500',
                  green: 'bg-green-500'
                };
                const statusText = {
                  red: 'Основные документы не загружены',
                  yellow: 'Требуются протоколы',
                  blue: 'Требуются медиафайлы',
                  green: 'Все документы загружены'
                };
                
                return (
                <Card 
                  key={event.id} 
                  className="hover:shadow-lg transition-all duration-300 border animate-fade-in opacity-90 relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {docStatus && (
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${statusColors[docStatus]} z-10`} 
                         title={statusText[docStatus]} />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">
                        <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                        {sportNames[event.sport]}
                      </Badge>
                      <Badge variant="outline">Завершено</Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                    {event.eventNumber && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-1">
                        <Icon name="Hash" size={13} />
                        {event.eventNumber}
                      </div>
                    )}
                    <CardDescription className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        {new Date(event.date).toLocaleDateString('ru-RU')}
                        {event.additionalDates && event.additionalDates.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                            {event.additionalDates.length + 1} дн.
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={16} />
                        {event.location}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Award" size={16} className="text-primary mt-1" />
                        <div>
                          <p className="font-semibold mb-1">Результаты:</p>
                          <p className="text-muted-foreground">{event.result}</p>
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" onClick={() => setSelectedEvent(event)}>
                          <Icon name="Eye" size={18} className="mr-2" />
                          Подробнее
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Icon name={sportIcons[event.sport]} size={24} className="text-primary" />
                            {event.title}
                          </DialogTitle>
                          <DialogDescription className="text-base space-y-3 pt-4">
                            {event.eventNumber && (
                              <div className="flex items-center gap-2 bg-primary/10 p-2 rounded">
                                <Icon name="Hash" size={18} className="text-primary" />
                                <strong>Номер мероприятия:</strong> {event.eventNumber}
                              </div>
                            )}
                            {event.eventType && (
                              <div className="flex items-center gap-2">
                                <Icon name={event.eventType === 'local' ? 'MapPin' : 'Plane'} size={18} className="text-primary" />
                                <strong>Тип мероприятия:</strong> {event.eventType === 'local' ? 'Местное' : 'Выездное'}
                              </div>
                            )}
                            {event.eventLevel && (
                              <div className="flex items-center gap-2">
                                <Icon name="Award" size={18} className="text-primary" />
                                <strong>Статус:</strong> {eventLevelNames[event.eventLevel]}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={18} className="text-primary" />
                              <strong>Дата:</strong> {new Date(event.date).toLocaleDateString('ru-RU')}
                            </div>
                            {event.additionalDates && event.additionalDates.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Icon name="CalendarDays" size={18} className="text-primary mt-0.5" />
                                <div>
                                  <strong>Все даты ({event.additionalDates.length + 1} дн.):</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {[event.date, ...event.additionalDates].map((d, i) => (
                                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                        {new Date(d).toLocaleDateString('ru-RU')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={18} className="text-secondary" />
                              <strong>Место:</strong> {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Users" size={18} className="text-accent" />
                              <strong>Участников:</strong> {event.participants}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Building" size={18} className="text-muted-foreground" />
                              <strong>Организатор:</strong> {event.organizer}
                            </div>
                            {event.responsiblePerson && (
                              <div className="flex items-center gap-2">
                                <Icon name="UserCheck" size={18} className="text-muted-foreground" />
                                <strong>Ответственный:</strong> {event.responsiblePerson}{event.responsiblePosition ? `, ${event.responsiblePosition}` : ''}
                              </div>
                            )}
                            {event.responsiblePhone && (
                              <div className="flex items-center gap-2">
                                <Icon name="Phone" size={18} className="text-muted-foreground" />
                                <strong>Телефон:</strong> {event.responsiblePhone}
                              </div>
                            )}
                            <div className="pt-2">
                              <p className="text-foreground mb-3">{event.description}</p>
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Icon name="Award" size={20} className="text-primary mt-1" />
                                <div>
                                  <p className="font-bold mb-2">Результаты соревнования:</p>
                                  <p>{event.result}</p>
                                </div>
                              </div>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        
                        {event.media && event.media.length > 0 && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="Images" size={18} className="text-primary" />
                              Фото и видео с мероприятия
                            </h3>
                            <MediaUploader 
                              eventId={event.id} 
                              existingMedia={event.media}
                              isReadOnly={true}
                            />
                          </div>
                        )}
                        
                        {event.documents && event.documents.length > 0 && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="FileText" size={18} className="text-primary" />
                              Документы о мероприятии
                            </h3>
                            <div className="space-y-2">
                              {event.documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-2 border rounded-md">
                                  <Button 
                                    variant="ghost" 
                                    className="flex-1 justify-start"
                                    onClick={() => window.open(doc.url, '_blank')}
                                  >
                                    <Icon name="Download" size={16} className="mr-2" />
                                    {doc.name}
                                  </Button>
                                  {isAdmin && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const updatedDocs = event.documents?.filter((_, index) => index !== i);
                                        setEvents(events.map(ev => ev.id === event.id ? {...ev, documents: updatedDocs} : ev));
                                      }}
                                    >
                                      <Icon name="Trash2" size={14} />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(isAdmin || (isLoggedIn && currentUser && event.submittedBy === currentUser.email)) && (
                          <div className="pt-4 border-t space-y-2">
                            {isLoggedIn && currentUser && event.submittedBy === currentUser.email && (
                              <Button 
                                variant="default" 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                  setManageFilesEvent(event);
                                  setIsManageFilesDialogOpen(true);
                                }}
                              >
                                <Icon name="Upload" size={16} className="mr-2" />
                                Управление файлами
                              </Button>
                            )}
                            {isAdmin && (
                              <>
                                <Button 
                                  variant="secondary" 
                                  className="w-full"
                                  onClick={() => handleToggleEventStatus(event.id)}
                                >
                                  <Icon name={event.status === 'upcoming' ? 'Archive' : 'ArchiveRestore'} size={16} className="mr-2" />
                                  {event.status === 'upcoming' ? 'Переместить в прошедшие' : 'Вернуть в предстоящие'}
                                </Button>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Icon name="FilePlus" size={18} className="text-primary" />
                                  Загрузить документы (Админ)
                                </h3>
                                <Input
                                  type="file"
                                  multiple
                                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                                  disabled={isUploadingDoc}
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length === 0) return;
                                
                                setIsUploadingDoc(true);
                                const uploadedDocs: { name: string; url: string }[] = event.documents || [];
                                
                                try {
                                  for (const file of files) {
                                    const reader = new FileReader();
                                    const fileContent = await new Promise<string>((resolve) => {
                                      reader.onload = () => {
                                        const base64 = (reader.result as string).split(',')[1];
                                        resolve(base64);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                    
                                    const response = await fetch('https://functions.poehali.dev/d33abef9-76df-4869-9223-096e3c85c33f', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        fileName: file.name,
                                        fileContent: fileContent,
                                        fileType: 'document'
                                      })
                                    });
                                    
                                    const result = await response.json();
                                    uploadedDocs.push({ name: file.name, url: result.url });
                                  }
                                  
                                  setEvents(events.map(e => e.id === event.id ? {...e, documents: uploadedDocs} : e));
                                  toast({
                                    title: "Документы загружены",
                                    description: `Загружено ${files.length} файл(ов)`
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Ошибка загрузки",
                                    description: "Не удалось загрузить файлы",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploadingDoc(false);
                                }
                              }}
                                  className="cursor-pointer mb-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {isUploadingDoc ? 'Загрузка документов...' : 'PDF, Word, Excel файлы'}
                                </p>
                              </>
                            )}
                          </div>
                        )}
                        
                        {isAdmin && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="ImagePlus" size={18} className="text-primary" />
                              Загрузить медиа (Админ)
                            </h3>
                            <Input
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              disabled={isUploading}
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length === 0) return;
                                
                                setIsUploading(true);
                                const uploadedMedia: { type: 'image' | 'video'; url: string; name: string }[] = event.media || [];
                                
                                try {
                                  for (const file of files) {
                                    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
                                    const reader = new FileReader();
                                    const fileContent = await new Promise<string>((resolve) => {
                                      reader.onload = () => {
                                        const base64 = (reader.result as string).split(',')[1];
                                        resolve(base64);
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                    
                                    const response = await fetch('https://functions.poehali.dev/d33abef9-76df-4869-9223-096e3c85c33f', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        fileName: file.name,
                                        fileContent: fileContent,
                                        fileType: fileType
                                      })
                                    });
                                    
                                    const result = await response.json();
                                    uploadedMedia.push({ type: fileType, url: result.url, name: file.name });
                                  }
                                  
                                  setEvents(events.map(e => e.id === event.id ? {...e, media: uploadedMedia} : e));
                                  toast({
                                    title: "Медиа загружены",
                                    description: `Загружено ${files.length} файл(ов)`
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Ошибка загрузки",
                                    description: "Не удалось загрузить файлы",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploading(false);
                                }
                              }}
                              className="cursor-pointer mb-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {isUploading ? 'Загрузка файлов...' : 'Фото и видео с мероприятия'}
                            </p>
                          </div>
                        )}
                        {(isAdmin || (isLoggedIn && currentUser?.email === event.submittedBy)) && (
                          <div className="pt-4 border-t">
                            <Button
                              variant="default"
                              className="w-full mb-2"
                              onClick={() => handleOpenReport(event)}
                            >
                              <Icon name="ClipboardCheck" size={16} className="mr-2" />
                              Внести итоги мероприятия
                            </Button>
                            {event.actualParticipants != null || event.actualSpectators != null || event.actualComment ? (
                              <div className="rounded-md bg-muted p-3 text-sm space-y-1 mb-2">
                                <p className="font-medium text-foreground">Фактические итоги:</p>
                                {event.actualParticipants != null && (
                                  <p>Участников: <span className="font-medium">{event.actualParticipants}</span></p>
                                )}
                                {event.actualSpectators != null && (
                                  <p>Зрителей: <span className="font-medium">{event.actualSpectators}</span></p>
                                )}
                                {event.actualComment && (
                                  <p>Комментарий: <span className="font-medium">{event.actualComment}</span></p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        )}
                        {isAdmin && (
                          <div className="pt-2 border-t flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                handleEditEvent(event);
                              }}
                            >
                              <Icon name="Edit" size={16} className="mr-2" />
                              Редактировать
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleRejectEvent(event.id)}
                            >
                              <Icon name="Trash2" size={16} className="mr-2" />
                              Удалить
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="pending">
              {events.length > 0 && (
                <div className="mb-6">
                  <Button 
                    variant="destructive"
                    className="w-full"
                    size="lg"
                    onClick={() => setIsDeleteAllEventsDialogOpen(true)}
                  >
                    <Icon name="Trash2" size={20} className="mr-2" />
                    Удалить все мероприятия ({events.length})
                  </Button>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingEvents.length === 0 ? (
                  <Card className="col-span-full text-center py-12 border-2 border-dashed">
                    <CardContent>
                      <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
                      <p className="text-lg text-muted-foreground">Нет событий на модерации</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingEvents.map((event, index) => (
                    <Card 
                      key={event.id} 
                      className="hover:shadow-xl transition-all duration-300 border-2 border-orange-500 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="default" className="bg-orange-500 text-white">
                            <Icon name="Clock" size={14} className="mr-1" />
                            На модерации
                          </Badge>
                          <Badge variant="outline">
                            <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                            {sportNames[event.sport]}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                        <CardDescription className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" size={16} />
                            {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="MapPin" size={16} />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon name="Calendar" size={14} />
                            Подано: {new Date(event.submittedAt).toLocaleDateString('ru-RU')}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {event.submittedBy && (() => {
                            const submitter = users.find(u => u.email === event.submittedBy);
                            return submitter ? (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Icon name="User" size={16} className="text-blue-600" />
                                  <span className="text-muted-foreground">Автор заявки:</span>
                                  <span className="font-semibold text-blue-900">{submitter.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-6">
                                  <Icon name="Mail" size={12} />
                                  {submitter.email}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-6">
                                  <Icon name="Phone" size={12} />
                                  {submitter.phone}
                                </div>
                              </div>
                            ) : null;
                          })()}
                          <div className="text-sm">
                            <span className="text-muted-foreground">Организатор:</span>
                            <span className="font-medium ml-2">{event.organizer}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Описание:</span>
                            <p className="mt-1 text-foreground">{event.description || 'Не указано'}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Макс. участников:</span>
                            <span className="font-medium ml-2">{event.maxParticipants}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveEvent(event.id)}
                          >
                            <Icon name="Check" size={18} className="mr-2" />
                            Одобрить
                          </Button>
                          <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => openRejectDialog(event.id)}
                          >
                            <Icon name="X" size={18} className="mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}
          
          {isAdmin && (
            <TabsContent value="users">
              {users.filter(u => u.approved).length > 0 && (
                <div className="mb-6">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                    onClick={() => setIsBroadcastDialogOpen(true)}
                  >
                    <Icon name="Megaphone" size={20} className="mr-2" />
                    Массовая рассылка всем пользователям ({users.filter(u => u.approved).length})
                  </Button>
                </div>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                {users.filter(u => !u.approved).length === 0 ? (
                  <Card className="col-span-full text-center py-12 border-2 border-dashed">
                    <CardContent>
                      <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
                      <p className="text-lg text-muted-foreground">Нет пользователей на модерации</p>
                    </CardContent>
                  </Card>
                ) : (
                  users.filter(u => !u.approved).map((user, index) => (
                    <Card 
                      key={user.email} 
                      className="hover:shadow-xl transition-all duration-300 border-2 border-red-500 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="default" className="bg-red-500 text-white">
                            <Icon name="UserX" size={14} className="mr-1" />
                            Ожидает одобрения
                          </Badge>
                          <Badge variant="outline">
                            <Icon name={user.userType === 'individual' ? 'User' : 'Building'} size={14} className="mr-1" />
                            {user.userType === 'individual' ? 'Физ. лицо' : 'Юр. лицо'}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight">{user.name}</CardTitle>
                        <CardDescription className="flex flex-col gap-1 mt-2">
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" size={16} />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Phone" size={16} />
                            {user.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Icon name="Calendar" size={14} />
                            Подано: {new Date(user.submittedAt || '').toLocaleDateString('ru-RU')}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 mb-4">
                          {(() => {
                            const userEventsCount = events.filter(e => e.submittedBy === user.email).length;
                            const approvedEventsCount = events.filter(e => e.submittedBy === user.email && e.approved).length;
                            const pendingEventsCount = events.filter(e => e.submittedBy === user.email && !e.approved).length;
                            
                            if (userEventsCount > 0) {
                              return (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-md mb-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-900 mb-2">
                                    <Icon name="BarChart3" size={16} className="text-purple-600" />
                                    Статистика мероприятий
                                  </div>
                                  <div className="space-y-1 ml-6">
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <Icon name="Calendar" size={12} />
                                      Всего предложено: <span className="font-semibold text-purple-900">{userEventsCount}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <Icon name="CheckCircle" size={12} />
                                      Одобрено: <span className="font-semibold text-green-600">{approvedEventsCount}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      <Icon name="Clock" size={12} />
                                      На модерации: <span className="font-semibold text-orange-600">{pendingEventsCount}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {user.userType === 'individual' ? (
                            <>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Дата рождения:</span>
                                <span className="font-medium ml-2">{user.birthDate || 'Не указано'}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Паспорт:</span>
                                <span className="font-medium ml-2">
                                  {user.passportSeries} {user.passportNumber}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Выдан:</span>
                                <span className="font-medium ml-2">{user.passportIssueDate}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Кем выдан:</span>
                                <p className="mt-1 text-foreground text-xs">{user.passportIssuedBy}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm">
                                <span className="text-muted-foreground">ИНН:</span>
                                <span className="font-medium ml-2">{user.inn}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Название:</span>
                                <span className="font-medium ml-2">{user.companyName}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Юр. адрес:</span>
                                <p className="mt-1 text-foreground text-xs">{user.legalAddress}</p>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveUser(user.email)}
                          >
                            <Icon name="Check" size={18} className="mr-2" />
                            Одобрить
                          </Button>
                          <Button 
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleRejectUser(user.email)}
                          >
                            <Icon name="X" size={18} className="mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
              
              {users.filter(u => u.approved).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="UserCheck" size={24} className="text-green-600" />
                    Одобренные пользователи ({users.filter(u => u.approved).length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.filter(u => u.approved).map((user) => (
                      <Card key={user.email} className="border-green-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="border-green-500 text-green-700">
                              <Icon name="UserCheck" size={12} className="mr-1" />
                              Активен
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {user.userType === 'individual' ? 'Физ. лицо' : 'Юр. лицо'}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{user.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Icon name="Mail" size={14} />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Phone" size={14} />
                              {user.phone}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setMessageRecipient(user.email);
                                setMessageSubject('');
                                setMessageBody('');
                                setIsSendMessageDialogOpen(true);
                              }}
                            >
                              <Icon name="Mail" size={14} className="mr-1" />
                              Написать
                            </Button>
                            <Button 
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAdminDeleteUser(user.email)}
                            >
                              <Icon name="Trash2" size={14} className="mr-1" />
                              Удалить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}
          
          {isAdmin && (
            <TabsContent value="registrations">
              <div className="grid gap-6">
                {registrations.length === 0 ? (
                  <Card className="col-span-full text-center py-12 border-2 border-dashed">
                    <CardContent>
                      <Icon name="FileText" size={48} className="mx-auto text-blue-500 mb-4" />
                      <p className="text-lg text-muted-foreground">Нет заявок на мероприятия</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                          <th className="p-4 text-left">ID</th>
                          <th className="p-4 text-left">ФИО</th>
                          <th className="p-4 text-left">Телефон</th>
                          <th className="p-4 text-left">Email</th>
                          <th className="p-4 text-left">Мероприятие</th>
                          <th className="p-4 text-left">Дата подачи</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map((reg, index) => (
                          <tr 
                            key={reg.id} 
                            className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <td className="p-4 font-semibold text-blue-600">#{reg.id}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Icon name="User" size={16} className="text-blue-600" />
                                {reg.fullName}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Icon name="Phone" size={16} className="text-green-600" />
                                {reg.phone}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Icon name="Mail" size={16} className="text-orange-600" />
                                {reg.email}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Icon name="Calendar" size={16} className="text-purple-600" />
                                {reg.eventName}
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground text-sm">
                              {new Date(reg.createdAt).toLocaleString('ru-RU')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <section className="mt-16 text-center animate-fade-in">
          <Card className="max-w-2xl mx-auto border-2">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Icon name="Phone" size={28} className="text-primary" />
                Контакты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Icon name="Mail" size={20} className="text-secondary" />
                <span>info@истра-екп.рф</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Phone" size={20} className="text-accent" />
                <span>+7 (495) 994-85-55 (доб. 429)</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="MapPin" size={20} className="text-primary" />
                <span>г. Истра, ул. Ленина, д. 81</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Media Viewer Dialog */}
      {isMediaViewerOpen && selectedEvent && selectedEvent.media && selectedMediaIndex !== null && (
        <Dialog open={isMediaViewerOpen} onOpenChange={setIsMediaViewerOpen}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedMediaIndex + 1} / {selectedEvent.media.length}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 flex items-center justify-center bg-black/5 rounded-lg relative">
              {selectedEvent.media[selectedMediaIndex].type === 'image' ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                    <Icon name="Image" size={64} className="text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                    <Icon name="Video" size={64} className="text-muted-foreground" />
                  </div>
                </div>
              )}
              
              {/* Navigation buttons */}
              {selectedMediaIndex > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={() => setSelectedMediaIndex(selectedMediaIndex - 1)}
                >
                  <Icon name="ChevronLeft" size={24} />
                </Button>
              )}
              
              {selectedMediaIndex < selectedEvent.media.length - 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => setSelectedMediaIndex(selectedMediaIndex + 1)}
                >
                  <Icon name="ChevronRight" size={24} />
                </Button>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto py-2">
              {selectedEvent.media.map((item, i) => (
                <button
                  key={i}
                  className={`flex-shrink-0 w-16 h-16 rounded-md flex items-center justify-center ${
                    i === selectedMediaIndex ? 'ring-2 ring-primary bg-muted' : 'bg-muted/50'
                  }`}
                  onClick={() => setSelectedMediaIndex(i)}
                >
                  {item.type === 'image' ? (
                    <Icon name="Image" size={20} className="text-muted-foreground" />
                  ) : (
                    <Icon name="Video" size={20} className="text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Files Dialog */}
      <Dialog open={isManageFilesDialogOpen} onOpenChange={setIsManageFilesDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon name="FolderOpen" size={24} className="text-primary" />
              Управление файлами мероприятия
            </DialogTitle>
            <DialogDescription>
              {manageFilesEvent?.title}
            </DialogDescription>
          </DialogHeader>

          {manageFilesEvent && (
            <div className="space-y-6">
              {/* Required Documents Section */}
              {manageFilesEvent.requiredDocuments && manageFilesEvent.requiredDocuments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="ClipboardCheck" size={18} className="text-primary" />
                    Обязательные документы
                  </h3>
                  <div className="space-y-3">
                    {manageFilesEvent.requiredDocuments.map((doc, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-md border-2 ${
                          doc.uploaded 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-amber-50 border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {doc.uploaded ? (
                              <Icon name="CheckCircle2" size={20} className="text-green-600" />
                            ) : (
                              <Icon name="AlertCircle" size={20} className="text-amber-600" />
                            )}
                            <span className="font-medium">{doc.name}</span>
                          </div>
                          {doc.uploaded ? (
                            <Badge className="bg-green-600">Загружен</Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-600 text-amber-600">Требуется</Badge>
                          )}
                        </div>
                        
                        {doc.uploaded && doc.fileName && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Icon name="FileText" size={14} />
                              {doc.fileName}
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => doc.url && window.open(doc.url, '_blank')}
                              >
                                <Icon name="Download" size={14} className="mr-1" />
                                Скачать
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={async () => {
                                  const updatedRequiredDocs = manageFilesEvent.requiredDocuments?.map((d, idx) => 
                                    idx === i ? { ...d, uploaded: false, url: undefined, fileName: undefined } : d
                                  );
                                  setEvents(events.map(ev => ev.id === manageFilesEvent.id ? {...ev, requiredDocuments: updatedRequiredDocs} : ev));
                                  const updatedEvent = {...manageFilesEvent, requiredDocuments: updatedRequiredDocs};
                                  setManageFilesEvent(updatedEvent);
                                  await handleSaveFiles(updatedEvent);
                                  toast({
                                    title: "Документ удален",
                                    description: `${doc.name} был удален`
                                  });
                                }}
                              >
                                <Icon name="Trash2" size={14} className="text-red-600" />
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {!doc.uploaded && (
                          <div className="mt-3">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              disabled={isUploadingDoc}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setIsUploadingDoc(true);
                                
                                try {
                                  const reader = new FileReader();
                                  const fileContent = await new Promise<string>((resolve) => {
                                    reader.onload = () => {
                                      const base64 = (reader.result as string).split(',')[1];
                                      resolve(base64);
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                  
                                  const response = await fetch('https://functions.poehali.dev/d33abef9-76df-4869-9223-096e3c85c33f', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      fileName: file.name,
                                      fileContent: fileContent,
                                      fileType: 'document'
                                    })
                                  });
                                  
                                  const result = await response.json();
                                  
                                  const updatedRequiredDocs = manageFilesEvent.requiredDocuments?.map((d, idx) => 
                                    idx === i ? { ...d, uploaded: true, url: result.url, fileName: file.name } : d
                                  );
                                  
                                  setEvents(events.map(ev => ev.id === manageFilesEvent.id ? {...ev, requiredDocuments: updatedRequiredDocs} : ev));
                                  const updatedEvent = {...manageFilesEvent, requiredDocuments: updatedRequiredDocs};
                                  setManageFilesEvent(updatedEvent);
                                  await handleSaveFiles(updatedEvent);
                                  
                                  toast({
                                    title: "Документ загружен",
                                    description: `${doc.name} успешно загружен`
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Ошибка загрузки",
                                    description: "Не удалось загрузить файл",
                                    variant: "destructive"
                                  });
                                } finally {
                                  setIsUploadingDoc(false);
                                  e.target.value = '';
                                }
                              }}
                              className="cursor-pointer text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {isUploadingDoc ? 'Загрузка...' : 'PDF, Word, Excel файлы'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Existing Documents Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={18} className="text-primary" />
                  Дополнительные документы ({manageFilesEvent.documents?.length || 0})
                </h3>
                {manageFilesEvent.documents && manageFilesEvent.documents.length > 0 ? (
                  <div className="space-y-2">
                    {manageFilesEvent.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2 flex-1">
                          <Icon name="FileText" size={16} className="text-blue-600" />
                          <span className="text-sm truncate">{doc.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Icon name="Download" size={14} className="mr-1" />
                            Скачать
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              const updatedDocs = manageFilesEvent.documents?.filter((_, index) => index !== i);
                              setEvents(events.map(ev => ev.id === manageFilesEvent.id ? {...ev, documents: updatedDocs} : ev));
                              const updatedEvent = {...manageFilesEvent, documents: updatedDocs};
                              setManageFilesEvent(updatedEvent);
                              await handleSaveFiles(updatedEvent);
                              toast({
                                title: "Документ удален",
                                description: `${doc.name} был удален`
                              });
                            }}
                          >
                            <Icon name="Trash2" size={14} className="text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    Нет загруженных документов
                  </p>
                )}
              </div>

              {/* Upload Documents Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="FilePlus" size={18} className="text-primary" />
                  Загрузить документы
                </h3>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  disabled={isUploadingDoc}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    
                    setIsUploadingDoc(true);
                    const uploadedDocs: { name: string; url: string }[] = manageFilesEvent.documents || [];
                    
                    try {
                      for (const file of files) {
                        const reader = new FileReader();
                        const fileContent = await new Promise<string>((resolve) => {
                          reader.onload = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            resolve(base64);
                          };
                          reader.readAsDataURL(file);
                        });
                        
                        const response = await fetch('https://functions.poehali.dev/d33abef9-76df-4869-9223-096e3c85c33f', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            fileName: file.name,
                            fileContent: fileContent,
                            fileType: 'document'
                          })
                        });
                        
                        const result = await response.json();
                        uploadedDocs.push({ name: file.name, url: result.url });
                      }
                      
                      setEvents(events.map(e => e.id === manageFilesEvent.id ? {...e, documents: uploadedDocs} : e));
                      const updatedEvent = {...manageFilesEvent, documents: uploadedDocs};
                      setManageFilesEvent(updatedEvent);
                      await handleSaveFiles(updatedEvent);
                      toast({
                        title: "Документы загружены",
                        description: `Загружено ${files.length} файл(ов)`
                      });
                    } catch (error) {
                      toast({
                        title: "Ошибка загрузки",
                        description: "Не удалось загрузить файлы",
                        variant: "destructive"
                      });
                    } finally {
                      setIsUploadingDoc(false);
                      e.target.value = '';
                    }
                  }}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {isUploadingDoc ? 'Загрузка документов...' : 'PDF, Word, Excel файлы (можно выбрать несколько)'}
                </p>
              </div>

              {/* Existing Media Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Images" size={18} className="text-primary" />
                  Загруженные фото и видео ({manageFilesEvent.media?.length || 0})
                </h3>
                {manageFilesEvent.media && manageFilesEvent.media.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {manageFilesEvent.media.map((item, i) => (
                      <div 
                        key={i} 
                        className="relative group"
                      >
                        <div className="aspect-square bg-muted rounded-md flex items-center justify-center border">
                          {item.type === 'image' ? (
                            <Icon name="Image" size={32} className="text-muted-foreground" />
                          ) : (
                            <Icon name="Video" size={32} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            <Icon name="Eye" size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={async () => {
                              const updatedMedia = manageFilesEvent.media?.filter((_, index) => index !== i);
                              setEvents(events.map(ev => ev.id === manageFilesEvent.id ? {...ev, media: updatedMedia} : ev));
                              const updatedEvent = {...manageFilesEvent, media: updatedMedia};
                              setManageFilesEvent(updatedEvent);
                              await handleSaveFiles(updatedEvent);
                              toast({
                                title: "Медиафайл удален",
                                description: `${item.name} был удален`
                              });
                            }}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{item.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
                    Нет загруженных медиафайлов
                  </p>
                )}
              </div>

              {/* Upload Media Section */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Icon name="ImagePlus" size={18} className="text-primary" />
                  Фото и видео мероприятия
                </h3>
                <MediaUploader
                  eventId={manageFilesEvent.id}
                  existingMedia={manageFilesEvent.media || []}
                  onMediaUpdate={async (updatedMedia) => {
                    setEvents(events.map(e => e.id === manageFilesEvent.id ? {...e, media: updatedMedia} : e));
                    const updatedEvent = {...manageFilesEvent, media: updatedMedia};
                    setManageFilesEvent(updatedEvent);
                    await handleSaveFiles(updatedEvent);
                  }}
                  isReadOnly={false}
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsManageFilesDialogOpen(false)}>
                  Закрыть
                </Button>
                <Button
                  onClick={() => handleSaveFiles(manageFilesEvent)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Icon name="AlertTriangle" size={24} />
              Удаление аккаунта
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">
                <strong>Внимание:</strong> После удаления аккаунта:
              </p>
              <ul className="list-disc ml-5 mt-2 text-sm text-red-800">
                <li>Все ваши данные будут удалены</li>
                <li>Вы потеряете доступ к системе</li>
                <li>Восстановление будет невозможно</li>
              </ul>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="delete-account-password">Введите пароль для подтверждения *</Label>
              <Input
                id="delete-account-password"
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                placeholder="Ваш текущий пароль"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteAccountPassword) {
                    handleDeleteCurrentUserAccount();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Для безопасности введите пароль от вашей учетной записи
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteAccountDialogOpen(false);
                setDeleteAccountPassword('');
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCurrentUserAccount}
              disabled={!deleteAccountPassword}
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Удалить аккаунт
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Send Message Dialog */}
      <Dialog open={isSendMessageDialogOpen} onOpenChange={setIsSendMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Mail" size={24} />
              Отправить сообщение пользователю
            </DialogTitle>
            <DialogDescription>
              Отправить личное сообщение на email пользователя
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message-recipient">Email получателя *</Label>
              <Input
                id="message-recipient"
                type="email"
                value={messageRecipient}
                onChange={(e) => setMessageRecipient(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message-subject">Тема сообщения *</Label>
              <Input
                id="message-subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Например: Важное уведомление"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message-body">Текст сообщения *</Label>
              <Textarea
                id="message-body"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Введите текст сообщения..."
                rows={8}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => {
              setIsSendMessageDialogOpen(false);
              setMessageRecipient('');
              setMessageSubject('');
              setMessageBody('');
            }}>
              Отмена
            </Button>
            <Button onClick={handleSendMessage}>
              <Icon name="Send" size={18} className="mr-2" />
              Отправить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Broadcast Message Dialog */}
      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Megaphone" size={24} className="text-blue-600" />
              Массовая рассылка
            </DialogTitle>
            <DialogDescription>
              Отправить сообщение всем одобренным пользователям ({users.filter(u => u.approved).length} чел.)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Важная информация</p>
                  <p>Сообщение будет отправлено всем одобренным пользователям системы. Между отправками автоматически делается пауза 0.5 секунды, чтобы не перегружать SMTP сервер.</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="broadcast-subject">Тема рассылки *</Label>
              <Input
                id="broadcast-subject"
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder="Например: Важное объявление"
                disabled={isSendingBroadcast}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="broadcast-body">Текст сообщения *</Label>
              <Textarea
                id="broadcast-body"
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                placeholder="Введите текст сообщения для всех пользователей..."
                rows={10}
                disabled={isSendingBroadcast}
              />
              <p className="text-xs text-muted-foreground">
                Получатели: {users.filter(u => u.approved).map(u => u.name).join(', ')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBroadcastDialogOpen(false);
                setBroadcastSubject('');
                setBroadcastBody('');
              }}
              disabled={isSendingBroadcast}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleBroadcastMessage}
              disabled={isSendingBroadcast}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSendingBroadcast ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить всем
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="ClipboardCheck" size={20} className="text-primary" />
              Итоги мероприятия
            </DialogTitle>
            {reportEvent && (
              <DialogDescription>{reportEvent.title} · {new Date(reportEvent.date).toLocaleDateString('ru-RU')}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Фактическое количество участников</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Введите число"
                value={reportActualParticipants}
                onChange={e => setReportActualParticipants(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Фактическое количество зрителей</label>
              <input
                type="number"
                min="0"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Введите число"
                value={reportActualSpectators}
                onChange={e => setReportActualSpectators(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Комментарий о проведённом мероприятии</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none"
                placeholder="Краткое описание результатов, особенностей проведения..."
                rows={4}
                value={reportActualComment}
                onChange={e => setReportActualComment(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsReportDialogOpen(false)}>
              Отмена
            </Button>
            <Button className="flex-1" onClick={handleSaveReport} disabled={isSavingReport}>
              {isSavingReport ? 'Сохранение...' : 'Сохранить итоги'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Events Dialog */}
      <Dialog open={isDeleteAllEventsDialogOpen} onOpenChange={setIsDeleteAllEventsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Icon name="AlertTriangle" size={24} />
              Удаление мероприятий
            </DialogTitle>
            <DialogDescription>
              Выберите период для удаления мероприятий. Это действие необратимо.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid gap-2">
              <Label>Выберите период удаления</Label>
              <Select value={deletePeriodType} onValueChange={(value: 'all' | 'year' | 'month' | 'range') => {
                setDeletePeriodType(value);
                if (value === 'month' && !deleteMonth) {
                  const now = new Date();
                  setDeleteMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                }
                if (value === 'range' && (!deleteDateFrom || !deleteDateTo)) {
                  const now = new Date();
                  const yearStart = new Date(now.getFullYear(), 0, 1);
                  setDeleteDateFrom(yearStart.toISOString().split('T')[0]);
                  setDeleteDateTo(now.toISOString().split('T')[0]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все мероприятия</SelectItem>
                  <SelectItem value="year">За конкретный год</SelectItem>
                  <SelectItem value="month">За конкретный месяц</SelectItem>
                  <SelectItem value="range">За период (диапазон дат)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {deletePeriodType === 'year' && (
              <div className="grid gap-2">
                <Label htmlFor="delete-year">Выберите год</Label>
                <Select value={deleteYear} onValueChange={setDeleteYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Год" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i;
                      return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {deletePeriodType === 'month' && (
              <div className="grid gap-2">
                <Label htmlFor="delete-month">Выберите месяц</Label>
                <Input
                  id="delete-month"
                  type="month"
                  value={deleteMonth}
                  onChange={(e) => setDeleteMonth(e.target.value)}
                  disabled={isDeletingAllEvents}
                />
              </div>
            )}
            
            {deletePeriodType === 'range' && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="delete-date-from">Дата начала периода</Label>
                  <Input
                    id="delete-date-from"
                    type="date"
                    value={deleteDateFrom}
                    onChange={(e) => setDeleteDateFrom(e.target.value)}
                    disabled={isDeletingAllEvents}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="delete-date-to">Дата окончания периода</Label>
                  <Input
                    id="delete-date-to"
                    type="date"
                    value={deleteDateTo}
                    onChange={(e) => setDeleteDateTo(e.target.value)}
                    disabled={isDeletingAllEvents}
                    min={deleteDateFrom}
                  />
                </div>
                {deleteDateFrom && deleteDateTo && deleteDateFrom > deleteDateTo && (
                  <p className="text-sm text-red-600">
                    ⚠️ Дата окончания должна быть позже даты начала
                  </p>
                )}
              </div>
            )}
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 font-semibold mb-2">
                ВНИМАНИЕ! Будут удалены:
              </p>
              {(() => {
                const eventsToDelete = getEventsToDelete();
                const approvedToDelete = eventsToDelete.filter(e => e.approved).length;
                const pendingToDelete = eventsToDelete.filter(e => !e.approved).length;
                
                return (
                  <>
                    <ul className="list-disc ml-5 text-sm text-red-800 space-y-1">
                      <li>Одобренные мероприятия: {approvedToDelete} шт.</li>
                      <li>Заявки на модерации: {pendingToDelete} шт.</li>
                      <li>Документы и медиафайлы</li>
                      <li>История и результаты</li>
                    </ul>
                    <p className="text-sm text-red-900 font-semibold mt-3">
                      Итого к удалению: {eventsToDelete.length} мероприятий
                    </p>
                  </>
                );
              })()}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="delete-all-password">
                Введите пароль администратора для подтверждения *
              </Label>
              <Input
                id="delete-all-password"
                type="password"
                value={deleteAllEventsPassword}
                onChange={(e) => setDeleteAllEventsPassword(e.target.value)}
                placeholder="Пароль администратора"
                disabled={isDeletingAllEvents}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isDeletingAllEvents && getEventsToDelete().length > 0) {
                    handleDeleteAllEvents();
                  }
                }}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteAllEventsDialogOpen(false);
                setDeleteAllEventsPassword('');
                setDeletePeriodType('all');
                setDeleteMonth('');
                setDeleteDateFrom('');
                setDeleteDateTo('');
              }}
              disabled={isDeletingAllEvents}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllEvents}
              disabled={isDeletingAllEvents || !deleteAllEventsPassword || getEventsToDelete().length === 0}
            >
              {isDeletingAllEvents ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Удалить все ({events.length})
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reject Event Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Icon name="XCircle" size={24} />
              Отклонение мероприятия
            </DialogTitle>
            <DialogDescription>
              Укажите причину отклонения (необязательно). Она будет отправлена организатору на email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Причина отклонения</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Например: Конфликт по датам с другим мероприятием"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Если не указать причину, будет отправлен стандартный список возможных причин
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectingEventId(null);
                setRejectionReason('');
              }}
            >
              Отмена
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejectEvent}
            >
              <Icon name="X" size={18} className="mr-2" />
              Отклонить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}