let dewAddress = '127.0.0.1:6001';

const getDew = (): string => {return dewAddress};
const setDew = (address: string) => {dewAddress = address};

export {getDew, setDew};
