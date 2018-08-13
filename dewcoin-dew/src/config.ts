let mode: string = 'dew';
//If mode is dew and configured properly, dew can cloud can be automatically lined together through sockets.
//If mode is local, it has no connection with the cloud; it will have the complete blockchain. 
//modes can be switched through HTTP commands.

let cloudAddress = '127.0.0.1:7001';
//let cloudAddress = '192.168.1.114:7001';



const getMode = ():string => {return mode;};
const setMode = (s: string) => {mode = s};
const getCloud = (): string => {return cloudAddress};
const setCloud = (address: string) => {cloudAddress = address};

export {setMode, getMode, getCloud, setCloud};
