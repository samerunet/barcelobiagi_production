'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Settings } from 'lucide-react';
import { CookieSettingsModal, CookieSettings } from '../components/CookieSettingsModal';

export function Privacy() {
  const { language, t } = useLanguage();
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  const handleSaveCookieSettings = (settings: CookieSettings) => {
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    localStorage.setItem('cookieConsent', 'custom');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-accent-brown hover:text-accent-brown-dark mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            {t('Вернуться в магазин', 'Back to Store')}
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-accent-brown-light rounded-2xl flex items-center justify-center">
              <Shield size={32} className="text-accent-brown" />
            </div>
            <div>
              <h1>{t('Политика конфиденциальности', 'Privacy Policy')}</h1>
              <p className="text-text-medium mt-1">
                {t('Обновлено: 15 января 2025', 'Updated: January 15, 2025')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          
          {language === 'ru' ? (
            <>
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">1. Общие положения</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Настоящая Политика конфиденциальности регулирует порядок обработки и защиты персональных данных пользователей интернет-магазина Barcelo Biagi (г. Иваново, ТРЦ «Серебряный город»).
                </p>
                <p className="text-text-dark leading-relaxed">
                  Используя наш сайт и совершая покупки, вы соглашаетесь с условиями данной Политики конфиденциальности.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">2. Сбор персональных данных</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Мы собираем следующие персональные данные:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Фамилия, имя, отчество</li>
                  <li>Адрес электронной почты</li>
                  <li>Номер телефона</li>
                  <li>Адрес доставки</li>
                  <li>История заказов и предпочтения</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">3. Использование данных</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Собранные данные используются для:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Обработки и выполнения заказов</li>
                  <li>Связи с клиентами по вопросам заказов</li>
                  <li>Улучшения качества обслуживания</li>
                  <li>Информирования о новинках и специальных предложениях (с вашего согласия)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">4. Защита данных</h2>
                <p className="text-text-dark leading-relaxed">
                  Мы применяем современные технологии защиты данных и используем протокол HTTPS для безопасной передачи информации. Доступ к персональным данным имеют только уполномоченные сотрудники.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">5. Передача данных третьим лицам</h2>
                <p className="text-text-dark leading-relaxed">
                  Мы не передаем ваши персональные данные третьим лицам, за исключением случаев, необходимых для выполнения заказа (служба доставки, платежная система) или по требованию законодательства.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">6. Cookies</h2>
                <p className="text-text-dark leading-relaxed">
                  Наш сайт использует файлы cookies для улучшения работы сервиса и анализа посещаемости. Вы можете отключить cookies в настройках браузера, однако это может ограничить функциональность сайта.
                </p>
                <button
                  className="inline-flex items-center gap-2 text-accent-brown hover:text-accent-brown-dark transition-colors"
                  onClick={() => setCookieModalOpen(true)}
                >
                  <Settings size={20} />
                  Настройки cookies
                </button>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">7. Ваши права</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Вы имеете право:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Получать информацию о ваших персональных данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">8. Контакты</h2>
                <p className="text-text-dark leading-relaxed">
                  По вопросам обработки персональных данных обращайтесь:<br />
                  Email: privacy@barcelobiagi.ru<br />
                  Телефон: +7 (4932) 12-34-56<br />
                  Адрес: г. Иваново, ул. 8 Марта, 32, ТРЦ «Серебряный город»
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">1. General Provisions</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  This Privacy Policy governs the processing and protection of personal data of users of the Barcelo Biagi online store (Ivanovo, Serebryany Gorod Mall).
                </p>
                <p className="text-text-dark leading-relaxed">
                  By using our website and making purchases, you agree to the terms of this Privacy Policy.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">2. Collection of Personal Data</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  We collect the following personal data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Delivery address</li>
                  <li>Order history and preferences</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">3. Use of Data</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Collected data is used for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Processing and fulfilling orders</li>
                  <li>Communicating with customers regarding orders</li>
                  <li>Improving service quality</li>
                  <li>Notifying about new arrivals and special offers (with your consent)</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">4. Data Protection</h2>
                <p className="text-text-dark leading-relaxed">
                  We employ modern data protection technologies and use HTTPS protocol for secure information transmission. Only authorized employees have access to personal data.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">5. Data Transfer to Third Parties</h2>
                <p className="text-text-dark leading-relaxed">
                  We do not transfer your personal data to third parties, except in cases necessary for order fulfillment (delivery service, payment system) or as required by law.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">6. Cookies</h2>
                <p className="text-text-dark leading-relaxed">
                  Our website uses cookies to improve service performance and analyze traffic. You can disable cookies in your browser settings, but this may limit website functionality.
                </p>
                <button
                  className="inline-flex items-center gap-2 text-accent-brown hover:text-accent-brown-dark transition-colors"
                  onClick={() => setCookieModalOpen(true)}
                >
                  <Settings size={20} />
                  Cookie Settings
                </button>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">7. Your Rights</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Obtain information about your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">8. Contact</h2>
                <p className="text-text-dark leading-relaxed">
                  For questions regarding personal data processing, please contact:<br />
                  Email: privacy@barcelobiagi.ru<br />
                  Phone: +7 (4932) 12-34-56<br />
                  Address: Ivanovo, 8 Marta St., 32, Serebryany Gorod Mall
                </p>
              </section>
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-accent-brown hover:bg-accent-brown-dark text-white rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            {t('Вернуться в магазин', 'Back to Store')}
          </Link>
        </div>
      </div>
      <CookieSettingsModal
        isOpen={cookieModalOpen}
        onClose={() => setCookieModalOpen(false)}
        onSave={handleSaveCookieSettings}
      />
    </div>
  );
}
