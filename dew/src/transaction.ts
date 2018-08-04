import * as CryptoJS from 'crypto-js';
import * as ecdsa from 'elliptic';
import * as _ from 'lodash';

//dewcoin
import {getCurrentTimestamp} from './blockchain';

const ec = new ecdsa.ec('secp256k1');
const COINBASE_AMOUNT: number = 50;

//dewcoin
const ACCOUNT_ACTIVE_PERIOD: number = 60*60*24*31; //31 days.
const ACCOUNT_PURGE_PERIOD: number = 60*60*24*32; //32 days.

/*
class UnspentTxOut {
    public readonly txOutId: string;
    public readonly txOutIndex: number;
    public readonly address: string;
    public readonly amount: number;

    constructor(txOutId: string, txOutIndex: number, address: string, amount: number) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}
*/
class Account {
    public readonly address: string;
    public balance: number;
    public txHistory: TxHistory[];

    constructor(address: string) {
        this.address = address;
        this.balance = 0;
        this.txHistory = [];
    }
}



/*
class TxIn {
    public txOutId: string;
    public txOutIndex: number;
    public signature: string;
}

class TxOut {
    public address: string;
    public amount: number;

    constructor(address: string, amount: number) {
        this.address = address;
        this.amount = amount;
    }
}
class Transaction {

    public id: string;

    public txIns: TxIn[];
    public txOuts: TxOut[];
}
*/
class Transaction {
    public id: string;
    public sender: string;
    public receiver: string;
    public amount: number;
    public timestamp: number;
    public signature: string;

    constructor(sender: string, receiver: string, amount: number) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
    }
}
class TxHistory {
    public id: string;
    public txAccount: string; //the account that this transaction involvs.
    public prevBalance: number;
    public amount: number; // plus or minus. reflect the change of the balance.
    public afterBalance: number;
    public timestamp: number;

    constructor(txAccount: string, amount: number) {
        this.txAccount = txAccount;
        this.amount = amount;
    }
}

/*
const getTransactionId = (transaction: Transaction): string => {
    const txInContent: string = transaction.txIns
        .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, '');

    const txOutContent: string = transaction.txOuts
        .map((txOut: TxOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
};
*/
const getTransactionId = (transaction: Transaction): string => {
    return CryptoJS.SHA256(transaction.sender + transaction.receiver + transaction.amount + transaction.timestamp).toString();
};



/*
const validateTransaction = (transaction: Transaction, aUnspentTxOuts: UnspentTxOut[]): boolean => {

    if (!isValidTransactionStructure(transaction)) {
        return false;
    }

    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid tx id: ' + transaction.id);
        return false;
    }
    const hasValidTxIns: boolean = transaction.txIns
        .map((txIn) => validateTxIn(txIn, transaction, aUnspentTxOuts))
        .reduce((a, b) => a && b, true);

    if (!hasValidTxIns) {
        console.log('some of the txIns are invalid in tx: ' + transaction.id);
        return false;
    }

    const totalTxInValues: number = transaction.txIns
        .map((txIn) => getTxInAmount(txIn, aUnspentTxOuts))
        .reduce((a, b) => (a + b), 0);

    const totalTxOutValues: number = transaction.txOuts
        .map((txOut) => txOut.amount)
        .reduce((a, b) => (a + b), 0);

    if (totalTxOutValues !== totalTxInValues) {
        console.log('totalTxOutValues !== totalTxInValues in tx: ' + transaction.id);
        return false;
    }

    return true;
};
*/
const existAccount = (address: string, accounts: Account[]): boolean => {
    return _(accounts).map((acc: Account) => acc.address).includes(address);
}
const createAccount = (address: string, accounts: Account[]): boolean => {
    var acc: Account = new Account(address);
    accounts.push(acc);
    return true;
}
const findAccount = (address: string, accounts: Account[]): Account => {
    var account: Account = _.find(accounts, (acc: Account) => {return acc.address == address});
    return account;
}
const validateTransaction = (transaction: Transaction, accounts: Account[]): boolean => {

    if (!isValidTransactionStructure(transaction)) {
        return false;
    }

    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid tx id: ' + transaction.id);
        return false;
    }

    const hasValidSignature: boolean = validateSignature(transaction);
    if (!hasValidSignature) {
        console.log('The signature is invalid in tx: ' + transaction.id);
        return false;
    }
    accSender = _.find(accounts, (acc: Account) => {return acc.address == transaction.sender});
    if (transaction.amount > accSender.balance) {
        console.log('The sender does not have enough coins. tx: ' + transaction.id);
        return false;
    }
    if (transaction.timestamp < (getCurrentTimestamp() - ACCOUNT_ACTIVE_PERIOD)){
        console.log('The transaction is too old. tx: ' + transaction.id);
        return false;
    }
    if (_(accSender.txHistory).map((th: TxHistory) => th.id).includes(transaction.id)){
        console.log('The transaction is duplicated. tx: ' + transaction.id);
        return false;
    }

    return true;
};



