import * as _ from 'lodash';

//import {Transaction, TxIn, UnspentTxOut, validateTransaction} from './transaction';
import {Transaction, Account, validateTransaction} from './transaction';

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
        throw Error('Trying to add invalid tx to pool');
    }

    if (!isValidTxForPool(tx, transactionPool, accounts)) {
        throw Error('Trying to add invalid tx to pool');
    }
    console.log('adding to txPool: %s', JSON.stringify(tx));
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
const updateTransactionPool = (accounts: Account[]) => {
    const txIds: number[] = _(transactionPool)
        .map((tx) => tx.id)
        .value();

    if (hasDuplicates(txIds)) {
        console.log('Transactions in block are duplicated.');
        return false;
    }

    for(var i=0; i < accounts.length; i++){
        accounts[i].available = accounts[i].balance;
    }
    for(var j=0; j < aTransactions.length; j++){
        accSender = findAccount(aTransactions[j].sender);
        if (aTransactions[j].amount > accSender.available) {
            console.log('The sender does not have enough coins. tx: ' + aTransactions[j].id);
            return false;
        }
        accSender.available -=aTransactions[j].amount;
    }
    // all but coinbase transactions
    const normalTransactions: Transaction[] = aTransactions.slice(1);
    return normalTransactions.map((tx) => validateTransaction(tx, accounts))
        .reduce((a, b) => (a && b), true);
    transactionPool = _(transactionPool).filter(tx => validateTransaction(tx, accounts));
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

export {addToTransactionPool, getTransactionPool, updateTransactionPool};
