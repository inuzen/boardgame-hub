export const shuffle = <T>(a: T[], b?: any, c?: any, d?: any): T[] => {
    //array,placeholder,placeholder,placeholder
    c = a.length;
    while (c) (b = (Math.random() * c--) | 0), (d = a[c]), (a[c] = a[b]), (a[b] = d);
    return a;
};

export const compareObjectsAndLog = (obj1: { [x: string]: any }, obj2: { [x: string]: any }, path = '') => {
    for (let key in obj1) {
        if (
            typeof obj1[key] === 'object' &&
            obj1[key] !== null &&
            typeof obj2[key] === 'object' &&
            obj2[key] !== null
        ) {
            compareObjectsAndLog(obj1[key], obj2[key], `${path}.${key}`);
        } else if (obj1[key] !== obj2[key]) {
            console.log(`${path}.${key}: changed from ${obj1[key]} to ${obj2[key]}`);
        }
    }
};
