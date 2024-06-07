import {
  format,
  parseISO,
  differenceInDays,
  isWithinInterval,
  endOfMonth,
  endOfDay,
  addDays,
} from "date-fns";
import { Booking, Price } from "./data";

export function getBookingSpan(booking: Booking, start: Date, end: Date) {
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

export function splitBookingsAcrossMonths(bookings: Booking[]) {
  return bookings.flatMap((booking) => {
    const checkIn = parseISO(booking.startDate);
    const checkOut = endOfDay(parseISO(booking.endDate));
    const splitBookings = [];

    let currentStart = checkIn;
    let currentEnd = endOfMonth(currentStart);

    while (currentStart <= checkOut) {
      if (currentEnd >= checkOut) {
        currentEnd = checkOut;
      }

      splitBookings.push({
        ...booking,
        startDate: format(currentStart, "yyyy-MM-dd"),
        endDate: format(currentEnd, "yyyy-MM-dd"),
      });

      currentStart = addDays(currentEnd, 1);
      currentEnd = endOfMonth(currentStart);
    }

    return splitBookings;
  });
}

export function getPriceForDay(prices: Price[], day: Date): number | null {
  for (const price of prices) {
    const start = parseISO(price.start);
    const end = endOfDay(parseISO(price.end));
    if (isWithinInterval(day, { start, end })) {
      return price.price;
    }
  }
  return null;
}
