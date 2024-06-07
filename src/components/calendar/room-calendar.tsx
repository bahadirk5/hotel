"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  startOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval,
  endOfMonth,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { bookings, rooms } from "./data";
import {
  getBookingSpan,
  getPriceForDay,
  splitBookingsAcrossMonths,
} from "./utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function CustomCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const viewportRef = useRef<HTMLDivElement>(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    if (viewportRef.current) {
      const todayIndex = daysInMonth.findIndex(isToday);
      const scrollToDay = todayIndex !== -1 ? todayIndex : 0;
      viewportRef.current.scrollTo({
        left: scrollToDay * 150,
        behavior: "smooth",
      });
    }
  }, [daysInMonth]);

  useEffect(() => {
    if (viewportRef.current) {
      const todayIndex = daysInMonth.findIndex(isToday);
      const scrollToDay = todayIndex !== -1 ? todayIndex : 0;
      viewportRef.current.scrollTo({
        left: scrollToDay * 150,
        behavior: "smooth",
      });
    }
  }, [daysInMonth]);

  const splitBookings = splitBookingsAcrossMonths(bookings);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mb-4 flex items-center justify-between border-b bg-background p-4">
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            &lt;
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            &gt;
          </Button>
        </div>
      </div>
      <ScrollArea
        className="w-full whitespace-nowrap"
        viewportRef={viewportRef}
      >
        <div
          className="grid gap-1 p-2"
          style={{
            gridTemplateColumns: `minmax(200px, 1fr) repeat(${daysInMonth.length}, minmax(150px, 1fr))`,
          }}
        >
          <div className="sticky left-0 top-0 z-20 bg-slate-50"></div>
          {daysInMonth.map((day, i) => (
            <div
              key={i}
              className={cn(
                "rounded border bg-background p-4 text-center text-lg font-bold",
                isToday(day) && "bg-cyan-200",
              )}
            >
              {format(day, "EEE d")}
            </div>
          ))}
          {rooms.map((roomType) => (
            <React.Fragment key={roomType.id}>
              <div className="sticky left-0 z-20 flex items-center rounded border bg-background p-4">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  {roomType.name}
                </h3>
              </div>
              <div className="contents">
                {daysInMonth.map((day, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-full rounded border bg-background p-4 text-center font-semibold text-muted-foreground">
                          {getPriceForDay(roomType.prices, day) || "--"} $
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Price: {getPriceForDay(roomType.prices, day) || "--"}{" "}
                          $
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {roomType.rooms.map((room) => (
                  <React.Fragment key={room.id}>
                    <div className="sticky left-0 z-10 rounded border bg-background">
                      <div className="flex h-full items-center p-4 font-semibold text-muted-foreground">
                        {room.name}
                      </div>
                    </div>
                    {daysInMonth.map((day, i) => {
                      const booking = splitBookings.find(
                        (booking) =>
                          booking.roomId === room.id &&
                          isWithinInterval(day, {
                            start: parseISO(booking.startDate),
                            end: parseISO(booking.endDate),
                          }),
                      );

                      if (
                        booking &&
                        format(day, "yyyy-MM-dd") === booking.startDate
                      ) {
                        const { span } = getBookingSpan(
                          booking,
                          daysInMonth[0] as Date,
                          daysInMonth[daysInMonth.length - 1] as Date,
                        );

                        return (
                          <div
                            key={`${booking.roomId}-${booking.startDate}-${booking.endDate}`}
                            className="col-span-auto relative col-start-auto rounded border bg-cyan-400 p-2 text-white"
                            style={{
                              gridColumnStart: i + 2,
                              gridColumnEnd: `span ${span}`,
                            }}
                          >
                            {booking.guestName}
                          </div>
                        );
                      }

                      if (booking) {
                        return null;
                      }

                      return (
                        <div
                          key={i}
                          className="h-full rounded border bg-muted/40 p-4 hover:bg-slate-200"
                        ></div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </React.Fragment>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
