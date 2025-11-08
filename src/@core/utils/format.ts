export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('tr-TR').format(value)
}
