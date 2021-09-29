import { relativeTime, formatRelativeTimeToString } from '../relativeTime';

describe('relativeTime', () => {
    it('relativeTime returns the correct time difference.', () => {
        const current = new Date(2021, 12, 31, 23, 59, 59, 999);
        expect(relativeTime(current, new Date(2022, 1, 1, 0, 0, 0, 0))).toStrictEqual(null);
        expect(relativeTime(current, new Date(2021, 12, 31, 23, 59, 59, 0))).toStrictEqual({ value: 0, unit: 'second' });
        expect(relativeTime(current, new Date(2021, 12, 31, 23, 59, 58, 0))).toStrictEqual({ value: 1, unit: 'second' });
        expect(relativeTime(current, new Date(2021, 12, 31, 23, 59, 22, 0))).toStrictEqual({ value: 37, unit: 'second' });
        expect(relativeTime(current, new Date(2021, 12, 31, 23, 58, 59, 0))).toStrictEqual({ value: 1, unit: 'minute' });
        expect(relativeTime(current, new Date(2021, 12, 31, 23, 33, 59, 0))).toStrictEqual({ value: 26, unit: 'minute' });
        expect(relativeTime(current, new Date(2021, 12, 31, 22, 33, 59, 0))).toStrictEqual({ value: 1, unit: 'hour' });
        expect(relativeTime(current, new Date(2021, 12, 31, 0, 33, 59, 0))).toStrictEqual({ value: 23, unit: 'hour' });
        expect(relativeTime(current, new Date(2021, 12, 30, 23, 59, 59, 999))).toStrictEqual({ value: 1, unit: 'day' });
        expect(relativeTime(current, new Date(2021, 12, 2, 23, 59, 59, 999))).toStrictEqual({ value: 29, unit: 'day' });
        expect(relativeTime(current, new Date(2021, 12, 1, 23, 59, 59, 999))).toStrictEqual({ value: 1, unit: 'month' });
        expect(relativeTime(current, new Date(2021, 3, 1, 0, 0, 0, 0))).toStrictEqual({ value: 10, unit: 'month' });
        expect(relativeTime(current, new Date(2020, 12, 31, 23, 59, 59, 0))).toStrictEqual({ value: 1, unit: 'year' });
        expect(relativeTime(current, new Date(2005, 1, 1, 0, 0, 0, 0))).toStrictEqual({ value: 17, unit: 'year' });
    });

    it('formatRelativeTimeToString formats both singular and plural.', () => {
        const current = new Date(2021, 12, 31, 23, 59, 59, 999);
        expect(formatRelativeTimeToString(current, new Date(2022, 1, 1, 0, 0, 0, 0))).toStrictEqual(null);
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 23, 59, 59, 0))).toStrictEqual("0 seconds ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 23, 59, 58, 0))).toStrictEqual("1 second ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 23, 59, 22, 0))).toStrictEqual("37 seconds ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 23, 58, 59, 0))).toStrictEqual("1 minute ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 23, 33, 59, 0))).toStrictEqual("26 minutes ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 22, 33, 59, 0))).toStrictEqual("1 hour ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 31, 0, 33, 59, 0))).toStrictEqual("23 hours ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 30, 23, 59, 59, 999))).toStrictEqual("1 day ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 2, 23, 59, 59, 999))).toStrictEqual("29 days ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 12, 1, 23, 59, 59, 999))).toStrictEqual("1 month ago");
        expect(formatRelativeTimeToString(current, new Date(2021, 3, 1, 0, 0, 0, 0))).toStrictEqual("10 months ago");
        expect(formatRelativeTimeToString(current, new Date(2020, 12, 31, 23, 59, 59, 0))).toStrictEqual("1 year ago");
        expect(formatRelativeTimeToString(current, new Date(2005, 1, 1, 0, 0, 0, 0))).toStrictEqual("17 years ago");
    });
});
