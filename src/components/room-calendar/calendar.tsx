"use client";

import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { bookings, rooms } from "./data";
import BookingComponent from "./booking-component";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { cellWidth, drawGrid, drawHeaders, drawPricesAndRooms } from "./utils";

export function CustomCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [currentDate, setCurrentDate] = useState(dayjs().startOf("month"));
  const daysCount = currentDate.daysInMonth(); // Gün sayısını ayın sonuna göre ayarlayın
  const today = dayjs().startOf("day");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const sidebar = sidebarRef.current;

    if (canvas && container && sidebar) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Device pixel ratio kullanarak çözünürlüğü artırma
        const dpr = window.devicePixelRatio || 1;
        canvas.width = cellWidth * daysCount * dpr;
        canvas.height = sidebar.scrollHeight * dpr;
        ctx.scale(dpr, dpr);

        // Canvas boyutlarını CSS ile ayarlama
        canvas.style.width = `${cellWidth * daysCount}px`;
        canvas.style.height = `${sidebar.scrollHeight}px`;

        // Genel yapı
        ctx.fillStyle = "rgb(255, 255, 255)"; // Beyaz arka plan
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        // Tarih başlıkları
        drawHeaders(ctx, currentDate, daysCount, today);

        // Hücre çizgileri
        drawGrid(ctx, daysCount);

        // Fiyatlandırma ve oda bilgileri
        drawPricesAndRooms(ctx, currentDate, daysCount);
      }
    }
  }, [currentDate, daysCount, today]);

  const handlePreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month").startOf("month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month").startOf("month"));
  };

  const handleToday = () => {
    setCurrentDate(dayjs().startOf("month"));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            &lt;
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            &gt;
          </Button>
        </div>
        <div className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {currentDate.format("MMMM YYYY")}
        </div>
      </div>
      <div className="relative flex w-full">
        <div
          ref={sidebarRef}
          className="sticky left-0 top-0 z-10 min-w-[250px] overflow-y-auto border bg-background shadow"
        >
          <div className="h-[50px]"></div> {/* Başlıklar için boşluk */}
          {rooms.map((roomType) => (
            <div key={roomType.id}>
              <div className="flex h-[50px] items-center rounded bg-muted">
                <p className="px-4 text-2xl font-semibold leading-none tracking-tight">
                  {roomType.name}
                </p>
              </div>
              {roomType.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex h-[50px] items-center justify-between px-4"
                >
                  <p className="">{room.name}</p>
                  <p
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      room.status === "clean"
                        ? " bg-green-100 text-green-600"
                        : "bg-red-100 text-red-400",
                    )}
                  >
                    {room.status}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div ref={containerRef} className="relative w-full overflow-x-scroll">
          <canvas ref={canvasRef} className="border-collapse" />
          <div className="absolute left-0 top-0">
            {bookings.map((booking, index) => {
              const roomType = rooms.find((rt) =>
                rt.rooms.some((r) => r.id === booking.roomId),
              );
              const roomIndex =
                roomType?.rooms.findIndex((r) => r.id === booking.roomId) || 0;
              const yOffset =
                50 +
                (rooms.findIndex((rt) => rt.id === roomType?.id) + 1) * 50 +
                roomIndex * 50;

              return (
                <BookingComponent
                  key={index}
                  booking={booking}
                  cellWidth={cellWidth}
                  currentDate={currentDate}
                  yOffset={yOffset}
                  daysCount={daysCount} // daysCount prop olarak geçiliyor
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
