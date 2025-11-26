"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	RefreshCw,
	ShoppingBag,
	Truck,
	Wallet,
	MapPin,
	Store,
	ArrowUpRight,
	PackageSearch,
} from "lucide-react";

type Order = {
	id: string;
	orderNumber?: string;
	createdAt?: string;
	date?: string;
	customer?: { email?: string };
	customerId?: string;
	totalAmount?: number | string;
	paymentStatus?: string;
	deliveryStatus?: string;
};

type DeliveryMethod = "pickup" | "yandex" | "courier";

export function Dashboard() {
	const router = useRouter();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	// Local delivery preferences (for now just UI; you can wire to your API later)
	const [deliveryMethod, setDeliveryMethod] =
		useState<DeliveryMethod>("pickup");
	const [saveMessage, setSaveMessage] = useState("");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError("");
			try {
				const r = await fetch("/api/orders");
				if (!r.ok) {
					throw new Error("Failed to load orders");
				}
				const data = await r.json();
				setOrders(data ?? []);
			} catch (err) {
				console.error(err);
				setError("Не удалось загрузить ваши заказы");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const stats = useMemo(() => {
		if (!orders.length) {
			return [
				{
					label: "Всего заказов",
					value: 0,
					icon: ShoppingBag,
					hint: "Нет заказов",
				},
				{
					label: "Активные доставки",
					value: 0,
					icon: Truck,
					hint: "Нет активных доставок",
				},
				{
					label: "Всего потрачено",
					value: "₽0",
					icon: Wallet,
					hint: null,
				},
				{
					label: "Средний чек",
					value: "₽0",
					icon: PackageSearch,
					hint: null,
				},
			];
		}

		const totalOrders = orders.length;

		// Try to determine "active" deliveries based on deliveryStatus / paymentStatus
		const activeDeliveries = orders.filter((o) => {
			const status = (o.deliveryStatus || o.paymentStatus || "").toUpperCase();
			if (!status) return false;
			return !["DELIVERED", "CANCELED", "CANCELLED", "REFUNDED"].includes(
				status
			);
		}).length;

		const revenue = orders.reduce(
			(sum, o) => sum + Number(o.totalAmount ?? 0),
			0
		);

		const paidOrders = orders.filter((o) =>
			(o.paymentStatus || "").toLowerCase().includes("paid")
		);
		const avgCheck = paidOrders.length
			? Math.round(revenue / paidOrders.length)
			: 0;

		return [
			{
				label: "Всего заказов",
				value: totalOrders.toString(),
				icon: ShoppingBag,
				hint: null,
			},
			{
				label: "Активные доставки",
				value: activeDeliveries.toString(),
				icon: Truck,
				hint:
					activeDeliveries > 0 ? "Есть заказы в пути" : "Все заказы завершены",
			},
			{
				label: "Всего потрачено",
				value: `₽${revenue.toLocaleString("ru-RU")}`,
				icon: Wallet,
				hint: null,
			},
			{
				label: "Средний чек",
				value: `₽${avgCheck.toLocaleString("ru-RU")}`,
				icon: PackageSearch,
				hint: null,
			},
		];
	}, [orders]);

	const handleSavePreferences = () => {
		// TODO: later you can POST/PATCH to /api/account/preferences
		setSaveMessage("Настройки доставки сохранены (локально).");
		setTimeout(() => setSaveMessage(""), 3000);
	};

	const formatDate = (value?: string) => {
		if (!value) return "";
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return "";
		return d.toLocaleDateString("ru-RU");
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6'>
				{/* Header */}
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>Личный кабинет</h1>
						<p className='text-sm text-gray-600'>
							Отслеживайте заказы и управляйте доставкой
						</p>
					</div>
					<div className='flex items-center gap-2'>
						<button
							onClick={() => router.refresh()}
							className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
							title='Обновить'
						>
							<RefreshCw className='w-4 h-4' />
							Обновить
						</button>
					</div>
				</div>

				{error && (
					<div className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
						{error}
					</div>
				)}

				{/* Stats */}
				<section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					{stats.map((s) => (
						<div
							key={s.label}
							className='bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col gap-2'
						>
							<div className='flex items-center justify-between gap-2'>
								<p className='text-xs font-medium text-gray-500'>{s.label}</p>
								<s.icon className='w-4 h-4 text-gray-400' />
							</div>
							<p className='text-xl font-semibold text-gray-900'>{s.value}</p>
							{s.hint && (
								<div className='flex items-center gap-1 text-xs text-emerald-600'>
									<ArrowUpRight className='w-3 h-3' />
									<span>{s.hint}</span>
								</div>
							)}
						</div>
					))}
				</section>

				{/* Main layout: orders + delivery preferences */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 items-start'>
					{/* Orders list */}
					<section className='lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm'>
						<div className='flex items-center justify-between mb-3'>
							<h2 className='text-lg font-semibold text-gray-900'>
								Мои заказы
							</h2>
							<span className='text-xs text-gray-500'>
								{orders.length ? `Всего: ${orders.length}` : "Заказов пока нет"}
							</span>
						</div>

						{loading ? (
							<p className='text-sm text-gray-600'>Загрузка...</p>
						) : orders.length === 0 ? (
							<div className='py-6 text-sm text-gray-500'>
								У вас пока нет заказов. Как только вы что-то закажете, здесь
								появится история заказов.
							</div>
						) : (
							<div className='divide-y divide-gray-100'>
								{orders.slice(0, 8).map((o) => {
									const created =
										o.createdAt || o.date || new Date().toISOString();
									const payment = (o.paymentStatus || "").toLowerCase();
									const delivery = (o.deliveryStatus || "").toLowerCase();

									let statusLabel = o.deliveryStatus || o.paymentStatus || "—";
									let statusColor =
										"bg-gray-100 text-gray-700 border border-gray-200";

									if (payment.includes("paid")) {
										statusColor =
											"bg-emerald-50 text-emerald-700 border border-emerald-100";
									}
									if (delivery.includes("delivered")) {
										statusLabel = "Доставлен";
										statusColor =
											"bg-emerald-50 text-emerald-700 border border-emerald-100";
									} else if (delivery.includes("shipped")) {
										statusLabel = "В пути";
										statusColor =
											"bg-blue-50 text-blue-700 border border-blue-100";
									} else if (
										delivery.includes("canceled") ||
										delivery.includes("cancelled")
									) {
										statusLabel = "Отменён";
										statusColor =
											"bg-red-50 text-red-700 border border-red-100";
									}

									return (
										<div
											key={o.id}
											className='py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm'
										>
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-2 mb-1'>
													<p className='font-medium text-gray-900 truncate'>
														Заказ № {o.orderNumber || o.id}
													</p>
												</div>
												<p className='text-xs text-gray-500'>
													{formatDate(created)} ·{" "}
													{o.customer?.email || o.customerId || "Гость"}
												</p>
											</div>
											<div className='flex flex-col sm:items-end gap-1'>
												<p className='text-sm font-semibold text-gray-900'>
													{Number(o.totalAmount ?? 0).toLocaleString("ru-RU")} ₽
												</p>
												<div
													className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}
												>
													{statusLabel}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}

						{orders.length > 8 && (
							<button className='mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline'>
								Показать все заказы
							</button>
						)}
					</section>

					{/* Delivery preferences */}
					<section className='bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4'>
						<h2 className='text-lg font-semibold text-gray-900'>
							Предпочтения доставки
						</h2>

						{/* Store pickup info */}
						<div className='rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-xs leading-relaxed'>
							<div className='flex items-start gap-2'>
								<div className='mt-0.5'>
									<Store className='w-4 h-4 text-gray-500' />
								</div>
								<div>
									<p className='font-semibold text-gray-900 mb-1'>
										Самовывоз из магазина
									</p>
									<p className='text-gray-700'>
										Вы можете забрать свой заказ в нашем магазине:
									</p>
									<div className='mt-2 text-gray-800 space-y-0.5'>
										<p>г. Иваново</p>
										<p>ТРЦ «Серебряный город», 3 этаж, магазин №5</p>
									</div>
								</div>
							</div>
						</div>

						{/* Delivery method radio buttons */}
						<div className='space-y-2 text-sm'>
							<p className='text-xs font-medium text-gray-600 mb-1'>
								Способ доставки по умолчанию
							</p>

							<label className='flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition text-xs sm:text-sm'>
								<input
									type='radio'
									name='deliveryMethod'
									className='mt-0.5'
									checked={deliveryMethod === "pickup"}
									onChange={() => setDeliveryMethod("pickup")}
								/>
								<div>
									<div className='flex items-center gap-1'>
										<Store className='w-4 h-4 text-gray-500' />
										<span className='font-semibold text-gray-900'>
											Самовывоз
										</span>
									</div>
									<p className='text-gray-600 mt-0.5'>
										Забрать заказ в магазине в ТРЦ «Серебряный город».
									</p>
								</div>
							</label>

							<label className='flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition text-xs sm:text-sm'>
								<input
									type='radio'
									name='deliveryMethod'
									className='mt-0.5'
									checked={deliveryMethod === "yandex"}
									onChange={() => setDeliveryMethod("yandex")}
								/>
								<div>
									<div className='flex items-center gap-1'>
										<MapPin className='w-4 h-4 text-gray-500' />
										<span className='font-semibold text-gray-900'>
											Пункт выдачи Яндекс.Доставки
										</span>
									</div>
									<p className='text-gray-600 mt-0.5'>
										Выберите удобный ПВЗ на карте при оформлении заказа.
									</p>
								</div>
							</label>

							<label className='flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 transition text-xs sm:text-sm'>
								<input
									type='radio'
									name='deliveryMethod'
									className='mt-0.5'
									checked={deliveryMethod === "courier"}
									onChange={() => setDeliveryMethod("courier")}
								/>
								<div>
									<div className='flex items-center gap-1'>
										<Truck className='w-4 h-4 text-gray-500' />
										<span className='font-semibold text-gray-900'>
											Доставка курьером
										</span>
									</div>
									<p className='text-gray-600 mt-0.5'>
										Доставка по указанному адресу курьером.
									</p>
								</div>
							</label>
						</div>

						<button
							type='button'
							onClick={handleSavePreferences}
							className='w-full inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition'
						>
							Сохранить настройки
						</button>

						{saveMessage && (
							<p className='text-xs text-emerald-600'>{saveMessage}</p>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}
