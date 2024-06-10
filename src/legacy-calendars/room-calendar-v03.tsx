"use client";

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { bookings, rooms } from "./data";

export function CustomCalendar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const cellWidth = 100; // Geniş hücre genişliği
  const [currentDate, setCurrentDate] = useState(dayjs().startOf("month"));
  const daysCount = currentDate.daysInMonth(); // Gün sayısını ayın sonuna göre ayarlayın

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
        ctx.fillStyle = "rgb(255, 255, 255)"; // Beyaz arka plan
        ctx.fillRect(0, 0, canvas.width / dpr, 50);
        ctx.font = "bold 14px Arial"; // Yazı tipi ve boyutu
        ctx.textBaseline = "middle"; // Yazı ortalama
        for (let i = 0; i < daysCount; i++) {
          const x = i * cellWidth;
          ctx.fillStyle = "rgb(34, 34, 34)"; // Siyah metin
          ctx.fillText(currentDate.add(i, "day").format("MMM D"), x + 10, 25);

          // Border bottom for date headers
          ctx.beginPath();
          ctx.moveTo(x, 50);
          ctx.lineTo(x + cellWidth, 50);
          ctx.strokeStyle = "rgb(200, 200, 200)";
          ctx.stroke();
        }

        // Hücre çizgileri
        for (let i = 0; i <= daysCount; i++) {
          const x = i * cellWidth;
          ctx.moveTo(x, 50);
          ctx.lineTo(x, canvas.height / dpr);
          ctx.strokeStyle = "rgb(200, 200, 200)"; // Gri çizgiler
          ctx.stroke();
        }

        // Fiyatlandırma ve oda bilgileri
        let currentY = 50; // Header yüksekliğini 50px olarak kabul ediyoruz
        rooms.forEach((roomType) => {
          currentY += 50; // Kategori satırı yüksekliği

          // Fiyat çizimi
          roomType.prices.forEach((price) => {
            const startDate = dayjs(price.start).startOf("day");
            const endDate = dayjs(price.end).endOf("day");
            for (
              let date = startDate;
              date.isBefore(endDate) || date.isSame(endDate);
              date = date.add(1, "day")
            ) {
              const diff = date.diff(currentDate, "day");
              if (diff >= 0 && diff < daysCount) {
                const x = diff * cellWidth;
                ctx.fillStyle = "rgb(255, 255, 255)"; // Beyaz arka plan
                ctx.fillRect(x, currentY - 40, cellWidth, 40); // 40px yükseklik (daha küçük)
                ctx.fillStyle = "rgb(34, 34, 34)"; // Siyah metin
                ctx.fillText(
                  `$${price.price}`,
                  x +
                    cellWidth / 2 -
                    ctx.measureText(`$${price.price}`).width / 2,
                  currentY - 20,
                ); // Ortalı metin, biraz daha yukarı

                // Border for price cells
                ctx.beginPath();
                ctx.rect(x, currentY - 40, cellWidth, 40);
                ctx.strokeStyle = "rgb(200, 200, 200)";
                ctx.stroke();
              }
            }
          });

          // Rezervasyonlar
          roomType.rooms.forEach((room) => {
            ctx.moveTo(0, currentY);
            ctx.lineTo(canvas.width / dpr, currentY);
            ctx.strokeStyle = "rgb(200, 200, 200)"; // Gri çizgiler
            ctx.stroke();

            bookings.forEach((booking) => {
              if (booking.roomId === room.id) {
                const start = dayjs(booking.startDate).diff(currentDate, "day");
                const end = dayjs(booking.endDate).diff(currentDate, "day");

                if (end >= 0 && start < daysCount) {
                  const xStart = (start + 0.5) * cellWidth; // Start in the middle of the day
                  const xEnd = (end + 0.5) * cellWidth; // End in the middle of the day
                  const yMiddle = currentY + 5; // Hücrenin ortası için 5px ekleyin
                  ctx.fillStyle =
                    booking.status === "confirmed"
                      ? "rgb(46, 204, 113)"
                      : "rgb(231, 76, 60)"; // Yeşil ve kırmızı tonlar
                  ctx.beginPath();
                  ctx.moveTo(xStart, yMiddle);
                  ctx.lineTo(xEnd, yMiddle);
                  ctx.arcTo(xEnd + 15, yMiddle, xEnd + 15, yMiddle + 15, 15);
                  ctx.lineTo(xEnd + 15, yMiddle + 20);
                  ctx.arcTo(xEnd + 15, yMiddle + 25, xEnd, yMiddle + 25, 15);
                  ctx.lineTo(xStart, yMiddle + 25);
                  ctx.arcTo(
                    xStart - 15,
                    yMiddle + 25,
                    xStart - 15,
                    yMiddle + 20,
                    15,
                  );
                  ctx.lineTo(xStart - 15, yMiddle + 15);
                  ctx.arcTo(xStart - 15, yMiddle, xStart, yMiddle, 15);
                  ctx.closePath();
                  ctx.fill();
                  ctx.fillStyle = "rgb(255, 255, 255)"; // Beyaz metin
                  ctx.fillText(
                    booking.guestName,
                    xStart + 5,
                    yMiddle + 15, // Metni biraz daha yukarı taşıyın
                  );
                }
              }
            });

            currentY += 50; // Satır yüksekliği
          });

          ctx.moveTo(0, currentY);
          ctx.lineTo(canvas.width / dpr, currentY);
          ctx.stroke();
        });
      }
    }
  }, [currentDate, daysCount]);

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
      <div className="flex items-center justify-between p-4">
        <div className="text-lg font-bold text-foreground">
          {currentDate.format("MMMM YYYY")}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousMonth}
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Previous
          </button>
          <button
            onClick={handleToday}
            className="rounded bg-accent px-4 py-2 text-accent-foreground"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            Next
          </button>
        </div>
      </div>
      <div className="relative flex w-full">
        <div
          ref={sidebarRef}
          className="sticky left-0 top-0 z-10 min-w-[200px] overflow-y-auto bg-background px-4 shadow-lg"
        >
          <div className="h-[50px]"></div> {/* Başlıklar için boşluk */}
          {rooms.map((roomType) => (
            <div key={roomType.id}>
              <div className="flex h-[50px] items-center font-bold text-foreground bg-muted/50">
                {roomType.name}
              </div>
              {roomType.rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex h-[50px] items-center text-foregroun border-b"
                >
                  {room.name}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div ref={containerRef} className="w-full overflow-x-scroll">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
