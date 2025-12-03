"use client";

import * as React from "react";
import { Product } from "@/types";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { resolveImageUrl } from "@/lib/images";

type ProductCardProps = {
	product: Product;
	onClick?: () => void;
};

export function ProductCard({ product, onClick }: ProductCardProps) {
	const primaryImage =
		(product.images && product.images.length > 0 && product.images[0]) || "";

	const hasDiscount = product.old_price && product.old_price > product.price;
	const discountPercent = hasDiscount
		? Math.round(
				((product.old_price! - product.price) / product.old_price!) * 100
		  )
		: 0;

	return (
		<button
			type='button'
			onClick={onClick}
			className='
        group w-full text-left
        overflow-hidden rounded-2xl
        border border-gray-200 bg-white
        transition-all duration-200
        hover:border-black/70 hover:shadow-[0_18px_40px_rgba(0,0,0,0.14)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white
      '
		>
			{/* Image area */}
			<div className='relative aspect-[4/5] w-full bg-[#f7f7f7] overflow-hidden'>
				<ImageWithFallback
					src={resolveImageUrl(primaryImage)}
					alt={product.name_ru}
					className='
            w-full h-full object-contain
            transition-transform duration-300
            group-hover:scale-105
          '
				/>

				{hasDiscount && (
					<span
						className='
              absolute top-2 left-2
              rounded-full bg-black/80 text-white
              text-[11px] font-semibold px-2 py-1
            '
					>
						–{discountPercent}%
					</span>
				)}
			</div>

			{/* Black description panel */}
			<div className='bg-black text-white px-3 py-3 space-y-1.5'>
				{/* Brand + optional category */}
				<div className='flex items-center justify-between gap-2'>
					<span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60'>
						Barcelo Biagi
					</span>
					{product.category && (
						<span className='text-[10px] uppercase tracking-wide text-white/45 line-clamp-1'>
							{product.category}
						</span>
					)}
				</div>

				{/* Name */}
				<p className='text-sm font-medium leading-snug line-clamp-2'>
					{product.name_ru}
				</p>

				{/* Price row */}
				<div className='mt-1 flex items-baseline justify-between gap-2'>
					<div className='flex items-baseline gap-2'>
						<span className='text-base font-semibold'>
							{product.price.toLocaleString("ru-RU")} ₽
						</span>
						{product.old_price && (
							<span className='text-[11px] line-through text-white/50'>
								{product.old_price.toLocaleString("ru-RU")} ₽
							</span>
						)}
					</div>

					{hasDiscount && (
						<span className='rounded-full border border-white/20 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.12em] text-white/80'>
							sale
						</span>
					)}
				</div>
			</div>
		</button>
	);
}
