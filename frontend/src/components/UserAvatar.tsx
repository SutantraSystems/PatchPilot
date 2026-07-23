"use client";

type Props = {
  name: string;
};

export default function UserAvatar({ name }: Props) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-semibold shadow">
      {initials}
    </div>
  );
}