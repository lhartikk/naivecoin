//let dewAddress = '127.0.0.1:6001';
let dewAddress = '192.168.1.186:6001';
//let dewAddress = '192.168.1.114:6001';
//If dew address is not correct, it can also be set using HTTP command. See Readme.
//Please notice: if only one machine is involved in testing, default config files are OK. 
//If more than one machine is involved, config files should not use localhost or 127.0.0.1 at all.



const getDew = (): string => {return dewAddress};
const setDew = (address: string) => {dewAddress = address};
export {getDew, setDew};
