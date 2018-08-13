import * as WebSocket from 'ws';
import {Server} from 'ws';
/*
import {
    addBlockToChain, Block, getBlockchain, getLatestBlock, handleReceivedTransaction, isValidBlockStructure,
    replaceChain
} from './blockchain';
*/
import {
    addBlockToChain, Block, getBlockchain, resetBlockchain, getLatestBlock, handleReceivedTransaction, validateAccount, isValidBlockStructure,
    replaceChain, setAccounts, getAccounts
} from './blockchain';
//import {Transaction} from './transaction';
import {Transaction, Account} from './transaction';
import {getTransactionPool} from './transactionPool';

//dewcoin
import {getMode, setMode, getCloud} from './config';

let mode: string;
let wsCloud: WebSocket;
const getWsCloud = (): WebSocket => wsCloud;

const sockets: WebSocket[] = [];

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
    server.on('connection', (ws: WebSocket) => {
        //incoming connections.
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
    mode = getMode();
    if(mode == 'dew'){
	   setModeDew();
    }else if(mode == 'local'){
	   setModeLocal()
    };
    console.log('running on ' + mode + ' mode.');
};

const getSockets = () => sockets;


const initConnection = (ws: WebSocket) => {
    console.log('A socket is added: ' + ws.url);
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());

    // query transactions pool only some time after chain query
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
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
	   mode = getMode();
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
                    if(mode == 'local'){
                        write(ws, responseChainMsg());
                    }
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
                    console.log('Alternate address received: %s', message.data);
                    if(getMode() == 'dew'){
                        write(wsCloud, message);
                    } else {
                        connectToPeers('ws://' + message.data);
                    }
                    break;
            }            
        } catch (e) {
            console.log(e);
        }
        console.log('message processing]');
    });
};


//for cloud-dew channel
const initCloudMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
	   
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
                    write(ws, responseAccountsMsg());
                    break;
                case MessageType.RESPONSE_ACCOUNTS:
                    const receivedAccounts: Account[] = JSONToObject<Account[]>(message.data);
                    if (receivedAccounts === null) {
                        console.log('invalid accounts received: %s', JSON.stringify(message.data));
                        break;
                    }
                    receivedAccounts.forEach((account: Account) => {
                        try {
                            validateAccount(account);
                            // if no error is thrown, accounts is valid
                        } catch (e) {
                            console.log(e.message);
                        }
                    });
                    setAccounts(receivedAccounts);
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
	mode = getMode();
	if(mode == 'dew'){
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

const queryAccountsMsg = (): Message => ({
    'type': MessageType.QUERY_ACCOUNTS,
    'data': JSON.stringify(getAccounts())
});

const responseAccountsMsg = (): Message => ({
    'type': MessageType.RESPONSE_ACCOUNTS,
    'data': JSON.stringify(getAccounts())
});

const alternateAddressMsg = (address: string): Message => ({
    'type': MessageType.ALTERNATE_ADDRESS,
    'data': address
});

const sendMiningRequest = (newBlock: Block) => (
    write(wsCloud, {'type': MessageType.MINING_REQUEST, 'data': JSON.stringify(newBlock)})
);


const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const fetchAccounts = (): void => {
    if((typeof wsCloud !== undefined) && (wsCloud.readyState == 1)){
        write(wsCloud, queryAccountsMsg());
        console.log('Accounts fetched.');
    } else {
        console.log('Accounts fetch failed.');
    }
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

/*
const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};
*/
const connectToPeers = (newPeer: string): void => {
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        if(getMode() == 'dew'){
            write(ws, alternateAddressMsg(getCloud()));
        }
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};


const setModeLocal = () => {
	setMode('local');
	mode = getMode();
    	console.log('running on ' + mode + ' mode.');
	connectToPeers('ws://' + getCloud());
	if (typeof wsCloud !== "undefined") {
		wsCloud.close();
	};
	broadcast(queryChainLengthMsg());
  	//query transactions pool only some time after chain query
    	setTimeout(() => {
        	broadcast(queryTransactionPoolMsg());
    	}, 500);
};

const setModeDew = () => {
	setMode('dew');
	mode = getMode();
	console.log('running on ' + mode + ' mode.');

	wsCloud = new WebSocket('ws://' + getCloud());
    	wsCloud.on('open', () => {
        	console.log('connection with the cloud established');
    		initCloudMessageHandler(wsCloud);
           resetBlockchain();

    		write(wsCloud, queryChainLengthMsg());
    		//query transactions pool only some time after chain query
    		setTimeout(() => {
    		     write(wsCloud, queryTransactionPoolMsg());
        		//broadcast(queryTransactionPoolMsg());
    		}, 500);
    	});
    	wsCloud.on('error', () => {
        	console.log('connection with the cloud failed');
    	});
    	wsCloud.on('close', () => {
        	console.log('connection with the cloud was closed');
    	});

};


//export {connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets};
export {connectToPeers, broadcastLatest, broadCastTransactionPool, initP2PServer, getSockets, 
setModeLocal, setModeDew, fetchAccounts, sendMiningRequest};
