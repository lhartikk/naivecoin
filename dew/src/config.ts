let mode: string = 'dew';
let cloudAddress = '127.0.0.1:7001';



const getMode = ():string => {return mode;};
const setMode = (s: string) => {mode = s};
const getCloud = (): string => {return cloudAddress};
const setCloud = (address: string) => {cloudAddress = address};

export {setMode, getMode, getCloud, setCloud};
