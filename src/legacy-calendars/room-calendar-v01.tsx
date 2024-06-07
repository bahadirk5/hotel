"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
  differenceInDays,
  endOfWeek,
} from "date-fns";

interface Booking {
  roomId: number;
  checkIn: string;
  checkOut: string;
  guest: string;
}

const rooms: { id: number; name: string }[] = [
  { id: 1, name: "Room 101" },
  { id: 2, name: "Room 102" },
  { id: 3, name: "Room 103" },
];

const initialBookings: Booking[] = [
  {
    roomId: 1,
    checkIn: "2024-05-15",
    checkOut: "2024-05-21",
    guest: "Bahadir Korkmazer",
  },
  {
    roomId: 1,
    checkIn: "2024-05-22",
    checkOut: "2024-06-09",
    guest: "Bahadir Korkmazer",
  },
  {
    roomId: 2,
    checkIn: "2024-05-13",
    checkOut: "2024-05-16",
    guest: "Cemile Korkmazer",
  },
  {
    roomId: 3,
    checkIn: "2024-05-17",
    checkOut: "2024-05-21",
    guest: "Alparslan Korkmazer",
  },
];

function getBookingSpan(booking: Booking, start: Date, end: Date) {
  const checkIn = parseISO(booking.checkIn);
  const checkOut = parseISO(booking.checkOut);

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

function splitBookingsAcrossWeeks(bookings: Booking[]): Booking[] {
  return bookings.flatMap((booking) => {
    const checkIn = parseISO(booking.checkIn);
    const checkOut = parseISO(booking.checkOut);
    const weeks: Booking[] = [];

    let startOfCurrentWeek = startOfWeek(checkIn, { weekStartsOn: 1 });
    let endOfCurrentWeek = endOfWeek(checkIn, { weekStartsOn: 1 });

    while (startOfCurrentWeek <= checkOut) {
      const currentWeekCheckIn = isWithinInterval(checkIn, {
        start: startOfCurrentWeek,
        end: endOfCurrentWeek,
      })
        ? checkIn
        : startOfCurrentWeek;
      const currentWeekCheckOut = isWithinInterval(checkOut, {
        start: startOfCurrentWeek,
        end: endOfCurrentWeek,
      })
        ? checkOut
        : endOfCurrentWeek;

      weeks.push({
        roomId: booking.roomId,
        checkIn: format(currentWeekCheckIn, "yyyy-MM-dd"),
        checkOut: format(currentWeekCheckOut, "yyyy-MM-dd"),
        guest: booking.guest,
      });

      startOfCurrentWeek = addDays(endOfCurrentWeek, 1);
      endOfCurrentWeek = endOfWeek(startOfCurrentWeek, { weekStartsOn: 1 });
    }

    return weeks;
  });
}

export function CustomCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(today, { weekStartsOn: 1 }),
    to: addDays(startOfWeek(today, { weekStartsOn: 1 }), 27),
  });

  useEffect(() => {
    setDateRange({
      from: startOfWeek(currentDate, { weekStartsOn: 1 }),
      to: addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 27),
    });
  }, [currentDate]);

  const handlePrevious = useCallback(() => {
    setCurrentDate(addDays(currentDate, -28));
  }, [currentDate]);

  const handleNext = useCallback(() => {
    setCurrentDate(addDays(currentDate, 28));
  }, [currentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(today);
  }, [today]);

  const daysInRange = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  });

  const splitBookings = useMemo(
    () => splitBookingsAcrossWeeks(initialBookings),
    [],
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={handlePrevious}>← previous</button>
        <h2>{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={handleToday}>Today</button>
        <button onClick={handleNext}>next →</button>
      </div>
      <div
        className="grid gap-1 border p-2"
        style={{
          gridTemplateColumns: `repeat(${daysInRange.length + 1}, minmax(0, 1fr))`,
        }}
      >
        <div className="font-bold"></div>
        {daysInRange.map((day, i) => (
          <div
            key={i}
            className={`border p-2 font-bold ${isWithinInterval(day, { start: today, end: today }) ? "bg-blue-200" : ""}`}
          >
            {format(day, "MMM d")}
          </div>
        ))}
        {rooms.map((room) => (
          <React.Fragment key={room.id}>
            <div className="border p-2 font-bold">{room.name}</div>
            {daysInRange.map((day, i) => {
              const currentDate = new Date(day);
              const booking = splitBookings.find(
                (booking) =>
                  booking.roomId === room.id &&
                  isWithinInterval(currentDate, {
                    start: parseISO(booking.checkIn),
                    end: parseISO(booking.checkOut),
                  }),
              );

              if (
                booking &&
                format(currentDate, "yyyy-MM-dd") === booking.checkIn
              ) {
                const { span } = getBookingSpan(
                  booking,
                  dateRange.from,
                  dateRange.to,
                );

                return (
                  <div
                    key={`${booking.roomId}-${booking.checkIn}-${booking.checkOut}`}
                    className="col-span-auto relative col-start-auto content-center border bg-cyan-400 p-2"
                    style={{
                      gridColumnStart: i + 2,
                      gridColumnEnd: `span ${span}`,
                    }}
                  >
                    <span className="rounded px-2 py-1 text-white">
                      {booking.guest}
                    </span>
                  </div>
                );
              }

              if (booking) {
                return null;
              }

              return <div key={i} className="border p-2"></div>;
            })}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