/*
const validateBlockTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number): boolean => {
    const coinbaseTx = aTransactions[0];
    if (!validateCoinbaseTx(coinbaseTx, blockIndex)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
    }

    const txIns: TxIn[] = _(aTransactions)
        .map((tx) => tx.txIns)
        .flatten()
        .value();

    if (hasDuplicates(txIns)) {
        return false;
    }

    // all but coinbase transactions
    const normalTransactions: Transaction[] = aTransactions.slice(1);
    return normalTransactions.map((tx) => validateTransaction(tx, aUnspentTxOuts))
        .reduce((a, b) => (a && b), true);

};
*/
const validateBlockTransactions = (aTransactions: Transaction[], accounts: Account[]): boolean => {
    const coinbaseTx = aTransactions[0];
    if (!validateCoinbaseTx(coinbaseTx)) {
        console.log('invalid coinbase transaction: ' + JSON.stringify(coinbaseTx));
        return false;
    }
    const txIds: number[] = _(aTransactions)
        .map((tx) => tx.id)
        .value();

    if (hasDuplicates(txIds)) {
        return false;
    }

    // all but coinbase transactions
    const normalTransactions: Transaction[] = aTransactions.slice(1);
    return normalTransactions.map((tx) => validateTransaction(tx, accounts))
        .reduce((a, b) => (a && b), true);
};


