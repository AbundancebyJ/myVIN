// Renders raster icons from public/brand/tipmonk-icon.svg (run after generate-brand.py):
//   app/icon.svg        copy of the SVG (modern browsers)
//   app/favicon.ico     16/32/48 px PNG-in-ICO (older browsers, Windows, Google results)
//   app/apple-icon.png  180 px on a solid background (iOS home screen rounds the corners)
// Needs Playwright with Chromium:  node scripts/render-icons.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "public/brand/tipmonk-icon.svg"), "utf8");
const src = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");

async function png(page, size, background) {
  await page.setViewportSize({ width: size, height: size });
  const pad = background ? Math.round(size * 0.06) : 0;
  await page.setContent(
    `<body style="margin:0;background:${background || "transparent"}"><img src="${src}" style="display:block;margin:${pad}px;width:${size - 2 * pad}px;height:${size - 2 * pad}px"></body>`,
  );
  await page.waitForTimeout(100);
  return page.screenshot({ omitBackground: !background, type: "png" });
}

function ico(images) {
  // ICONDIR + ICONDIRENTRY[] + PNG payloads
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  fs.writeFileSync(path.join(root, "app/icon.svg"), svg);
  const sizes = [48, 32, 16]; // largest first: Next.js reads the first entry for the sizes attribute
  const images = [];
  for (const size of sizes) images.push({ size, data: await png(page, size) });
  fs.writeFileSync(path.join(root, "app/favicon.ico"), ico(images));
  fs.writeFileSync(path.join(root, "app/apple-icon.png"), await png(page, 180, "#FFF7EE"));
  await browser.close();
  console.log("wrote app/icon.svg, app/favicon.ico, app/apple-icon.png");
})();
