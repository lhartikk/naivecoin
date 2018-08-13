let dewAddress = '127.0.0.1:6001';
//let dewAddress = '192.168.1.114:6001';
//If dew address is not correct, it can also be set using HTTP command. See Readme.



const getDew = (): string => {return dewAddress};
const setDew = (address: string) => {dewAddress = address};
export {getDew, setDew};
