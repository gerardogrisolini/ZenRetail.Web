export class Helpers {

    static currency = 'EUR';
    static utc = 'UTC';

    static distinct(a: any[]): any[] {
        const seen: any = {};
        const out: any[] = [];
        const len = a.length;
        let j = 0;
        for (let i = 0; i < len; i++) {
            const item = a[i];
            if (seen[item.label] !== 1) {
                seen[item.label] = 1;
                out[j++] = item;
            }
        }
        return out;
    }

    static delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
