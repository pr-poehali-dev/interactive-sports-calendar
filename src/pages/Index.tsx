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
import Icon from '@/components/ui/icon';

type SportType = 'all' | 'football' | 'basketball' | 'running' | 'volleyball' | 'tennis';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  sport: SportType;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'past';
  description: string;
  organizer: string;
  result?: string;
}

const initialEvents: Event[] = [
  {
    id: 1,
    title: 'Городской марафон "Весенний забег"',
    date: '2025-11-15',
    time: '09:00',
    location: 'Центральный парк',
    sport: 'running',
    participants: 124,
    maxParticipants: 200,
    status: 'upcoming',
    description: 'Массовый забег на 10км среди любителей. Призы победителям в каждой возрастной категории.',
    organizer: 'Спортивный клуб "Олимп"'
  },
  {
    id: 6,
    title: 'Народный трейл',
    date: '2025-11-04',
    time: '10:00',
    location: 'Лесопарк',
    sport: 'running',
    participants: 45,
    maxParticipants: 80,
    status: 'upcoming',
    description: 'Трейловый забег по пересечённой местности на дистанцию 15 км. Подходит для любителей бега на природе.',
    organizer: 'Беговой клуб "Трейл"'
  },
  {
    id: 2,
    title: 'Турнир по футболу 5х5',
    date: '2025-11-08',
    time: '14:00',
    location: 'Стадион "Динамо"',
    sport: 'football',
    participants: 40,
    maxParticipants: 48,
    status: 'upcoming',
    description: 'Любительский турнир среди команд города. Формат: групповой этап + плей-офф.',
    organizer: 'Федерация футбола'
  },
  {
    id: 3,
    title: 'Баскетбольная лига: Финал',
    date: '2025-11-20',
    time: '18:00',
    location: 'Дворец спорта',
    sport: 'basketball',
    participants: 89,
    maxParticipants: 100,
    status: 'upcoming',
    description: 'Финальная игра городской любительской баскетбольной лиги.',
    organizer: 'Баскетбольная федерация'
  },
  {
    id: 4,
    title: 'Открытый турнир по волейболу',
    date: '2025-10-15',
    time: '10:00',
    location: 'Спорткомплекс "Победа"',
    sport: 'volleyball',
    participants: 56,
    maxParticipants: 60,
    status: 'past',
    description: 'Командный турнир среди любителей.',
    organizer: 'Волейбольный клуб',
    result: '1 место: Команда "Акула", 2 место: "Динамо", 3 место: "Спартак"'
  },
  {
    id: 5,
    title: 'Теннисный турнир "Осень 2025"',
    date: '2025-10-22',
    time: '11:00',
    location: 'Теннисные корты "Звезда"',
    sport: 'tennis',
    participants: 32,
    maxParticipants: 32,
    status: 'past',
    description: 'Индивидуальный турнир по теннису.',
    organizer: 'Теннисный клуб "Звезда"',
    result: 'Победитель: Иванов А.П. Финалист: Петров С.М.'
  }
];

const sportIcons: Record<SportType, string> = {
  all: 'Trophy',
  football: 'Circle',
  basketball: 'CircleDot',
  running: 'Zap',
  volleyball: 'Disc',
  tennis: 'Target'
};

const sportNames: Record<SportType, string> = {
  all: 'Все виды',
  football: 'Футбол',
  basketball: 'Баскетбол',
  running: 'Бег',
  volleyball: 'Волейбол',
  tennis: 'Теннис'
};

