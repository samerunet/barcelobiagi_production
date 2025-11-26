export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Оплата</h1>
      <div className="space-y-3 text-gray-700">
        <p>Мы предлагаем несколько удобных способов оплаты вашего заказа.</p>
        <p>На сайте доступны:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Оплата банковской картой любых российских банков</li>
          <li>Сервис «Долями» — оплата частями</li>
          <li>Сплит — возможность разделить платеж на несколько частей</li>
        </ul>
      </div>
    </div>
  );
}
