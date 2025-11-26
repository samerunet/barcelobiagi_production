'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export function Terms() {
  const { language, t } = useLanguage();

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
              <FileText size={32} className="text-accent-brown" />
            </div>
            <div>
              <h1>{t('Условия использования', 'Terms of Use')}</h1>
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
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">1. Общие условия</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Настоящие Условия использования регулируют отношения между интернет-магазином Barcelo Biagi (далее - «Продавец») и покупателями (далее - «Покупатель»).
                </p>
                <p className="text-text-dark leading-relaxed">
                  Совершая заказ на сайте, Покупатель соглашается с данными Условиями в полном объеме.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">2. Оформление заказа</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Для оформления заказа Покупатель должен:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Выбрать товар и добавить его в корзину</li>
                  <li>Заполнить форму заказа с контактными данными</li>
                  <li>Выбрать способ доставки и оплаты</li>
                  <li>Подтвердить заказ</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  Заказ считается принятым после получения Покупателем электронного подтверждения.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">3. Цены и оплата</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Все цены на сайте указаны в рублях РФ и включают НДС.
                </p>
                <p className="text-text-dark leading-relaxed mb-4">
                  Доступные способы оплаты:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Банковской картой онлайн</li>
                  <li>Наличными при получении</li>
                  <li>Картой при получении</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">4. Доставка</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Продавец осуществляет доставку товаров следующими способами:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Курьерская доставка по г. Иваново - 300 ₽ (бесплатно при заказе от 10 000 ₽)</li>
                  <li>Самовывоз из магазина в ТРЦ «Серебряный город» - бесплатно</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  Срок доставки курьером: 1-2 рабочих дня. Готовность заказа к самовывозу: в течение 2 часов.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">5. Возврат и обмен</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  Покупатель вправе вернуть или обменять товар надлежащего качества в течение 14 дней с момента получения.
                </p>
                <p className="text-text-dark leading-relaxed mb-4">
                  Условия возврата:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Товар не был в употреблении</li>
                  <li>Сохранены товарный вид, ярлыки и упаковка</li>
                  <li>Имеется чек или иной документ, подтверждающий оплату</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  Возврат денежных средств осуществляется в течение 10 рабочих дней.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">6. Гарантия качества</h2>
                <p className="text-text-dark leading-relaxed">
                  Вся продукция является оригинальной и имеет гарантию производителя. Гарантийный срок на обувь - 30 дней с момента покупки при условии соблюдения правил эксплуатации.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">7. Ответственность</h2>
                <p className="text-text-dark leading-relaxed">
                  Продавец не несет ответственности за ущерб, причиненный Покупателю вследствие ненадлежащего использования товара. Покупатель несет ответственность за достоверность предоставленной при оформлении заказа информации.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">8. Изменение условий</h2>
                <p className="text-text-dark leading-relaxed">
                  Продавец оставляет за собой право вносить изменения в настоящие Условия использования. Актуальная версия всегда доступна на сайте.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">9. Контакты</h2>
                <p className="text-text-dark leading-relaxed">
                  Франшиза Barcelo Biagi в г. Иваново<br />
                  Адрес: г. Иваново, ул. 8 Марта, 32, ТРЦ «Серебряный город»<br />
                  Телефон: +7 (4932) 12-34-56<br />
                  Email: ivanovo@barcelobiagi.ru<br />
                  Режим работы: ежедневно с 10:00 до 22:00
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">1. General Terms</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  These Terms of Use govern the relationship between the Barcelo Biagi online store (hereinafter - "Seller") and buyers (hereinafter - "Buyer").
                </p>
                <p className="text-text-dark leading-relaxed">
                  By placing an order on the website, the Buyer agrees to these Terms in full.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">2. Placing an Order</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  To place an order, the Buyer must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Select a product and add it to the cart</li>
                  <li>Fill out the order form with contact details</li>
                  <li>Choose delivery and payment method</li>
                  <li>Confirm the order</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  An order is considered accepted after the Buyer receives electronic confirmation.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">3. Prices and Payment</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  All prices on the website are in Russian rubles and include VAT.
                </p>
                <p className="text-text-dark leading-relaxed mb-4">
                  Available payment methods:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Online payment by bank card</li>
                  <li>Cash on delivery</li>
                  <li>Card on delivery</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">4. Delivery</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  The Seller delivers goods by the following methods:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Courier delivery in Ivanovo - 300 ₽ (free for orders over 10,000 ₽)</li>
                  <li>Pickup from the store at Serebryany Gorod Mall - free</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  Courier delivery time: 1-2 business days. Pickup readiness: within 2 hours.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">5. Returns and Exchanges</h2>
                <p className="text-text-dark leading-relaxed mb-4">
                  The Buyer has the right to return or exchange goods of proper quality within 14 days from receipt.
                </p>
                <p className="text-text-dark leading-relaxed mb-4">
                  Return conditions:
                </p>
                <ul className="list-disc list-inside space-y-2 text-text-dark ml-4">
                  <li>Product has not been used</li>
                  <li>Appearance, labels, and packaging are preserved</li>
                  <li>Receipt or other payment confirmation is available</li>
                </ul>
                <p className="text-text-dark leading-relaxed mt-4">
                  Refund is processed within 10 business days.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">6. Quality Guarantee</h2>
                <p className="text-text-dark leading-relaxed">
                  All products are original and come with manufacturer's warranty. Warranty period for footwear is 30 days from purchase, subject to proper use.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">7. Liability</h2>
                <p className="text-text-dark leading-relaxed">
                  The Seller is not liable for damage caused to the Buyer due to improper use of the product. The Buyer is responsible for the accuracy of information provided when placing an order.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">8. Changes to Terms</h2>
                <p className="text-text-dark leading-relaxed">
                  The Seller reserves the right to make changes to these Terms of Use. The current version is always available on the website.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-charcoal">9. Contact</h2>
                <p className="text-text-dark leading-relaxed">
                  Barcelo Biagi Franchise in Ivanovo<br />
                  Address: Ivanovo, 8 Marta St., 32, Serebryany Gorod Mall<br />
                  Phone: +7 (4932) 12-34-56<br />
                  Email: ivanovo@barcelobiagi.ru<br />
                  Working hours: daily from 10:00 to 22:00
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
    </div>
  );
}
