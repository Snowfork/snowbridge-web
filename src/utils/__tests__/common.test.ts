import { shortenWalletAddress, formatToDecimalString } from '../common';

describe('shortenWalletAddress', () => {
  it('displays a short version of an address', () => {
    expect(
      shortenWalletAddress('0xda4F4d0123456789a4D771111b36512345DcB10C'),
    ).toBe('0xda4F...B10C');
  });
});

describe('formatToDecimalString', () => {
  test('Formats with correct decimal spaces', () => {
    expect(formatToDecimalString(20, 1)).toBe('20.0');
    expect(formatToDecimalString(20, 2)).toBe('20.00');
    expect(formatToDecimalString(20, 3)).toBe('20.000');
    expect(formatToDecimalString(20, 5)).toBe('20.00000');
    expect(formatToDecimalString(20, 10)).toBe('20.0000000000');
  });

  test("Doesn't round up/down when not needed", () => {
    expect(formatToDecimalString(59.93, 1)).toBe('59.9');
    expect(formatToDecimalString(59.93, 2)).toBe('59.93');
    expect(formatToDecimalString(99.95, 2)).toBe('99.95');
    expect(formatToDecimalString(99.98, 2)).toBe('99.98');
    expect(formatToDecimalString(99.99, 2)).toBe('99.99');
  });

  test('Rounds up correctly', () => {
    expect(formatToDecimalString(99.99, 1)).toBe('100.0');
    expect(formatToDecimalString(99.999, 2)).toBe('100.00');
  });

  test('Formats with a variety of inputs ', () => {
    expect(formatToDecimalString(12345, 2)).toBe('12345.00');
    expect(formatToDecimalString(9999.99, 2)).toBe('9999.99');
  });
});
