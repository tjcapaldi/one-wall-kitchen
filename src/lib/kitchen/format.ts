/** 40 -> "3 ft 4 in" */
export function toFeetInches(inches: number): string {
  const rounded = Math.round(inches * 4) / 4;
  const ft = Math.floor(rounded / 12);
  const rest = rounded - ft * 12;
  const inPart = Number.isInteger(rest) ? `${rest}` : `${rest.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}`;
  if (ft === 0) return `${inPart} in`;
  if (rest === 0) return `${ft} ft`;
  return `${ft} ft ${inPart} in`;
}

export function inchLabel(inches: number): string {
  const rounded = Math.round(inches * 4) / 4;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** "36 in (3 ft)" */
export function inchWithFeet(inches: number): string {
  const primary = `${inchLabel(inches)} in`;
  if (inches < 12) return primary;
  return `${primary} (${toFeetInches(inches)})`;
}

export function feetLabel(inches: number): string {
  const ft = inches / 12;
  return Number.isInteger(ft) ? `${ft} ft` : toFeetInches(inches);
}

export function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
