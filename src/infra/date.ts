/*
  date formatting utilities
*/

const pad = (n: number) => String(n).padStart(2, "0");

export const appDate = {
  toLogString: (date: Date = new Date()) =>
    `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  toCCYYMMDD: (date: Date = new Date()) =>
    date.toISOString().slice(0, 10).replace(/\D/g, ""),
  toHHMMSS: (date: Date = new Date()) =>
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  toTimestamp: (date: Date = new Date(), separator = "") => {
    const ts = date.toISOString().replace(/\D/g, "").slice(0, 14);
    return ts.slice(0, 8) + separator + ts.slice(8);
  },
};
