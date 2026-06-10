import sharp from "sharp";

const src = "public/brand/gommo-logo-source.png";
const outFull = "public/brand/gommo-logo-full.png";
const outIcon = "public/brand/gommo-logo-icon.png";
const outWhite = "public/brand/gommo-logo-white.png";
const meta = await sharp(src).metadata();
const splitX = Math.round(meta.width * 0.72);
const rightW = meta.width - splitX;
const fullRaw = await sharp(src).extract({ left: 0, top: 0, width: splitX, height: meta.height }).toBuffer();
const fullBuf = await sharp(fullRaw).flatten({ background: "#ffffff" }).trim({ threshold: 24 }).png().toBuffer();
await sharp(fullBuf).toFile(outFull);
const iconRaw = await sharp(src).extract({ left: splitX, top: 0, width: rightW, height: meta.height }).toBuffer();
await sharp(iconRaw).flatten({ background: "#ffffff" }).trim({ threshold: 24 }).png().toFile(outIcon);
await sharp(fullBuf)
    .ensureAlpha()
    .linear(1.05, -10)
    .modulate({ brightness: 2.2, saturation: 0.35 })
    .png()
    .toFile(outWhite);
const full = await sharp(outFull).metadata();
const icon = await sharp(outIcon).metadata();
const white = await sharp(outWhite).metadata();
console.log("full", full.width, "x", full.height);
console.log("icon", icon.width, "x", icon.height);
console.log("white", white.width, "x", white.height);
