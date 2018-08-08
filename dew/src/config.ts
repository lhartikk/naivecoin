var mode: string = 'local';
var cloudServer = 'localhost:7001';



const getMode = ():string => {return mode;};
const setMode = (s: string) => {mode = s};
const getCloud = (): string => {return cloudServer};
const setCloud = (addressPort: string) => {cloudServer = addressPort};

export {setMode, getMode, getCloud, setCloud};
