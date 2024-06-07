import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto my-10">
      <Link href="/room-calendar" className="flex justify-center items-center">Calendar</Link>
    </div>
  );
}
