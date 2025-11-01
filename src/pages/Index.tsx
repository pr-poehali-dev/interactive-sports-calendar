import { useState, useMemo } from 'react';
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

type SportType = 'all' | 'football' | 'basketball' | 'running' | 'volleyball' | 'tennis' | 'hockey' | 'boxing' | 'wrestling' | 'judo' | 'karate' | 'taekwondo' | 'sambo' | 'gymnastics' | 'swimming' | 'athletics' | 'skiing' | 'biathlon' | 'figureskating' | 'speedskating' | 'chess' | 'badminton' | 'tabletennis' | 'cycling' | 'rowing' | 'shooting' | 'archery' | 'fencing' | 'weightlifting' | 'triathlon' | 'pentathlon' | 'handball' | 'waterpolo' | 'rugby' | 'baseball' | 'softball' | 'golf' | 'equestrian' | 'sailing' | 'surfing' | 'climbing' | 'skateboarding' | 'bmx' | 'mountainbike' | 'freestyleskiing' | 'snowboarding' | 'curling' | 'bobsleigh' | 'luge' | 'skeleton';

type EventLevel = 'municipal' | 'intermunicipal' | 'regional' | 'interregional' | 'cfo' | 'national' | 'european' | 'world';

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
  result?: string;
  approved: boolean;
  submittedAt: string;
  submittedBy?: string;
  documents?: { name: string; url: string }[];
  media?: { type: 'image' | 'video'; url: string; name: string }[];
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

