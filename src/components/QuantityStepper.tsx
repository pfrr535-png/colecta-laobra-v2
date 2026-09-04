"use client";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(value + 1);

  const handleInput = (raw: string) => {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) {
      onChange(min);
      return;
    }
    onChange(Math.max(min, n));
  };

  return (
    <div className="flex items-stretch">
      <button
        type="button"
        onClick={dec}
        aria-label="Restar"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-l-lg bg-navy text-2xl font-bold text-white active:bg-navy-dark"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        className="h-12 w-16 border-y border-gray-300 bg-white text-center text-lg font-semibold text-foreground focus:outline-none"
      />
      <button
        type="button"
        onClick={inc}
        aria-label="Sumar"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-r-lg bg-navy text-2xl font-bold text-white active:bg-navy-dark"
      >
        +
      </button>
    </div>
  );
}
