import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';

const outputDirectory = path.resolve('asset', 'qr', 'ground-floor');
// Change QR_BASE_URL when the customer website is deployed. The default works
// only for phones connected to this computer's current Wi-Fi network.
const baseUrl = (process.env.QR_BASE_URL || 'http://192.168.0.112:3000/order.html').replace(/\/$/, '');
const tableIds = Array.from({ length: 13 }, (_, index) => `GF-${String(index + 1).padStart(2, '0')}`);

await mkdir(outputDirectory, { recursive: true });

const cards = await Promise.all(tableIds.map(async (tableId) => {
  const orderUrl = `${baseUrl}?table=${encodeURIComponent(tableId)}`;
  const fileName = `${tableId.toLowerCase()}.png`;

  await QRCode.toFile(path.join(outputDirectory, fileName), orderUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 800,
    color: { dark: '#65070b', light: '#ffffff' }
  });

  return `<article><img src="${fileName}" alt="QR code for Ground Floor Table ${tableId}"><h1>Chick Buck</h1><h2>Ground Floor · Table ${tableId}</h2><p>Scan to order at your table</p></article>`;
}));

const printableSheet = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Chick Buck · Ground Floor QR Codes</title>
<style>body{font-family:Arial,sans-serif;margin:24px;color:#65070b}header{text-align:center;margin-bottom:20px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}article{border:2px solid #65070b;border-radius:14px;text-align:center;padding:14px;break-inside:avoid}img{width:100%;max-width:190px}h1{font-size:18px;margin:4px}h2{font-size:15px;margin:4px}p{font-size:12px;margin:7px 0}@media print{body{margin:10mm}main{gap:10mm}article{padding:7mm}}</style>
</head><body><header><h1>Chick Buck · Ground Floor Table QR Codes</h1><p>Print, cut, and place one card on each corresponding table.</p></header><main>${cards.join('')}</main></body></html>`;

await writeFile(path.join(outputDirectory, 'printable-qr-cards.html'), printableSheet);
console.log(`Generated ${tableIds.length} ground-floor QR codes in ${outputDirectory}`);
