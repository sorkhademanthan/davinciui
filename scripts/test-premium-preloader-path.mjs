import assert from "node:assert/strict";
import test from "node:test";
import {
  PREMIUM_PRELOADER_MEASURED_POINTS,
  PREMIUM_PRELOADER_PATH_OFFSET,
  PREMIUM_PRELOADER_PATH_SCALE,
  premiumPreloaderMirrorPoint,
  premiumPreloaderPathPoint,
  premiumPreloaderPathPosition,
} from "../packages/ui/src/lib/premium-preloader-path.ts";

test("card path follows the measured reference within 1.4vw/vh", () => {
  for (const sample of PREMIUM_PRELOADER_MEASURED_POINTS) {
    const t =
      PREMIUM_PRELOADER_PATH_OFFSET +
      PREMIUM_PRELOADER_PATH_SCALE * sample.time;
    const point = premiumPreloaderPathPoint(t);
    assert.ok(
      Math.abs(point.x - sample.x) <= 1.4,
      `x at ${sample.time}s: ${point.x.toFixed(2)} vs ${sample.x}`,
    );
    assert.ok(
      Math.abs(point.y - sample.y) <= 1.4,
      `y at ${sample.time}s: ${point.y.toFixed(2)} vs ${sample.y}`,
    );
  }
});

test("pixel conversion and mirror preserve geometry", () => {
  const width = 1440;
  const height = 900;
  const point = premiumPreloaderPathPosition(0.5, width, height);
  const mirrored = premiumPreloaderMirrorPoint(point, width, height);
  assert.equal(mirrored.x, width - point.x);
  assert.equal(mirrored.y, height - point.y);
});

test("path ends above the upper-left corner", () => {
  const point = premiumPreloaderPathPoint(1);
  assert.equal(point.x, 28);
  assert.equal(point.y, -15);
});
