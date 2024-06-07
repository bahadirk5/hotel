export type Price = {
  id: number;
  start: string;
  end: string;
  price: number;
};

type Room = {
  id: number;
  name: string;
};

type RoomType = {
  id: number;
  name: string;
  rooms: Room[];
  prices: Price[];
};

export type Booking = {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  guestName: string;
};

export const bookings: Booking[] = [
  {
    id: 1,
    roomId: 1,
    startDate: "2024-06-01",
    endDate: "2024-06-03",
    guestName: "Cemile Korkmazer",
  },
  {
    id: 2,
    roomId: 2,
    startDate: "2024-06-05",
    endDate: "2024-06-10",
    guestName: "Alparslan Korkmazer",
  },
  //  {
  //    id: 14,
  //    roomId: 1,
  //    startDate: "2024-06-03",
  //    endDate: "2024-06-06",
  //    guestName: "Bahadır Korkazer",
  //  },
];

export const rooms: RoomType[] = [
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