const initialEvents: Event[] = [
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
    ]
  },
  {
    id: 2,
    eventNumber: 'МО-2025-002',
    eventType: 'local',
    eventLevel: 'municipal',
    title: 'Истринский забег',
    date: '2025-10-10',
    time: '09:00',
    location: 'Центральный парк г. Истра',
    sport: 'running',
    participants: 0,
    maxParticipants: 100,
    status: 'past',
    description: 'Традиционный городской забег на 5 км и 10 км.',
    organizer: 'Администрация г.о. Истра',
    result: 'Мероприятие успешно завершено. Приняло участие 87 человек.',
    approved: true,
    submittedAt: new Date().toISOString(),
    documents: [
      { name: 'Положение о забеге.pdf', url: 'https://storage.poehali.dev/files/demo-race-regulations.pdf' },
      { name: 'Протокол результатов.pdf', url: 'https://storage.poehali.dev/files/demo-race-results.pdf' },
      { name: 'Список победителей и призёров.xlsx', url: 'https://storage.poehali.dev/files/demo-race-winners.xlsx' }
    ],
    media: [
      { type: 'image', url: 'https://storage.poehali.dev/files/demo-race-1.jpg', name: 'Старт забега' },
      { type: 'image', url: 'https://storage.poehali.dev/files/demo-race-2.jpg', name: 'Участники на дистанции' },
      { type: 'image', url: 'https://storage.poehali.dev/files/demo-race-3.jpg', name: 'Награждение победителей' },
      { type: 'video', url: 'https://storage.poehali.dev/files/demo-race-video.mp4', name: 'Видеообзор мероприятия' },
      { type: 'image', url: 'https://storage.poehali.dev/files/demo-race-4.jpg', name: 'Массовый старт' },
      { type: 'image', url: 'https://storage.poehali.dev/files/demo-race-5.jpg', name: 'Финишная прямая' }
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
  email: string;
  name: string;
  phone: string;
  approved?: boolean;
  submittedAt?: string;
}

export default function Index() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
    description: '',
    organizer: '',
    maxParticipants: 50,
    participants: 0,
    status: 'upcoming'
  });

  const approvedEvents = events.filter(event => event.approved);
  const pendingEvents = events.filter(event => !event.approved);
  
  const filteredEvents = approvedEvents.filter(event => {
    const matchesSport = selectedSport === 'all' ? true : event.sport === selectedSport;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.eventNumber && event.eventNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSport && matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.status === 'past');

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

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.organizer || !newEvent.eventLevel) {
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
    
    const newId = Math.max(...events.map(e => e.id), 0) + 1;
    const year = new Date(newEvent.date).getFullYear();
    
    const eventType = newEvent.eventType || suggestedEventType || 'local';
    const eventLevel = newEvent.eventLevel;
    const isAutoNumber = eventType === 'local' && (eventLevel === 'municipal' || eventLevel === 'intermunicipal');
    
    let finalEventNumber: string | undefined;
    if (isAutoNumber) {
      finalEventNumber = `МО-${year}-${String(newId).padStart(3, '0')}`;
    } else if (manualEventNumber.trim()) {
      finalEventNumber = manualEventNumber.trim();
    }
    
    const finalSport = showCustomSportInput ? customSport : newEvent.sport;
    const finalTitle = showCustomSportInput 
      ? `${newEvent.title} (${customSport})`
      : newEvent.title;
    
    const eventToAdd: Event = {
      id: newId,
      eventNumber: finalEventNumber,
      title: finalTitle,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      eventType: eventType,
      eventLevel: newEvent.eventLevel,
      sport: (showCustomSportInput ? 'all' : newEvent.sport) as SportType,
      description: newEvent.description || '',
      organizer: newEvent.organizer,
      maxParticipants: newEvent.maxParticipants || 50,
      maxSpectators: newEvent.maxSpectators,
      participants: 0,
      status: 'upcoming',
      approved: isAdmin,
      submittedAt: new Date().toISOString(),
      submittedBy: currentUser?.email
    };
    
    setEvents([...events, eventToAdd]);
    setIsAddDialogOpen(false);
    
    if (isAdmin) {
      toast({
        title: "Мероприятие добавлено",
        description: `"${eventToAdd.title}" успешно добавлено в календарь`
      });
    } else {
      toast({
        title: "Отправлено на модерацию",
        description: `"${eventToAdd.title}" будет добавлено после проверки администратором`
      });
    }
    
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
    setCustomSport('');
    setShowCustomSportInput(false);
    setManualEventNumber('');
    setShowManualEventNumber(false);
  };
  
  const handleApproveEvent = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, approved: true } : e
    ));
    
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
            .event-card { background: white; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .event-info { margin: 10px 0; }
            .event-info strong { color: #2563eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Ваше мероприятие одобрено!</h1>
            </div>
            <div class="content">
              <p>Добрый день!</p>
              <p>Ваше мероприятие успешно прошло модерацию и добавлено в <strong>Единый календарный план м.о. Истра</strong>.</p>
              
              <div class="event-card">
                <h2 style="margin-top: 0; color: #2563eb;">${event.title}</h2>
                ${event.eventNumber ? `<div class="event-info"><strong>Номер:</strong> ${event.eventNumber}</div>` : ''}
                <div class="event-info"><strong>Дата:</strong> ${new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${event.time}</div>
                <div class="event-info"><strong>Место:</strong> ${event.location}</div>
                <div class="event-info"><strong>Организатор:</strong> ${event.organizer}</div>
                ${event.eventLevel ? `<div class="event-info"><strong>Статус:</strong> ${eventLevelNames[event.eventLevel]}</div>` : ''}
              </div>
              
              <p>Теперь участники могут регистрироваться на ваше мероприятие через сайт.</p>
              
              <p style="text-align: center;">
                <a href="${window.location.origin}" class="button">Посмотреть на сайте</a>
              </p>
              
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
    
    if (event.submittedBy) {
      try {
        const response = await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: event.submittedBy,
            subject: `✅ Мероприятие "${event.title}" одобрено - Единый календарный план`,
            html: emailHtml
          })
        });
        
        if (response.ok) {
          toast({
            title: "Мероприятие одобрено",
            description: `"${event.title}" добавлено в календарь. Email отправлен организатору.`
          });
        } else {
          toast({
            title: "Мероприятие одобрено",
            description: `"${event.title}" добавлено в календарь. Email не отправлен.`
          });
        }
      } catch (error) {
        toast({
          title: "Мероприятие одобрено",
          description: `"${event.title}" добавлено в календарь. Email не отправлен.`
        });
      }
    } else {
      toast({
        title: "Мероприятие одобрено",
        description: `"${event.title}" добавлено в календарь`
      });
    }
  };
  
  const handleRejectEvent = async (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    setEvents(events.filter(e => e.id !== eventId));
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-card { background: white; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .event-info { margin: 10px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Заявка на мероприятие отклонена</h1>
            </div>
            <div class="content">
              <p>Добрый день!</p>
              <p>К сожалению, ваша заявка на проведение мероприятия не прошла модерацию.</p>
              
              <div class="event-card">
                <h2 style="margin-top: 0; color: #dc2626;">${event.title}</h2>
                <div class="event-info"><strong>Дата:</strong> ${new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} в ${event.time}</div>
                <div class="event-info"><strong>Место:</strong> ${event.location}</div>
                <div class="event-info"><strong>Организатор:</strong> ${event.organizer}</div>
              </div>
              
              <p><strong>Возможные причины отклонения:</strong></p>
              <ul>
                <li>Неполная или некорректная информация о мероприятии</li>
                <li>Несоответствие календарному плану</li>
                <li>Конфликт по датам с другими событиями</li>
                <li>Недостаточная подготовка документации</li>
              </ul>
              
              <p>Вы можете уточнить детали и подать заявку повторно с учётом замечаний.</p>
              
              <p style="text-align: center;">
                <a href="${window.location.origin}" class="button">Подать заявку повторно</a>
              </p>
              
              <p>Для получения консультации свяжитесь с нами:</p>
              <p>📞 +7 (495) 994-85-55 (доб. 429)<br>
              📧 info@sportvokrugistra.ru</p>
              
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
    
    if (event.submittedBy) {
      try {
        await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: event.submittedBy,
            subject: `❌ Заявка на мероприятие "${event.title}" отклонена`,
            html: emailHtml
          })
        });
      } catch (error) {
        // Игнорируем ошибки отправки
      }
    }
    
    toast({
      title: "Мероприятие отклонено",
      description: `"${event.title}" было удалено из заявок`,
      variant: "destructive"
    });
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
  
  const handleSaveEdit = () => {
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
    
    const updatedEvent: Event = {
      ...editingEvent,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      eventType: eventType,
      eventLevel: newEvent.eventLevel,
      sport: newEvent.sport as SportType,
      description: newEvent.description || '',
      organizer: newEvent.organizer,
      maxParticipants: newEvent.maxParticipants || 50,
      maxSpectators: newEvent.maxSpectators,
      eventNumber: finalEventNumber
    };
    
    setEvents(events.map(e => e.id === editingEvent.id ? updatedEvent : e));
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
    
    toast({
      title: "Изменения сохранены",
      description: `Мероприятие "${updatedEvent.title}" обновлено`
    });
  };
  
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      setIsAdminDialogOpen(false);
      setAdminPassword('');
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
  
  const handleUserRegister = () => {
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
    
    if (users.find(u => u.email === registerForm.email)) {
      toast({
        title: "Ошибка",
        description: "Пользователь с таким email уже существует",
        variant: "destructive"
      });
      return;
    }
    
    const newUser = {
      email: registerForm.email,
      password: registerForm.password,
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
    
    setUsers([...users, newUser]);
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
  };
  
  const handleUserLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }
    
    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    
    if (!user) {
      toast({
        title: "Ошибка входа",
        description: "Неверный email или пароль",
        variant: "destructive"
      });
      return;
    }
    
    if (!user.approved) {
      toast({
        title: "Доступ запрещен",
        description: "Ваша регистрация ожидает одобрения администратором",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentUser({ email: user.email, name: user.name, phone: user.phone });
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
    setLoginForm({ email: '', password: '' });
    
    toast({
      title: "Вход выполнен",
      description: `Добро пожаловать, ${user.name}!`
    });
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
    if (!user) return;
    
    setUsers(users.map(u => u.email === email ? {...u, approved: true} : u));
    
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
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Регистрация одобрена!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${user.name}!</p>
              <p>Ваша регистрация на платформе <strong>Единый календарный план м.о. Истра</strong> успешно одобрена администратором.</p>
              <p>Теперь вы можете:</p>
              <ul>
                <li>Просматривать все спортивные мероприятия</li>
                <li>Регистрироваться на события</li>
                <li>Предлагать свои мероприятия</li>
              </ul>
              <p style="text-align: center;">
                <a href="${window.location.origin}" class="button">Войти на сайт</a>
              </p>
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
          to: email,
          subject: '✅ Ваша регистрация одобрена - Единый календарный план м.о. Истра',
          html: emailHtml
        })
      });
      
      if (response.ok) {
        toast({
          title: "Пользователь одобрен",
          description: `Email-уведомление отправлено на ${email}`
        });
      } else {
        toast({
          title: "Пользователь одобрен",
          description: "Email не отправлен - проверьте настройки SMTP"
        });
      }
    } catch (error) {
      toast({
        title: "Пользователь одобрен",
        description: "Email не отправлен - ошибка подключения"
      });
    }
  };
  
  const handleRejectUser = async (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user) return;
    
    setUsers(users.filter(u => u.email !== email));
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Регистрация отклонена</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${user.name}!</p>
              <p>К сожалению, ваша заявка на регистрацию в системе <strong>Единый календарный план м.о. Истра</strong> не прошла модерацию.</p>
              
              <p><strong>Возможные причины отклонения:</strong></p>
              <ul>
                <li>Неполные или некорректные персональные данные</li>
                <li>Несоответствие требованиям платформы</li>
                <li>Дублирование существующей учетной записи</li>
              </ul>
              
              <p>Вы можете подать заявку повторно с корректными данными.</p>
              
              <p style="text-align: center;">
                <a href="${window.location.origin}" class="button">Зарегистрироваться повторно</a>
              </p>
              
              <p>Для получения дополнительной информации свяжитесь с нами:</p>
              <p>📞 +7 (495) 994-85-55 (доб. 429)<br>
              📧 info@sportvokrugistra.ru</p>
              
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
      await fetch('https://functions.poehali.dev/380d99a9-f6a2-4057-b535-b0eeaf2e5574', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '❌ Регистрация отклонена - Единый календарный план м.о. Истра',
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
      const dayEvents = upcomingEvents.filter(e => e.date === dateStr);
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
            <Button variant="outline" onClick={handleUserLogout} className="gap-2">
              <Icon name="User" size={18} />
              {currentUser?.name}
              <Icon name="LogOut" size={16} className="ml-2" />
            </Button>
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
            <Button variant="outline" onClick={handleAdminLogout} className="gap-2">
              <Icon name="LogOut" size={18} />
              Выйти из режима администратора
            </Button>
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
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenAddDialog}>
                <Icon name="Plus" size={18} />
                {isAdmin ? 'Добавить мероприятие' : 'Предложить мероприятие'}
              </Button>
            </DialogTrigger>
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
                    <Label htmlFor="date">Дата *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
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
                <CardTitle className="text-sm font-medium opacity-90">Всего мероприятий</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{events.length}</div>
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
                  <div className="text-3xl font-bold">{upcomingEvents.length}</div>
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
                  <div className="text-3xl font-bold">{pastEvents.length}</div>
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
                    const totalParticipants = pastEvents.reduce((sum, event) => sum + (event.participants || 0), 0);
                    const eventsWithParticipants = pastEvents.filter(e => e.participants && e.participants > 0);
                    const avgParticipants = eventsWithParticipants.length > 0 
                      ? Math.round(totalParticipants / eventsWithParticipants.length) 
                      : 0;
                    const maxParticipants = Math.max(...pastEvents.map(e => e.participants || 0), 0);
                    const maxEvent = pastEvents.find(e => e.participants === maxParticipants);
                    
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
          <TabsList className={`grid w-full max-w-2xl mx-auto ${isAdmin ? 'grid-cols-5' : 'grid-cols-3'} mb-8`}>
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
                    {upcomingEvents.filter(e => e.date === selectedDate).map((event) => (
                      <Card key={event.id} className="hover:shadow-lg transition-all border-2 hover:border-primary">
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
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" size={18} className="text-secondary" />
                                    <strong>Место:</strong> {event.location}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="Building" size={18} className="text-muted-foreground" />
                                    <strong>Организатор:</strong> {event.organizer}
                                  </div>
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
                              {isAdmin && (
                                <div className="pt-4 border-t flex gap-2">
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
                    ))}
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
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, index) => (
                <Card 
                  key={event.id} 
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="default" className="bg-gradient-to-r from-primary to-secondary text-white">
                        <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                        {sportNames[event.sport]}
                      </Badge>
                      <Icon name="CalendarDays" size={20} className="text-muted-foreground" />
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
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={18} className="text-secondary" />
                              <strong>Место:</strong> {event.location}
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon name="Building" size={18} className="text-muted-foreground" />
                              <strong>Организатор:</strong> {event.organizer}
                            </div>
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
                        {isAdmin && (
                          <div className="pt-4 border-t flex gap-2">
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event, index) => (
                <Card 
                  key={event.id} 
                  className="hover:shadow-lg transition-all duration-300 border animate-fade-in opacity-90"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">
                        <Icon name={sportIcons[event.sport]} size={14} className="mr-1" />
                        {sportNames[event.sport]}
                      </Badge>
                      <Badge variant="outline">Завершено</Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={16} />
                        {new Date(event.date).toLocaleDateString('ru-RU')}
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
                            <div className="grid grid-cols-4 gap-2">
                              {event.media.map((item, i) => (
                                <div 
                                  key={i} 
                                  className="relative group cursor-pointer"
                                  onClick={() => {
                                    setSelectedEvent(event);
                                    setSelectedMediaIndex(i);
                                    setIsMediaViewerOpen(true);
                                  }}
                                >
                                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center hover:bg-muted/80 transition-colors">
                                    {item.type === 'image' ? (
                                      <Icon name="Image" size={24} className="text-muted-foreground" />
                                    ) : (
                                      <Icon name="Video" size={24} className="text-muted-foreground" />
                                    )}
                                  </div>
                                  {isAdmin && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const updatedMedia = event.media?.filter((_, index) => index !== i);
                                        setEvents(events.map(ev => ev.id === event.id ? {...ev, media: updatedMedia} : ev));
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
                        
                        {isAdmin && (
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
                          </div>
                        )}
                        
                        {isAdmin && (
                          <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <Icon name="ImagePlus" size={18} className="text-primary" />
                              Загрузить медиа
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
                        {isAdmin && (
                          <div className="pt-4 border-t flex gap-2">
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
              ))}
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="pending">
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
                            onClick={() => handleRejectEvent(event.id)}
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
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Icon name="Mail" size={14} />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Phone" size={14} />
                              {user.phone}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
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
                <span>info@sportvokrugistra.ru</span>
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
    </div>
  );
}