export default function Index() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedSport, setSelectedSport] = useState<SportType>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const filteredEvents = events.filter(event => 
    selectedSport === 'all' ? true : event.sport === selectedSport
  );

  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');
  const pastEvents = filteredEvents.filter(e => e.status === 'past');

  const handleRegister = (eventId: number) => {
    setRegisteredEvents([...registeredEvents, eventId]);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.organizer) {
      return;
    }
    
    const eventToAdd: Event = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      sport: newEvent.sport as SportType,
      description: newEvent.description || '',
      organizer: newEvent.organizer,
      maxParticipants: newEvent.maxParticipants || 50,
      participants: 0,
      status: 'upcoming'
    };
    
    setEvents([...events, eventToAdd]);
    setIsAddDialogOpen(false);
    setNewEvent({
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Trophy" size={48} className="text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Спортивный календарь
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Физкультурные и спортивные мероприятия вашего города
          </p>
        </header>

        <div className="mb-8 flex flex-wrap gap-4 justify-center animate-slide-up">
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
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Добавить мероприятие
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новое спортивное мероприятие</DialogTitle>
                <DialogDescription>
                  Заполните информацию о мероприятии
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
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder="Например: Центральный парк"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sport">Вид спорта *</Label>
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
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Макс. участников</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent({...newEvent, maxParticipants: parseInt(e.target.value) || 50})}
                      min="1"
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
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddEvent}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="calendar" className="animate-scale-in">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
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
          </TabsList>

          <TabsContent value="calendar">
            <div className="max-w-4xl mx-auto">
              <Card className="mb-6 border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => changeMonth(-1)}
                      className="hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon name="ChevronLeft" size={20} />
                    </Button>
                    <CardTitle className="text-2xl capitalize">{monthName}</CardTitle>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => changeMonth(1)}
                      className="hover:bg-primary hover:text-white transition-colors"
                    >
                      <Icon name="ChevronRight" size={20} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                      <div key={day} className="text-center font-bold text-sm text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    {calendarData.map((day, index) => (
                      <button
                        key={index}
                        disabled={day.date === 0}
                        onClick={() => day.date > 0 && setSelectedDate(day.date > 0 ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}` : null)}
                        className={`
                          aspect-square p-2 rounded-lg text-center transition-all duration-200
                          ${day.date === 0 ? 'invisible' : ''}
                          ${day.isToday ? 'ring-2 ring-accent font-bold' : ''}
                          ${day.hasEvents ? 'bg-gradient-to-br from-primary/20 to-secondary/20 font-semibold hover:from-primary/30 hover:to-secondary/30' : 'hover:bg-muted'}
                          ${selectedDate === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}` ? 'bg-primary text-white hover:bg-primary' : ''}
                        `}
                      >
                        <div className="text-sm">{day.date || ''}</div>
                        {day.hasEvents && (
                          <div className="flex gap-0.5 justify-center mt-1">
                            {day.events.slice(0, 3).map((event, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-primary" />
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
                                  <div className="flex items-center gap-2">
                                    <Icon name="Calendar" size={18} className="text-primary" />
                                    <strong>Дата:</strong> {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="MapPin" size={18} className="text-secondary" />
                                    <strong>Место:</strong> {event.location}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Icon name="Users" size={18} className="text-accent" />
                                    <strong>Участники:</strong> {event.participants} из {event.maxParticipants}
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
                              <div className="pt-4">
                                {registeredEvents.includes(event.id) ? (
                                  <Button disabled className="w-full" variant="outline">
                                    <Icon name="CheckCircle" size={18} className="mr-2" />
                                    Вы зарегистрированы
                                  </Button>
                                ) : (
                                  <Button 
                                    className="w-full bg-gradient-to-r from-primary to-secondary"
                                    onClick={() => handleRegister(event.id)}
                                    disabled={event.participants >= event.maxParticipants}
                                  >
                                    <Icon name="UserPlus" size={18} className="mr-2" />
                                    Зарегистрироваться
                                  </Button>
                                )}
                              </div>
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
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Участников</span>
                        <span className="font-semibold">{event.participants}/{event.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                    
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
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={18} className="text-primary" />
                              <strong>Дата:</strong> {new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={18} className="text-secondary" />
                              <strong>Место:</strong> {event.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Icon name="Users" size={18} className="text-accent" />
                              <strong>Участники:</strong> {event.participants} из {event.maxParticipants}
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
                        <div className="pt-4">
                          {registeredEvents.includes(event.id) ? (
                            <Button disabled className="w-full" variant="outline">
                              <Icon name="CheckCircle" size={18} className="mr-2" />
                              Вы зарегистрированы
                            </Button>
                          ) : (
                            <Button 
                              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                              onClick={() => handleRegister(event.id)}
                              disabled={event.participants >= event.maxParticipants}
                            >
                              <Icon name="UserPlus" size={18} className="mr-2" />
                              Зарегистрироваться
                            </Button>
                          )}
                        </div>
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
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl flex items-center gap-2">
                            <Icon name={sportIcons[event.sport]} size={24} className="text-primary" />
                            {event.title}
                          </DialogTitle>
                          <DialogDescription className="text-base space-y-3 pt-4">
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
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
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
                <span>info@sportcalendar.ru</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Phone" size={20} className="text-accent" />
                <span>+7 (495) 123-45-67</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="MapPin" size={20} className="text-primary" />
                <span>г. Москва, ул. Спортивная, д. 1</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}