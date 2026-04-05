const fs = require('fs');
let c = fs.readFileSync('src/hooks/useSupabaseData.ts', 'utf8');

const rwfMatch = /export const formatRWF = \(amount: number\): string =>\r?\n\s+`RWF \$\{Number\(amount\)\.toLocaleString\([^)]+\)\}`;/g;
const rwfReplace = `export const formatCurrency = (amount: number | string): string => {
  const currency = useAuthStore.getState().orgCurrency || "RWF";
  return \`\${currency} \${Number(amount).toLocaleString("en-US")}\`;
};

export const formatRWF = formatCurrency;`;

c = c.replace(rwfMatch, rwfReplace);

const dateMatch = /export const formatDate = \(dateStr: string\): string =>\r?\n\s+new Date\(dateStr\)\.toLocaleDateString\([^)]+\);/g;
const dateReplace = `export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  try {
    const tz = useAuthStore.getState().orgTimezone || 'Africa/Kigali';
    const date = toDate(dateStr, { timeZone: tz });
    return dateFnsFormat(date, 'd MMMM yyyy');
  } catch (err) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
};`;

c = c.replace(dateMatch, dateReplace);

fs.writeFileSync('src/hooks/useSupabaseData.ts', c);
console.log("Replaced successfully!");
