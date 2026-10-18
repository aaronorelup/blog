// node --test src/scripts/stats/core/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fmt from './fmt.js';

test('numbers', () => {
  assert.equal(fmt.num(11369), '11,369');
  assert.equal(fmt.num(12.6), '13');
  assert.equal(fmt.approx(1027), '1,030');
  assert.equal(fmt.approx(87), '87');
  assert.equal(fmt.compact(950), '950');
  assert.equal(fmt.compact(1200), '1.2K');
  assert.equal(fmt.compact(11000), '11K');
  assert.equal(fmt.compact(1300000), '1.3M');
  assert.equal(fmt.range(1030, 1767), '1,030–1,767');
  assert.equal(fmt.range(40, 40), '40');
  assert.equal(fmt.rangeSpoken(1030, 1767), '1,030 to 1,767');
});

test('shares', () => {
  assert.equal(fmt.pct(0.16), '16%');
  assert.equal(fmt.pct(0.004), 'under 1%');
  assert.equal(fmt.pct(0), '0%');
  assert.equal(fmt.pctRange(0.09, 0.16), '9–16%');
});

test('frac picks the simplest fraction within two points', () => {
  assert.equal(fmt.frac(0.5), 'about half');
  assert.equal(fmt.frac(0.46), 'about half');
  assert.equal(fmt.frac(0.66), '2 in 3');
  assert.equal(fmt.frac(0.33), '1 in 3');
  assert.equal(fmt.frac(0.79), '4 in 5');
  assert.equal(fmt.frac(0.73), '3 in 4');
  assert.equal(fmt.frac(0.1), '1 in 10');
  assert.equal(fmt.frac(0.07), '1 in 20');
  assert.equal(fmt.frac(0.92), '92%');
});

test('times', () => {
  assert.equal(fmt.times(0.5), 'half');
  assert.equal(fmt.times(1.8), 'nearly twice');
  assert.equal(fmt.times(2), 'about twice');
  assert.equal(fmt.times(2.2), 'more than twice');
  assert.equal(fmt.times(2.3), '2.3 times');
  assert.equal(fmt.times(3), 'about three times');
  assert.equal(fmt.times(12.4), '12.4 times');
});

test('bytes and seconds', () => {
  assert.equal(fmt.bytes(920_000), '920 KB');
  assert.equal(fmt.bytes(812_000_000), '812 MB');
  assert.equal(fmt.bytes(12_400_000_000), '12.4 GB');
  assert.equal(fmt.bytes(500), '500 B');
  assert.equal(fmt.secs(680), '0.68 s');
  assert.equal(fmt.secs(1440), '1.4 s');
  assert.equal(fmt.secs(2000), '2 s');
  assert.equal(fmt.ms(64), '64 ms');
});

test('dates are UTC', () => {
  assert.equal(fmt.day('2026-09-24', 'short'), 'Thu 24 Sep');
  assert.equal(fmt.day('2026-09-24', 'long'), 'Thursday 24 September');
  assert.equal(fmt.day('2026-09-24', 'axis'), '24 Sep');
  assert.equal(fmt.day('2026-09-24', 'eyebrow'), 'THU 24 SEP');
  assert.equal(fmt.span('2026-09-18', '2026-10-17'), '18 Sep–17 Oct');
  assert.equal(fmt.utcStamp('2026-10-18T00:24:10Z'), 'SUN 18 OCT, 00:24 UTC');
  assert.equal(fmt.localStamp('2026-10-18T00:24:10Z', 'America/New_York'), 'Sat 17 Oct, 8:24 pm your time');
  assert.equal(fmt.utcMidnightLocal('America/New_York', new Date('2026-10-17T12:00:00Z')), '8 pm');
  assert.equal(fmt.utcMidnightLocal('Asia/Kolkata', new Date('2026-10-17T12:00:00Z')), '5:30 am');
});

test('clock words', () => {
  assert.equal(fmt.hourLabel(0), 'midnight');
  assert.equal(fmt.hourLabel(720), 'noon');
  assert.equal(fmt.hourLabel(1200), '8 pm');
  assert.equal(fmt.hourLabel(330), '5:30 am');
  assert.equal(fmt.hourSpan(1200), '8–9 pm');
  assert.equal(fmt.hourSpan(1380), '11 pm–midnight');
  assert.equal(fmt.hourSpan(330), '5:30–6:30 am');
  assert.equal(fmt.hourSpan(660), '11 am–noon');
  assert.equal(fmt.hourSpan(690), '11:30 am–12:30 pm');
  assert.equal(fmt.tzCity('America/New_York'), 'New York');
  assert.equal(fmt.tzCity('UTC'), 'UTC');
});

test('words for years, places and lists', () => {
  assert.equal(fmt.yearsWord(7.1), 'seven years');
  assert.equal(fmt.yearsWord(1), 'a year');
  assert.equal(fmt.yearsWord(2.5), 'two and a half years');
  assert.equal(fmt.country('DE'), 'Germany');
  assert.equal(fmt.country('XX'), 'Unknown');
  assert.equal(fmt.country('T1'), 'Tor network');
  assert.equal(fmt.countryIn('US'), 'the United States');
  assert.equal(fmt.countryIn('DE'), 'Germany');
  assert.equal(fmt.list(['A', 'B', 'C']), 'A, B and C');
  assert.equal(fmt.list(['A']), 'A');
  assert.deepEqual(fmt.niceTicks(379), [0, 200, 400]);
});

test('a rounded low end never passes the high end', () => {
  assert.equal(fmt.range(105, 108), '108');
  assert.equal(fmt.rangeSpoken(1845, 1849), '1,849');
  assert.equal(fmt.range(1030, 1767), '1,030–1,767');
  assert.equal(fmt.range(1079.4, 1767), '1,080–1,767');
  assert.equal(fmt.range(38, 78), '38–78');
});

test('an exact low end is printed exactly, an estimate is rounded', () => {
  // 8 Oct in the fixture: 127 pages passed, the counter heard 165 (a swapped day)
  assert.equal(fmt.range({ lo: 127, hi: 165, loExact: true }), '127–165');
  assert.equal(fmt.rangeSpoken({ lo: 127, hi: 165, loExact: true }), '127 to 165');
  assert.equal(fmt.range({ lo: 1079, hi: 1767, loExact: false }), '1,080–1,767');
  assert.equal(fmt.range(1079, 1767), '1,080–1,767');
  assert.equal(fmt.range({ lo: 165, hi: 165, loExact: true }), '165');
  assert.equal(fmt.lowSpoken({ lo: 1079, loExact: false }), 'about 1,080');
  assert.equal(fmt.lowSpoken({ lo: 1079, loExact: true }), '1,079');
  assert.equal(fmt.lowSpoken({ lo: 87, loExact: false }), '87');
});
