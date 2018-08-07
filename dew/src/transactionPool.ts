import * as _ from 'lodash';

//import {Transaction, TxIn, UnspentTxOut, validateTransaction} from './transaction';
import {Transaction, Account, findAccount, validateTransaction} from './transaction';

let transactionPool: Transaction[] = [];

const getTransactionPool = () => {
    return _.cloneDeep(transactionPool);
};

/*
const addToTransactionPool = (tx: Transaction, unspentTxOuts: UnspentTxOut[]) => {

    if (!validateTransaction(tx, unspentTxOuts)) {
        throw Error('Trying to add invalid tx to pool');
    }

    if (!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to add invalid tx to pool');
    }
    console.log('adding to txPool: %s', JSON.stringify(tx));
    transactionPool.push(tx);
};
*/
const addToTransactionPool = (tx: Transaction, accounts: Account[]) => {

    if (!validateTransaction(tx, accounts)) {
        throw Error('Trying to add invalid tx to pool. Tx: ' + tx.id);
    }

    if (!isValidTxForPool(tx, transactionPool, accounts)) {
        throw Error('Tx is not valid for the pool, Tx: ' + tx.id);
    }
    //console.log('adding to txPool: %s', JSON.stringify(tx));
    transactionPool.push(tx);
};

/*
const hasTxIn = (txIn: TxIn, unspentTxOuts: UnspentTxOut[]): boolean => {
    const foundTxIn = unspentTxOuts.find((uTxO: UnspentTxOut) => {
        return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
    });
    return foundTxIn !== undefined;
};
*/

/*
const updateTransactionPool = (unspentTxOuts: UnspentTxOut[]) => {
    const invalidTxs = [];
    for (const tx of transactionPool) {
        for (const txIn of tx.txIns) {
            if (!hasTxIn(txIn, unspentTxOuts)) {
                invalidTxs.push(tx);
                break;
            }
        }
    }
    if (invalidTxs.length > 0) {
        console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
        transactionPool = _.without(transactionPool, ...invalidTxs);
    }
};
*/
const updateTransactionPoolReplace = (accounts: Account[]) => {
    var accSender;

    transactionPool = _(transactionPool).uniqBy('id').filter(tx => validateTransaction(tx, accounts)).value();

    for(var i=0; i < accounts.length; i++){
        accounts[i].available = accounts[i].balance;
    }
    const invalidTxs = [];
    for (const tx of transactionPool) {
        accSender = findAccount(tx.sender, accounts);
        if(accSender == undefined){
        	console.log('updateTransactionPool: no account found.');
        	return false;
        }
        if (tx.amount > accSender.available) {
            console.log('The sender does not have enough coins. Transaction be removed from pool. tx: ' + tx.id);
            invalidTxs.push(tx);
        }else{
            accSender.available -=tx.amount;
        }
    }
    if (invalidTxs.length > 0) {
        console.log('removing the following transactions from txPool: %s', JSON.stringify(invalidTxs));
        transactionPool = _.without(transactionPool, ...invalidTxs);
    }
};
const updateTransactionPool = (transactions: Transaction[]) => {
    //console.log('tansactionPool:  '+JSON.stringify(transactionPool));
    if (transactions.length > 0) {
        //console.log('removing the following transactions from txPool: %s', JSON.stringify(transactions));
        var txIDs: string[] = _.map(transactions, (tx: Transaction) => tx.id); 
        transactionPool = _.filter(transactionPool, (tx: Transaction) => !_.includes(txIDs, tx.id));
    }
    //console.log('tansactionPool:  '+JSON.stringify(transactionPool));
};

/*
const getTxPoolIns = (aTransactionPool: Transaction[]): TxIn[] => {
    return _(aTransactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();
};
*/

/*
const isValidTxForPool = (tx: Transaction, aTtransactionPool: Transaction[]): boolean => {
    const txPoolIns: TxIn[] = getTxPoolIns(aTtransactionPool);

    const containsTxIn = (txIns: TxIn[], txIn: TxIn) => {
        return _.find(txPoolIns, ((txPoolIn) => {
            return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
        }));
    };

    for (const txIn of tx.txIns) {
        if (containsTxIn(txPoolIns, txIn)) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    return true;
};
*/
// This transaction tx has been validated in another function. id duplicate was checked in validation.
const isValidTxForPool = (tx: Transaction, aTransactionPool: Transaction[], accounts: Account[]): boolean => {
    var accSender: Account;

//console.log('isValidForPool: a Pool: ' + JSON.stringify(aTransactionPool));
//console.log('tx:  ' + JSON.stringify(tx));
    for(var i=0; i < accounts.length; i++){
        accounts[i].available = accounts[i].balance;
    }
    for (const trx of aTransactionPool) {
        if(tx.id == trx.id){
            console.log('The transaction is duplicated with the existing transaction pool. trx: ' + trx.id);
            return false;
        }
        accSender = findAccount(trx.sender, accounts);
        if(accSender == undefined){
        	console.log('isValideTxFor Pool: no account found.');
        	return false;
    	  }
       if (trx.amount > accSender.available) {
            console.log('The sender does not have enough coins. The existing transaction pool has problems. trx: ' + trx.id);
            return false;
        }else{
            accSender.available -= trx.amount;
        }
    }
    accSender = findAccount(tx.sender, accounts);
    if(accSender == undefined){
        console.log('isValidTxForPool: no account found.');
        return false;
    }
    if (tx.amount > accSender.available) {
        console.log('The transaction is not valid for the pool. tx: ' + tx.id);
        return false;
    }
    return true;
};

export {addToTransactionPool, getTransactionPool, updateTransactionPool, updateTransactionPoolReplace};
