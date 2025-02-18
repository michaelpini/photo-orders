import {getImageMeta, transformDateTime, transformSize, transformUnits, truncateStr} from "./util";

describe('utils: transformSize', () => {
    it('transformSize(6073) should be 5.93 KB', () => {
        expect(transformSize(6073)).toBe('5.93 KB');
    });

    it('transformSize(15075000) should be 14.4 MB', () => {
        expect(transformSize(15075000)).toBe('14.4 MB');
    });

    it('transformSize(15100100100) should be 14.1 GB', () => {
        expect(transformSize(15100100100)).toBe('14.1 GB');
    });

    it('transformSize(12345, 3) should be 12.056 KB', () => {
        expect(transformSize(12345, 3)).toBe('12.056 KB');
    });
})

describe('utils: transformUnits', () => {
    it("transformUnits(0, 'none', 'man', 'men') should be 'none'", () => {
        expect(transformUnits(0, 'none', 'man', 'men')).toBe('none');
    });

    it("transformUnits(1, 'none', 'man', 'men') should be '1 man'", () => {
        expect(transformUnits(1, 'none', 'man', 'men')).toBe('1 man');
    });

    it("transformUnits(2, 'none', 'man', 'men') should be '2 men'", () => {
        expect(transformUnits(2, 'none', 'man', 'men')).toBe('2 men');
    });
})

describe('utils: transformDateTime', () => {
    let myDate = new Date('2024-12-30T18:30:40');
    it("transformDateTime(myDate, 'ymd', '') should be '2024-12-30'", () => {
        expect(transformDateTime(myDate, 'ymd', '')).toBe('2024-12-30');
    });

    it("transformDateTime(myDate, 'dmy', '') should be '30.12.2024'", () => {
        expect(transformDateTime(myDate, 'dmy', '')).toBe('30.12.2024');
    });

    it("transformDateTime(myDate, 'mdy', '') should be '12/30/2024'", () => {
        expect(transformDateTime(myDate, 'mdy', '')).toBe('12/30/2024');
    });

    it("transformDateTime(myDate, '', 'hm') should be '18:30'", () => {
        expect(transformDateTime(myDate, '', 'hm')).toBe('18:30');
    });

    it("transformDateTime(myDate, '', 'hms') should be '18:30:40'", () => {
        expect(transformDateTime(myDate, '', 'hms')).toBe('18:30:40');
    });

    it("transformDateTime(myDate, 'dmy', 'hm') should be '30.12.2024 18:30'", () => {
        expect(transformDateTime(myDate, 'dmy', 'hm')).toBe('30.12.2024 18:30');
    });

    it("transformDateTime(myDate, 'dmy', 'hms', ', ') should be '30.12.2024, 18:30:40'", () => {
        expect(transformDateTime(myDate, 'dmy', 'hms', ', ')).toBe('30.12.2024, 18:30:40');
    });
})

describe('utils: truncateStr', () => {
    it("truncateStr('This sentence is way too long', 20) should be 'This sent...too long", () => {
        expect(truncateStr('This sentence is way too long', 20)).toBe('This sent...too long');
    })

    it("truncateStr('This sentence is ok!', 20) should be 'This sentence is ok!", () => {
        expect(truncateStr('This sentence is ok!', 20)).toBe('This sentence is ok!');
    })

    it("truncateStr('This is a long sentence, which needs to be shortened', 25) should have 25 characters", () => {
        expect(truncateStr('This sentence is ok!', 25).length).toBeLessThanOrEqual(25);
    })

})

describe('utils: getImageMeta', async () => {
    it("getImageMeta('KevinPini_600x400.jpg' should return promise with correct file info", async () => {
        const response = await fetch('KevinPini_600x400.jpg');
        const blob = await response.blob();
        const file = new File([blob], 'KevinPini_600x400.jpg', {type: blob.type});
        const meta = await getImageMeta(file);
        expect(meta.width).toBe(600);
        expect(meta.height).toBe(399);
        expect(meta.fileName).toBe('KevinPini_600x400')
        expect(meta.fileExtension).toBe('jpg');
    });

    it("getImageMeta('KevinPini_1000x666.jpg' should return promise with correct file info", async () => {
        const response = await fetch('KevinPini_1000x666.jpg');
        const blob = await response.blob();
        const file = new File([blob], 'KevinPini_1000x666.jpg', {type: blob.type});
        const meta = await getImageMeta(file);
        expect(meta.width).toBe(1000);
        expect(meta.height).toBe(665);
        expect(meta.fileName).toBe('KevinPini_1000x666')
        expect(meta.fileExtension).toBe('jpg');
    });

})