/*
const hasDuplicates = (txIns: TxIn[]): boolean => {
    const groups = _.countBy(txIns, (txIn: TxIn) => txIn.txOutId + txIn.txOutIndex);
    return _(groups)
        .map((value, key) => {
            if (value > 1) {
                console.log('duplicate txIn: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
};
*/
const hasDuplicates = (nums: number[]): boolean => {
    const groups = _.countBy(nums);
    return _(groups)
        .map((value, key) => {
            if (value > 1) {
                console.log('duplicate number: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
};


/*
const validateCoinbaseTx = (transaction: Transaction, blockIndex: number): boolean => {
    if (transaction == null) {
        console.log('the first transaction in the block must be coinbase transaction');
        return false;
    }
    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid coinbase tx id: ' + transaction.id);
        return false;
    }
    if (transaction.txIns.length !== 1) {
        console.log('one txIn must be specified in the coinbase transaction');
        return;
    }
    if (transaction.txIns[0].txOutIndex !== blockIndex) {
        console.log('the txIn signature in coinbase tx must be the block height');
        return false;
    }
    if (transaction.txOuts.length !== 1) {
        console.log('invalid number of txOuts in coinbase transaction');
        return false;
    }
    if (transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
        console.log('invalid coinbase amount in coinbase transaction');
        return false;
    }
    return true;
};
*/
const validateCoinbaseTx = (transaction: Transaction): boolean => {
    if (transaction == null) {
        console.log('the first transaction in the block must be coinbase transaction');
        return false;
    }
    if (getTransactionId(transaction) !== transaction.id) {
        console.log('invalid coinbase tx id: ' + transaction.id);
        return false;
    }
    if (transaction.sender !== "coinbase") {
        console.log('It is not a coinbase transaction');
        return;
    }
    if (transaction.amount !== COINBASE_AMOUNT) {
        console.log('invalid coinbase amount in coinbase transaction');
        return false;
    }
    return true;
};



/*
const validateTxIn = (txIn: TxIn, transaction: Transaction, aUnspentTxOuts: UnspentTxOut[]): boolean => {
    const referencedUTxOut: UnspentTxOut =
        aUnspentTxOuts.find((uTxO) => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if (referencedUTxOut == null) {
        console.log('referenced txOut not found: ' + JSON.stringify(txIn));
        return false;
    }
    const address = referencedUTxOut.address;

    const key = ec.keyFromPublic(address, 'hex');
    const validSignature: boolean = key.verify(transaction.id, txIn.signature);
    if (!validSignature) {
        console.log('invalid txIn signature: %s txId: %s address: %s', txIn.signature, transaction.id, referencedUTxOut.address);
        return false;
    }
    return true;
};
*/
const validateSignature = (transaction: Transaction): boolean => {
    const key = ec.keyFromPublic(transaction.sender, 'hex');
    const validSignature: boolean = key.verify(transaction.id, transaction.signature);
    if (!validSignature) {
        console.log('invalid tx signature: %s txId: %s address: %s', transaction.signature, transaction.id, transaction.sender);
        return false;
    }
    return true;
};



/*
const getTxInAmount = (txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number => {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
};
const findUnspentTxOut = (transactionId: string, index: number, aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut => {
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
};
*/


/*
const getCoinbaseTransaction = (address: string, blockIndex: number): Transaction => {
    const t = new Transaction();
    const txIn: TxIn = new TxIn();
    txIn.signature = '';
    txIn.txOutId = '';
    txIn.txOutIndex = blockIndex;

    t.txIns = [txIn];
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
    t.id = getTransactionId(t);
    return t;
};
*/
const getCoinbaseTransaction = (miner: string): Transaction => {
    const t = new Transaction("coinbase", miner, COINBASE_AMOUNT);
    t.timestamp = getCurrentTimestamp();
    t.id = getTransactionId(t);
    return t;
};


/*
const signTxIn = (transaction: Transaction, txInIndex: number,
                  privateKey: string, aUnspentTxOuts: UnspentTxOut[]): string => {
    const txIn: TxIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    const referencedUnspentTxOut: UnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
        console.log('could not find referenced txOut');
        throw Error();
    }
    const referencedAddress = referencedUnspentTxOut.address;

    if (getPublicKey(privateKey) !== referencedAddress) {
        console.log('trying to sign an input with private' +
            ' key that does not match the address that is referenced in txIn');
        throw Error();
    }
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature: string = toHexString(key.sign(dataToSign).toDER());

    return signature;
};
*/
const signTransaction = (transaction: Transaction, privateKey: string): string => {
    const dataToSign = transaction.id;
    if (getPublicKey(privateKey) !== transaction.sender) {
        console.log('trying to sign an input with private' +
            ' key that does not match the address');
        throw Error();
    }
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature: string = toHexString(key.sign(dataToSign).toDER());

    return signature;
};


/*
const updateUnspentTxOuts = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut[] => {
    const newUnspentTxOuts: UnspentTxOut[] = aTransactions
        .map((t) => {
            return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount));
        })
        .reduce((a, b) => a.concat(b), []);

    const consumedTxOuts: UnspentTxOut[] = aTransactions
        .map((t) => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    const resultingUnspentTxOuts = aUnspentTxOuts
        .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
};
*/
const updateAccounts = (aTransactions: Transaction[], accounts: Account[]): Account[] => {
	var amt: number;
	var thSender: TxHistory;
	var thReceiver: TxHistory;
	var accSender: Account;
	var accReceiver: Account;
	var now: number;

	for(var i=0; i<aTransactions.length; i++){
		amt = aTransactions[i].amount;
		now = getCurrentTimestamp();
		if(aTransactions[i].sender !== "coinbase"){
	    		if (!exsitAccount(aTransactions[i].sender, accounts)) {
        			createAccount(aTransactions[i].sender, accounts);
    			}
			accSender = findAccount(aTransactions[i].sender, accounts);
		thSender = new TxHistory(aTransactions[i].receiver, -amt);
		thSender.id = aTransactions[i].id;
		thSender.timestamp = aTransactions[i].timestamp;
		thSender.prevBalance = accSender.balance;
		accSender.balance -= amt;
		thSender.afterBalance = accSender.balance;
		accSender.txHistory = _(accSender.txHistory).filter((th: TxHistory) => {th.timsstamp < (now + ACCOUNT_PURGE_PERIOD)}).push(thSender);
			//clean txHistory at the same time.
		}
    		if (!exsitAccount(aTransactions[i].receiver, accounts)) {
        		createAccount(aTransactions[i].receiver, accounts);
    		}
		accReceiver = findAccount(aTransactions[i].receiver, accounts);
		thReceiver = new TxHistory(aTransactions[i].sender, amt);
		thReceiver.id = aTransactions[i].id;
		thReceiver.timestamp = aTransactions[i].timestamp;
		thReceiver.prevBalance = accReceiver.balance;
		accReceiver.balance += amt;
		thReceiver.afterBalance = accSender.balance;
		accReceiver.txHistory = _(accReceiver.txHistory).filter((th: TxHistory) => {th.timsstamp < (now + ACCOUNT_PURGE_PERIOD)}).push(thReceiver);
		//clean txHistory at the same time.
	}
    return accounts;//check again
};


/*
const processTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number) => {

    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};
*/
const processTransactions = (aTransactions: Transaction[], accounts: Account[]) => {

    if (!validateBlockTransactions(aTransactions, accounts)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateAccounts(aTransactions, accounts);
};




const toHexString = (byteArray): string => {
    return Array.from(byteArray, (byte: any) => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
};

const getPublicKey = (aPrivateKey: string): string => {
    return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
};


/*
const isValidTxInStructure = (txIn: TxIn): boolean => {
    if (txIn == null) {
        console.log('txIn is null');
        return false;
    } else if (typeof txIn.signature !== 'string') {
        console.log('invalid signature type in txIn');
        return false;
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('invalid txOutId type in txIn');
        return false;
    } else if (typeof  txIn.txOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn');
        return false;
    } else {
        return true;
    }
};
const isValidTxOutStructure = (txOut: TxOut): boolean => {
    if (txOut == null) {
        console.log('txOut is null');
        return false;
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut');
        return false;
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address');
        return false;
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut');
        return false;
    } else {
        return true;
    }
};
*/



/*
const isValidTransactionStructure = (transaction: Transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    if (!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }
    if (!transaction.txIns
            .map(isValidTxInStructure)
            .reduce((a, b) => (a && b), true)) {
        return false;
    }

    if (!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }

    if (!transaction.txOuts
            .map(isValidTxOutStructure)
            .reduce((a, b) => (a && b), true)) {
        return false;
    }
    return true;
};
*/
const isValidTransactionStructure = (transaction: Transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    if (typeof transaction.sender !== 'string') {
        console.log('transaction sender missing');
        return false;
    }
    if (typeof transaction.receiver !== 'string') {
        console.log('transaction receiver missing');
        return false;
    }
    if (typeof transaction.amount !== 'number') {
        console.log('transaction amount missing');
        return false;
    }
    if (typeof transaction.timsstamp !== 'number') {
        console.log('transaction timestamp missing');
        return false;
    }
    if (typeof transaction.signature !== 'string') {
        console.log('transaction signature missing');
        return false;
    }
    return true;
};


// valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
const isValidAddress = (address: string): boolean => {
    if (address.length !== 130) {
        console.log(address);
        console.log('invalid public key length');
        return false;
    } else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('04')) {
        console.log('public key must start with 04');
        return false;
    }
    return true;
};


/*
export {
    processTransactions, signTxIn, getTransactionId, isValidAddress, validateTransaction,
    UnspentTxOut, TxIn, TxOut, getCoinbaseTransaction, getPublicKey, hasDuplicates,
    Transaction
};
*/
export {
    processTransactions, signTransaction, getTransactionId, isValidAddress, validateTransaction,
    Account, getCoinbaseTransaction, getPublicKey, hasDuplicates,
    Transaction
};
//signTxIn => signTransaction
//UnspentTxOut => Account
//TxIn
//TxOut
