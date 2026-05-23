export function toFullWidth(num: number): string {
  return String(num).replace(/\d/g, (d) => String.fromCharCode(d.charCodeAt(0) + 0xFF10 - 0x30));
}

export default toFullWidth;
