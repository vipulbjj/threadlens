/**
 * Crop screenshots to content (no viewport dead space).
 * Usage: npx tsx scripts/capture-marketing-png.ts <htmlPath> <outDir>
 */
import { chromium } from "playwright";
import { join } from "path";

async function main() {
  const htmlPath = process.argv[2];
  const outDir = process.argv[3];
  if (!htmlPath || !outDir) {
    console.error("Usage: npx tsx scripts/capture-marketing-png.ts <htmlPath> <outDir>");
    process.exit(1);
  }

  const fileUrl = htmlPath.startsWith("file://") ? htmlPath : `file://${htmlPath}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto(fileUrl, { waitUntil: "load" });

  // Scale card to fill Instagram 4:5 (symmetric letterboxing only, ~3% margin).
  await page.evaluate(() => {
    const canvas = document.getElementById("instagram-canvas");
    const frame = document.getElementById("capture");
    if (!canvas || !frame) return;
    const pad = 36;
    const availableH = canvas.clientHeight - pad;
    const availableW = canvas.clientWidth - pad;
    const neededH = frame.offsetHeight;
    const neededW = frame.offsetWidth;
    if (neededH <= 0 || neededW <= 0) return;
    const scale = Math.min(1.38, availableH / neededH, availableW / neededW);
    if (scale > 1.01) {
      (frame as HTMLElement).style.transform = `scale(${scale})`;
      (frame as HTMLElement).style.transformOrigin = "center center";
    }
  });

  await page.locator("#capture").screenshot({
    path: join(outDir, "linkedin-chat2.png"),
  });
  await page.locator("#instagram-canvas").screenshot({
    path: join(outDir, "instagram-chat2.png"),
  });

  await browser.close();
  console.log("Captured linkedin-chat2.png (tight crop) and instagram-chat2.png (1080×1350)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
