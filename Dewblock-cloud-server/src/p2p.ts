import * as WebSocket from 'ws';
import {Server} from 'ws';
/*
import {
    addBlockToChain, Block, getBlockchain, getLatestBlock, handleReceivedTransaction, validateAccount, isValidBlockStructure,
    replaceChain
} from './blockchain';
*/
import {
    addBlockToChain, Block, getBlockchain, getLatestBlock, handleReceivedTransaction, validateAccount, isValidBlockStructure,
    replaceChain, setAccounts, getAccounts, findBlock
} from './blockchain';
//import {Transaction} from './transaction';
import {Transaction, Account, verifyAccounts} from './transaction';
import {getTransactionPool} from './transactionPool';

//dewcoin
import {getDew} from './config';

const sockets: WebSocket[] = [];
const getSockets = () => sockets;

//dewcoin
let wsCloud: WebSocket;


enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4,
    QUERY_ACCOUNTS = 5,
    RESPONSE_ACCOUNTS = 6,
    ALTERNATE_ADDRESS = 7,
    MINING_REQUEST = 8
}

class Message {
    public type: MessageType;
    public data: any;
}


/*
const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};
*/
const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});
    server.on('connection', (ws: WebSocket, req) => {
        console.log('New websocket connection from %s:%d', req.connection.remoteAddress.substring(7), req.connection.remotePort);
        const dew: string = getDew();
        const address: string = dew.substring(0, dew.search(':'));
        //console.log('Address: %s', address);
        if(req.connection.remoteAddress.substring(7) == address){
            initCloudConnection(ws);
        }else{
            initConnection(ws);
        }
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};


/*
const initConnection = (ws: WebSocket) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // query transactions pool only some time after chain query
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
    }, 500);
};
*/
const initConnection = (ws: WebSocket) => {
    console.log('A socket is created: ' + ws.url);
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // query transactions pool only some time after chain query
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
    }, 500);
};


const initCloudConnection = (ws: WebSocket) => {
    console.log('Dew sent in connection.');
    wsCloud = ws;
    initCloudMessageHandler(wsCloud);
    wsCloud.on('error', () => {
	   console.log('connection with the dew failed');
    });
    wsCloud.on('close', () => {
        console.log('connection with the dew was closed');
    });
   
    write(wsCloud, queryChainLengthMsg());
    // query transactions pool only some time after chain query
    setTimeout(() => {
        write(wsCloud, queryTransactionPoolMsg());
    }, 500);
};



const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
};

/*
const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        try {
            const message: Message = JSONToObject<Message>(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('Received message: %s', JSON.stringify(message));
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions: Transaction[] = JSONToObject<Transaction[]>(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction: Transaction) => {
                        try {
                            handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });
};
*/
const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {

        try {
            const message: Message = JSONToObject<Message>(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('[Received message: %s', data);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions: Transaction[] = JSONToObject<Transaction[]>(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction: Transaction) => {
                        try {
                            handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
                case MessageType.ALTERNATE_ADDRESS:
                    //console.log('Alternate address received: %s', message.data);
                    //connectToPeers(message.data);
                    break;            
            }
        } catch (e) {
            console.log(e);
        }
        console.log('message processing]');
    });
};


const initCloudMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        //console.log('New message from %s:%d', req.connection.remoteAddress.substring(7), req.connection.remotePort);
	   
        try {
            const message: Message = JSONToObject<Message>(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            console.log('[Received cloud message: %s', data);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data));
                        break;
                    }
                    handleBlockchainResponse(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions: Transaction[] = JSONToObject<Transaction[]>(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedTransactions.forEach((transaction: Transaction) => {
                        try {
                            handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
                case MessageType.QUERY_ACCOUNTS:
                    const dewAccounts: Account[] = JSONToObject<Account[]>(message.data);
                    if (dewAccounts === null) {
                        console.log('invalid dew accounts received: %s', JSON.stringify(message.data));
                        break;
                    }
                    const consistent: boolean = verifyAccounts(dewAccounts, getAccounts());
                    if (!consistent){
                        write(ws, responseAccountsMsg());
                    }
                    break;
                case MessageType.RESPONSE_ACCOUNTS:
                    const receivedAccounts: Account[] = JSONToObject<Account[]>(message.data);
                    if (receivedAccounts === null) {
                        console.log('invalid account received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedAccounts.forEach((account: Account) => {
                        try {
                            validateAccount(account);
                            // if no error is thrown, account was indeed added to the account pool
                            // let's broadcast account pool
                            // broadCastTransactionPool();
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    setAccounts(receivedAccounts);
                    break;
                case MessageType.MINING_REQUEST:
                    const aBlock: Block = JSONToObject<Block>(message.data);
                    if (aBlock === null) {
                        console.log('invalid block received: %s', JSON.stringify(message.data));
                        break;
                    }
    			    const newBlock: Block = findBlock(aBlock.index, aBlock.previousHash, aBlock.timestamp, aBlock.data, aBlock.difficulty);
    			    if (addBlockToChain(newBlock)) {
        		        broadcastLatest();
    			    }
                    break;
                case MessageType.ALTERNATE_ADDRESS:
                    console.log('Alternate address received: %s', message.data);
                    connectToPeers('ws://' + message.data);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
        console.log('Cloud message processing]');
    });
};


const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
//const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));
const broadcast = (message: Message): void => {
	sockets.forEach((socket) => write(socket, message));
	if(wsCloud.readyState == 1){
		write(wsCloud, message);
	}
}

const queryChainLengthMsg = (): Message => ({'type': MessageType.QUERY_LATEST, 'data': null});

const queryAllMsg = (): Message => ({'type': MessageType.QUERY_ALL, 'data': null});

const responseChainMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getBlockchain())
});

const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

const queryTransactionPoolMsg = (): Message => ({
    'type': MessageType.QUERY_TRANSACTION_POOL,
    'data': null
});

const responseTransactionPoolMsg = (): Message => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL,
    'data': JSON.stringify(getTransactionPool())
});

const responseAccountsMsg = (): Message => ({
    'type': MessageType.RESPONSE_ACCOUNTS,
    'data': JSON.stringify(getAccounts())
});

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
    if (!isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    const latestBlockHeld: Block = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};

export {connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets};
