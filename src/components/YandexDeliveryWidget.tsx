"use client";

import React, { useEffect, useId, useState } from "react";

declare global {
  interface Window {
    YaDelivery?: {
      createWidget: (opts: any) => void;
    };
  }
}

type YandexDeliveryWidgetProps = {
  city?: string;
  stationId?: string;
  weightGrams?: number;
  height?: string;
  onPointSelect?: (point: any) => void;
};

export function YandexDeliveryWidget({
  city = "Москва",
  stationId,
  weightGrams,
  height = "450px",
  onPointSelect,
}: YandexDeliveryWidgetProps) {
  const rawId = useId();
  const containerId = rawId.replace(/[:]/g, "_");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const scriptId = "yandex-delivery-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://ndd-widget.landpro.site/widget.js";
      script.async = true;
      script.onload = () => setReady(true);
      document.head.appendChild(script);
    } else {
      setReady(true);
    }

    const handleLoad = () => setReady(true);
    document.addEventListener("YaNddWidgetLoad", handleLoad);
    const handlePoint = (event: any) => {
      if (onPointSelect) onPointSelect(event.detail);
    };
    document.addEventListener("YaNddWidgetPointSelected", handlePoint as any);

    return () => {
      document.removeEventListener("YaNddWidgetLoad", handleLoad);
      document.removeEventListener("YaNddWidgetPointSelected", handlePoint as any);
    };
  }, [onPointSelect]);

  useEffect(() => {
    if (!ready) return;
    if (window.YaDelivery?.createWidget) {
      window.YaDelivery.createWidget({
        containerId,
        params: {
          city,
          size: { height, width: "100%" },
          ...(stationId
            ? {
                source_platform_station: stationId,
                physical_dims_weight_gross: weightGrams,
                show_select_button: true,
                filter: { types: ["pickup_point", "terminal"] },
              }
            : {}),
        },
      });
    }
  }, [ready, city, stationId, weightGrams, height, containerId]);

  return (
    <div
      id={containerId}
      className="w-full rounded-xl border border-gray-200 overflow-hidden bg-white"
      style={{ minHeight: height }}
    />
  );
}
