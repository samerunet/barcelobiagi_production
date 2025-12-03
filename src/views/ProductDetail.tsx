"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, Truck, RefreshCw, MapPin } from "lucide-react";
import { toast } from "sonner";

import { mapApiProduct } from "@/lib/productMapper";
import { resolveImageUrl } from "@/lib/images";
import { Product } from "@/types";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useFavorites } from "@/context/FavoritesContext";

export function ProductDetail() {
	const params = useParams();
	const idParam =
		params && typeof params === "object"
			? (params as Record<string, string | string[]>).id
			: undefined;
	const id = Array.isArray(idParam) ? idParam[0] : idParam;

	const { language, t } = useLanguage();
	const { addToCart } = useCart();
	const navigate = useNavigate();
	const { toggleFavorite, isFavorite } = useFavorites();

	const [product, setProduct] = useState<Product | null>(null);
	const [related, setRelated] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [fav, setFav] = useState(false);
	const [selectedImage, setSelectedImage] = useState(0);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [zoomOpen, setZoomOpen] = useState(false);
	const [selectedPickupPoint, setSelectedPickupPoint] = useState<any | null>(
		null
	);

	useEffect(() => {
		const fetchProduct = async () => {
			setLoading(true);
			setLoadError(null);
			if (!id) return;
			try {
				const res = await fetch(`/api/products/${id}`);
				if (!res.ok) {
					setLoadError(`Status ${res.status}`);
					return;
				}
				const data = await res.json();
				console.info("[ProductDetail] loaded product", data);
				const mapped = mapApiProduct(data);
				setProduct(mapped);

				const relRes = await fetch(
					`/api/products?category=${
						data.category?.slug ?? data.categoryId ?? ""
					}&take=4`
				);
				if (relRes.ok) {
					const relData = await relRes.json();
					console.info("[ProductDetail] related products", relData);
					setRelated(
						relData.map(mapApiProduct).filter((p: Product) => p.id !== data.id)
					);
				}
			} catch (error) {
				console.error("Failed to load product", error);
				setLoadError("network");
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [id]);

	useEffect(() => {
		if (product) {
			setFav(isFavorite(product.id));
		}
	}, [product, isFavorite]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<div className='w-10 h-10 border-4 border-border border-t-black rounded-full animate-spin' />
			</div>
		);
	}

	if (!product) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-white'>
				<div className='text-center'>
					<h2 className='mb-4'>{t("Товар не найден", "Product not found")}</h2>
					{loadError && (
						<p className='text-sm text-text-light mb-4'>({loadError})</p>
					)}
					<Button onClick={() => navigate("/")}>
						{t("Вернуться на главную", "Return to home")}
					</Button>
				</div>
			</div>
		);
	}

	const name = language === "ru" ? product.name_ru : product.name_en;
	const description =
		language === "ru" ? product.description_ru : product.description_en;
	const material =
		language === "ru" ? product.material_ru : product.material_en;
	const color = language === "ru" ? product.color_ru : product.color_en;
	const categoryName =
		typeof product.category === "string"
			? product.category
			: (product as any)?.category?.name || "";

  const rawSizes =
    (product.sizes && product.sizes.length > 0
      ? product.sizes
      : (product.variants ?? []).map((variant) => ({
          size: (variant as any).size || variant.label,
          stock: variant.stock != null ? Number(variant.stock) : 0,
			  }))) ?? [];

	const parsedSizes = rawSizes
		.filter((s) => s.size)
		.map((s) => ({ size: String(s.size), stock: Number(s.stock ?? 0) }));

	const uniqueSortedSizes =
		parsedSizes.length > 0
			? Array.from(new Set(parsedSizes.map((s) => s.size))).sort(
					(a, b) => Number(a) - Number(b)
			  )
			: (() => {
					const isWomenCategory =
						(categoryName && categoryName.toLowerCase().includes("жен")) ||
						product.category?.toLowerCase?.().includes("women") ||
						product.category?.toLowerCase?.().includes("жен");
					return isWomenCategory
						? Array.from({ length: 8 }, (_, i) => String(35 + i)) // 35-42
						: Array.from({ length: 10 }, (_, i) => String(39 + i)); // 39-48
			  })();

  const sizes = uniqueSortedSizes.map((size) => {
    const match = parsedSizes.find((s) => s.size === size);
    const stock = match?.stock ?? 0;
    return { size, stock, available: stock > 0 };
  });
  const isAccessory =
    categoryName?.toLowerCase().includes('акс') ||
    categoryName?.toLowerCase().includes('access');
  const showSizes = sizes.length > 0 && !isAccessory;

	const images =
		product.images && product.images.length ? product.images : [""];

	const variantTotalStock = sizes.reduce((sum, s) => sum + (s.stock ?? 0), 0);
	const effectiveStock =
		sizes.length && variantTotalStock > 0
			? variantTotalStock
			: product.stock_total;
	const isOutOfStock = effectiveStock === 0;
	const isLowStock =
		effectiveStock > 0 && effectiveStock <= product.stock_low_threshold;
	const hasDiscount = product.old_price && product.old_price > product.price;
	const discountPercent = hasDiscount
		? Math.round(
				((product.old_price! - product.price) / product.old_price!) * 100
		  )
		: 0;

	const relatedProducts = related.slice(0, 4);

	const handleAddToCart = () => {
		if (!selectedSize) {
			toast.error(t("Пожалуйста, выберите размер", "Please select a size"));
			return;
		}
		addToCart(product, selectedSize, 1);
		toast.success(t("Товар добавлен в корзину", "Product added to cart"));
	};

	return (
		<div className='min-h-screen bg-white'>
			{/* Top border + back */}
			<div className='border-b border-border'>
				<div className='container mx-auto px-4 py-4 flex items-center justify-between gap-3'>
					<button
						onClick={() => navigate(-1)}
						className='flex items-center gap-2 text-sm hover:gap-3 transition-all text-text-dark'
					>
						<ChevronLeft size={16} />
						{t("Назад", "Back")}
					</button>
				</div>
			</div>

			<div className='container mx-auto px-4 py-10 lg:py-12'>
				{/* Breadcrumbs */}
				<div className='text-xs text-text-light mb-6'>
					{t("Главная", "Home")} / {t("Обувь", "Shoes")} /{" "}
					<span className='text-text-dark'>{name}</span>
				</div>

				{/* Main two-column layout */}
					<div className='grid lg:grid-cols-2 gap-12 lg:gap-18 mb-16'>
						{/* LEFT: images */}
						<div className='space-y-6 lg:pr-10'>
							{/* Main image */}
							<div
								className='group relative aspect-[4/5] w-full bg-[#f7f7f7] border border-gray-200 rounded-2xl overflow-hidden cursor-zoom-in'
								onClick={() => setZoomOpen(true)}
							>
							<ImageWithFallback
								src={resolveImageUrl(images[selectedImage])}
								alt={name}
								className='w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 bg-white'
							/>
						</div>

						{/* Thumbnails */}
						{images.length > 1 && (
							<div className='flex gap-2 overflow-x-auto pb-1'>
								{images.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border transition-all ${
											selectedImage === index
												? "border-black"
												: "border-border hover:border-text-medium"
										}`}
									>
										<ImageWithFallback
											src={resolveImageUrl(image)}
											alt={`${name} ${index + 1}`}
											className='w-full h-full object-contain bg-white'
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* RIGHT: info, price, sizes, delivery */}
					<div className='space-y-8'>
						{/* Title + brand + price + size + CTA */}
						<div className='space-y-6'>
							{/* Brand + title + favorite */}
								<div className='flex items-start justify-between gap-3'>
									<div>
										<p className='text-text-light text-xs uppercase tracking-[0.18em] mb-1'>
											Barcelo Biagi
										</p>
										<h1 className='text-2xl sm:text-3xl font-semibold text-text-dark'>
											{name}
										</h1>
										{categoryName && (
											<p className='text-xs text-text-light mt-1 capitalize'>
												{categoryName}
											</p>
										)}
										{description && (
											<p className='mt-3 text-sm text-text-dark leading-relaxed'>
												{description}
											</p>
										)}
									</div>
									<button
										className='p-2 rounded-full border border-border hover:bg-surface-light transition'
										onClick={() => {
											toggleFavorite(product);
										setFav((prev) => !prev);
									}}
									aria-label='favorite'
								>
									<Heart
										size={18}
										className={fav ? "text-error fill-error" : "text-text-dark"}
									/>
								</button>
							</div>

							{/* Price */}
							<div className='flex items-end gap-3'>
								<span className='text-2xl sm:text-3xl font-semibold'>
									{product.price.toLocaleString("ru-RU")} ₽
								</span>
								{product.old_price && (
									<>
										<span className='text-text-light line-through text-sm'>
											{product.old_price.toLocaleString("ru-RU")} ₽
										</span>
										{discountPercent > 0 && (
											<span className='inline-flex items-center rounded-md bg-error text-white text-xs px-2 py-1 font-semibold'>
												-{discountPercent}%
											</span>
										)}
									</>
								)}
							</div>

							{/* Size selection */}
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
										<h3 className='text-sm font-semibold'>
											{t("Выберите размер", "Choose size")}
										</h3>
										<button className='text-xs text-text-light underline hover:no-underline'>
											{t("Таблица размеров", "Size guide")}
										</button>
									</div>
									{showSizes ? (
										<>
											<div className='flex flex-wrap gap-2'>
												{sizes.map((size) => (
													<button
														key={size.size}
														onClick={() => setSelectedSize(size.size)}
														disabled={size.stock === 0}
														className={
															selectedSize === size.size
																? "h-10 min-w-[56px] px-3 rounded-lg border border-black bg-black text-white text-sm font-semibold tracking-wide shadow-sm"
																: size.stock > 0
																? "h-10 min-w-[56px] px-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-text-dark hover:border-black hover:-translate-y-0.5 transition-transform shadow-sm"
																: "h-10 min-w-[56px] px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-semibold text-text-light opacity-50 cursor-not-allowed"
														}
													>
														{size.size}
													</button>
												))}
											</div>
											{isOutOfStock && (
												<p className='text-xs text-error'>
													{t("Нет в наличии", "Out of stock")}
												</p>
											)}
											{!isOutOfStock && isLowStock && (
												<p className='text-xs text-warning'>
													{t("Осталось мало", "Only a few left")}
												</p>
											)}
										</>
									) : (
										<p className='text-sm text-text-dark'>
											{t("Размер единый / аксессуар", "One size / accessory")}
										</p>
									)}
							</div>

							{/* CTA */}
								<div className='space-y-4'>
									<button
										onClick={handleAddToCart}
										disabled={isOutOfStock}
										className={`w-full h-12 rounded-full text-sm font-semibold transition-all shadow-sm ${
											isOutOfStock
												? "bg-gray-200 text-text-light cursor-not-allowed"
												: "bg-error text-white hover:bg-error/90 active:scale-[0.99]"
										}`}
									>
										{t("Добавить в корзину", "Add to cart")}
									</button>
								</div>
						</div>

						{/* Divider */}
						<div className='h-px bg-border' />

						{/* Store pickup & delivery */}
							<section className='space-y-5 text-sm bg-white border border-border rounded-2xl p-5 shadow-sm'>
							{/* Самовывоз */}
							<div>
								<h3 className='font-semibold mb-1'>
									{t("Самовывоз из магазина", "Store pickup")}
								</h3>
								<p className='text-text-dark'>
									{t(
										"Вы можете забрать свой заказ в нашем магазине.",
										"You can pick up your order in our store."
									)}
								</p>
								<div className='mt-2 space-y-0.5 text-text-dark'>
									<p>г. Иваново</p>
									<p>ТРЦ «Серебряный город», 3 этаж, магазин №5</p>
								</div>
									<div className='mt-3 h-40 rounded-xl border border-border overflow-hidden bg-surface-light flex items-center justify-center text-xs text-text-light'>
										<MapPin className='w-4 h-4 mr-1' />
										<span>{t("Самовывоз доступен", "Pickup available")}</span>
									</div>
							</div>

								{/* Delivery note */}
								<div className='flex items-start gap-2'>
									<RefreshCw className='w-4 h-4 text-text-light mt-0.5' />
									<p className='text-text-dark text-xs'>
										{t(
											"Доступна курьерская доставка и самовывоз. Подтвердим пункт выдачи при оформлении заказа.",
											"Courier delivery and pickup available. Pickup point will be confirmed at checkout."
										)}
									</p>
								</div>

							{/* Courier + payment */}
							<div className='space-y-3'>
								<div className='flex items-start gap-3'>
									<Truck className='w-5 h-5 text-text-light mt-0.5' />
									<div>
										<p className='font-semibold text-text-dark mb-0.5'>
											{t("Курьерская доставка", "Courier delivery")}
										</p>
										<p className='text-xs text-text-light'>
											{t("По Иваново 1–2 дня.", "1–2 days in Ivanovo.")}
										</p>
									</div>
								</div>
								<div className='text-xs text-text-dark'>
									<p className='font-semibold mb-0.5'>
										{t("Оплата", "Payment")}
									</p>
									<ul className='list-disc list-inside space-y-0.5'>
										<li>{t("Картой онлайн", "Card online")}</li>
										<li>{t("Картой при получении", "Card on delivery")}</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Divider */}
						<div className='h-px bg-border' />

							{/* Meta / details */}
							<section className='space-y-3 text-sm bg-white border border-border rounded-2xl p-5 shadow-sm'>
							{description && (
								<div>
									<p className='text-text-light mb-1'>
										{t("Описание", "Description")}
									</p>
									<p className='text-text-dark leading-relaxed'>
										{description}
									</p>
								</div>
							)}
							{material && (
								<div>
									<p className='text-text-light mb-1'>
										{t("Материал", "Material")}
									</p>
									<p className='text-text-dark'>{material}</p>
								</div>
							)}
							{color && (
								<div>
									<p className='text-text-light mb-1'>{t("Цвет", "Color")}</p>
									<p className='text-text-dark'>{color}</p>
								</div>
							)}
							<div>
								<p className='text-text-light mb-1'>{t("Артикул", "SKU")}</p>
								<p className='text-text-dark'>{product.sku}</p>
							</div>
						</section>
					</div>
				</div>

				{/* Zoom overlay */}
				{zoomOpen && (
					<div
						className='fixed inset-0 z-40 bg-black/70 flex items-center justify-center'
						onClick={() => setZoomOpen(false)}
					>
						<div className='max-w-4xl w-full px-4'>
							<div className='relative bg-white rounded-2xl overflow-hidden'>
								<ImageWithFallback
									src={resolveImageUrl(images[selectedImage])}
									alt={name}
									className='w-full h-full object-contain max-h-[80vh]'
								/>
								<button
									className='absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded-full'
									onClick={() => setZoomOpen(false)}
								>
									{t("Закрыть", "Close")}
								</button>
							</div>
						</div>
					</div>
				)}

		{/* Related products */}
		{relatedProducts.length > 0 && (
			<div className='border-t border-border pt-10 mt-4'>
				<h2 className='mb-4 text-lg font-semibold'>
					{t("С этим товаром покупают", "You may also like")}
				</h2>
				<div className='flex gap-3 overflow-x-auto pb-3'>
					{relatedProducts.map((relatedProduct) => (
						<button
							key={relatedProduct.id}
							onClick={() => {
								navigate(`/product/${relatedProduct.id}`);
								window.scrollTo(0, 0);
							}}
							className='min-w-[180px] max-w-[200px] bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow text-left'
						>
							<div className='aspect-[4/5] overflow-hidden rounded-t-xl bg-surface-light'>
								<ImageWithFallback
									src={resolveImageUrl(relatedProduct.images?.[0] ?? '')}
									alt={relatedProduct.name_ru}
									className='w-full h-full object-contain bg-white'
								/>
							</div>
							<div className='p-3 space-y-1'>
								<p className='text-xs text-text-light uppercase tracking-wide'>
									Barcelo Biagi
								</p>
								<p className='text-sm text-text-dark line-clamp-2 min-h-[2.5rem]'>
									{relatedProduct.name_ru}
								</p>
								<p className='text-sm font-semibold text-text-dark'>
									{relatedProduct.price.toLocaleString("ru-RU")} ₽
								</p>
							</div>
						</button>
					))}
				</div>
			</div>
		)}
			</div>
		</div>
	);
}
