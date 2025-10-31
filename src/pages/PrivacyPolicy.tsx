import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Политика конфиденциальности</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                пользователей реестра спортивных мероприятий (далее — «Реестр»).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Собираемые данные</h2>
              <p className="mb-2">Мы собираем следующие категории персональных данных:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Для физических лиц: ФИО, email, телефон, дата рождения, паспортные данные</li>
                <li>Для юридических лиц: название организации, ИНН, юридический адрес, данные контактного лица</li>
                <li>Техническая информация: IP-адрес, тип браузера, действия на сайте</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Цели обработки данных</h2>
              <p className="mb-2">Персональные данные используются для:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Регистрации и авторизации пользователей</li>
                <li>Организации и проведения спортивных мероприятий</li>
                <li>Ведения реестра физкультурных и спортивных мероприятий</li>
                <li>Связи с пользователями по вопросам мероприятий</li>
                <li>Улучшения качества сервиса</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Защита данных</h2>
              <p>
                Мы принимаем необходимые организационные и технические меры для защиты персональных данных 
                от несанкционированного доступа, изменения, раскрытия или уничтожения. Доступ к данным имеют 
                только уполномоченные сотрудники.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Передача данных третьим лицам</h2>
              <p>
                Персональные данные не передаются третьим лицам, за исключением случаев, предусмотренных 
                законодательством Российской Федерации, или с вашего явного согласия.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Права пользователей</h2>
              <p className="mb-2">Вы имеете право:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Получать информацию об обработке ваших персональных данных</li>
                <li>Требовать уточнения, блокирования или удаления данных</li>
                <li>Отозвать согласие на обработку персональных данных</li>
                <li>Обжаловать действия оператора в Роскомнадзоре</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Хранение данных</h2>
              <p>
                Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, 
                но не более 5 лет с момента последнего взаимодействия с пользователем, если иное не 
                предусмотрено законодательством.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Файлы cookie</h2>
              <p>
                Реестр использует файлы cookie для улучшения работы сервиса и анализа посещаемости. 
                Вы можете отключить cookie в настройках браузера, но это может ограничить функциональность сайта.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Изменения в политике</h2>
              <p>
                Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                Актуальная версия всегда доступна на данной странице.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Контакты</h2>
              <p>
                По вопросам обработки персональных данных обращайтесь по адресу: <a href="mailto:privacy@example.com" className="text-primary hover:underline">privacy@example.com</a>
              </p>
            </section>

            <div className="pt-6 border-t mt-6 text-sm text-gray-500">
              <p>Дата последнего обновления: 31 октября 2025 г.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
