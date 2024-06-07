"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  format,
  startOfMonth,
  addDays,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  differenceInDays,
  isWithinInterval,
  endOfMonth,
  endOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type Booking = {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  guestName: string;
};

type Room = {
  id: number;
  name: string;
};

type Price = {
  id: number;
  start: string;
  end: string;
  price: number;
};

type RoomType = {
  id: number;
  name: string;
  rooms: Room[];
  prices: Price[];
};

const bookings: Booking[] = [
  {
    id: 1,
    roomId: 1,
    startDate: "2024-06-01",
    endDate: "2024-06-03",
    guestName: "Cemile Korkmazer",
  },
  {
    id: 2,
    roomId: 1,
    startDate: "2024-06-03",
    endDate: "2024-06-05",
    guestName: "Alparslan Korkmazer",
  },
  {
    id: 3,
    roomId: 1,
    startDate: "2024-06-05",
    endDate: "2024-06-10",
    guestName: "Bahadir Korkmazer",
  },
];

const rooms: RoomType[] = [
  {
    id: 1,
    name: "Single Room",
    rooms: [
      { id: 1, name: "Room 101" },
      { id: 2, name: "Room 102" },
      { id: 3, name: "Room 103" },
      { id: 4, name: "Room 104" },
    ],
    prices: [
      { id: 1, start: "2024-06-01", end: "2024-06-10", price: 255 },
      { id: 2, start: "2024-06-10", end: "2024-06-20", price: 300 },
      { id: 3, start: "2024-06-20", end: "2024-06-30", price: 155 },
    ],
  },
  {
    id: 2,
    name: "Suite",
    rooms: [
      { id: 5, name: "Room 105" },
      { id: 6, name: "Room 106" },
      { id: 7, name: "Room 107" },
      { id: 8, name: "Room 108" },
    ],
    prices: [
      { id: 1, start: "2024-06-01", end: "2024-06-10", price: 400 },
      { id: 2, start: "2024-06-10", end: "2024-06-20", price: 425 },
      { id: 3, start: "2024-06-20", end: "2024-06-30", price: 445 },
    ],
  },
  {
    id: 3,
    name: "Deluxe Room",
    rooms: [
      { id: 9, name: "Room 109" },
      { id: 10, name: "Room 110" },
      { id: 11, name: "Room 111" },
      { id: 12, name: "Room 112" },
    ],
    prices: [
      { id: 1, start: "2024-06-01", end: "2024-06-10", price: 400 },
      { id: 2, start: "2024-06-10", end: "2024-06-20", price: 425 },
      { id: 3, start: "2024-06-20", end: "2024-06-30", price: 445 },
    ],
  },
];

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

  // Problem: If the end of a booking coincides with the beginning of another booking, the calendar grid is distorted.
  // Solution: Adjust the handling of bookings so that overlapping bookings are displayed correctly without distorting the grid.
  function getBookingSpan(booking: Booking, start: Date, end: Date) {
    const checkIn = parseISO(booking.startDate);
    const checkOut = endOfDay(parseISO(booking.endDate));

    const bookingStart = isWithinInterval(checkIn, { start, end })
      ? checkIn
      : start;
    const bookingEnd = isWithinInterval(checkOut, { start, end })
      ? checkOut
      : end;

    const span = differenceInDays(bookingEnd, bookingStart) + 1;
    const offset = differenceInDays(bookingStart, start);

    return { span, offset };
  }

  function splitBookingsAcrossMonths(bookings: Booking[]) {
    return bookings.flatMap((booking) => {
      const checkIn = parseISO(booking.startDate);
      const checkOut = endOfDay(parseISO(booking.endDate));
      const bookings = [];

      let currentStart = checkIn;
      let currentEnd = endOfMonth(currentStart);

      while (currentStart <= checkOut) {
        if (currentEnd >= checkOut) {
          currentEnd = checkOut;
        }

        bookings.push({
          ...booking,
          startDate: format(currentStart, "yyyy-MM-dd"),
          endDate: format(currentEnd, "yyyy-MM-dd"),
        });

        currentStart = addDays(currentEnd, 1);
        currentEnd = endOfMonth(currentStart);
      }

      return bookings;
    });
  }

  function getPriceForDay(prices: Price[], day: Date): number | null {
    for (const price of prices) {
      const start = parseISO(price.start);
      const end = endOfDay(parseISO(price.end));
      if (isWithinInterval(day, { start, end })) {
        return price.price;
      }
    }
    return null;
  }

  function adjustOverlappingBookings(bookings: Booking[]) {
    bookings.sort(
      (a, b) =>
        parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
    );

    let lastEndDate = null;

    for (let booking of bookings) {
      const startDate = parseISO(booking.startDate);
      const endDate = parseISO(booking.endDate);

      if (lastEndDate && startDate <= lastEndDate) {
        booking.startDate = format(addDays(lastEndDate, 1), "yyyy-MM-dd");
      }

      lastEndDate = endDate;
    }

    return bookings;
  }

  const adjustedBookings = adjustOverlappingBookings(bookings);
  const splitBookings = splitBookingsAcrossMonths(adjustedBookings);

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
                          <HoverCard>
                            <HoverCardTrigger
                              key={`${booking.roomId}-${booking.startDate}-${booking.endDate}`}
                              className="col-span-auto relative col-start-auto rounded border bg-cyan-400 p-2 text-white"
                              style={{
                                gridColumnStart: i + 2,
                                gridColumnEnd: `span ${span}`,
                              }}
                            >
                              {booking.guestName}
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 rounded-md bg-white p-4 shadow-lg dark:bg-gray-950">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-semibold">
                                  {booking.guestName}
                                </h4>
                                <div className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                  Confirmed
                                </div>
                              </div>
                              <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                  <span className="font-medium">Check-in:</span>{" "}
                                  {booking.startDate}
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Check-out:
                                  </span>{" "}
                                  {booking.endDate}
                                </div>
                                <div>
                                  <span className="font-medium">Room:</span>{" "}
                                  {booking.roomId}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
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
