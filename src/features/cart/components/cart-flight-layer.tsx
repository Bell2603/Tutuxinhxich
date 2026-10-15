"use client";

import * as m from "motion/react-m";
import { useCartFlights, useCartUI } from "../store";

/** Lớp phủ vẽ ảnh sản phẩm bay theo đường cong vào biểu tượng giỏ hàng. */
export function CartFlightLayer() {
  const flights = useCartFlights((s) => s.flights);
  const land = useCartFlights((s) => s.land);
  const triggerBump = useCartUI((s) => s.triggerBump);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      {flights.map((flight) => {
        const size = Math.min(flight.from.width, flight.from.height, 220);
        const startX = flight.from.x + flight.from.width / 2 - size / 2;
        const startY = flight.from.y + flight.from.height / 2 - size / 2;
        const endX = flight.to ? flight.to.x + flight.to.width / 2 - size / 2 : startX;
        const endY = flight.to ? flight.to.y + flight.to.height / 2 - size / 2 : startY - 200;
        return (
          <m.img
            key={flight.id}
            src={flight.src}
            alt=""
            className="absolute rounded-3xl object-cover shadow-float ring-4 ring-white"
            style={{ width: size, height: size, left: 0, top: 0 }}
            initial={{ x: startX, y: startY, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: [startX, (startX + endX) / 2, endX],
              y: [startY, Math.min(startY, endY) - 140, endY],
              scale: [1, 0.6, 0.12],
              opacity: [1, 1, 0.4],
              rotate: [0, -12, 8],
            }}
            transition={{ duration: 0.85, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
            onAnimationComplete={() => {
              land(flight.id);
              triggerBump();
            }}
          />
        );
      })}
    </div>
  );
}
