export const shuffle = <T>(a: T[], b?: any, c?: any, d?: any): T[] => {
    //array,placeholder,placeholder,placeholder
    c = a.length;
    while (c) (b = (Math.random() * c--) | 0), (d = a[c]), (a[c] = a[b]), (a[b] = d);
    return a;
};
