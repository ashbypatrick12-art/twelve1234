export function formatUGX(amount) {
  const n = Number(amount) || 0;
  return `UGX ${n.toLocaleString('en-US')}`;
}
