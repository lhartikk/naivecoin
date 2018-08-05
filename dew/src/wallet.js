"use strict";
exports.__esModule = true;
var elliptic_1 = require("elliptic");
var fs_1 = require("fs");
var _ = require("lodash");
var transaction_1 = require("./transaction");
var EC = new elliptic_1.ec('secp256k1');
var privateKeyLocation = process.env.PRIVATE_KEY || 'node/wallet/private_key';
var getPrivateFromWallet = function () {
    var buffer = fs_1.readFileSync(privateKeyLocation, 'utf8');
    return buffer.toString();
};
exports.getPrivateFromWallet = getPrivateFromWallet;
var getPublicFromWallet = function () {
    var privateKey = getPrivateFromWallet();
    var key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};
exports.getPublicFromWallet = getPublicFromWallet;
var generatePrivateKey = function () {
    var keyPair = EC.genKeyPair();
    var privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};
exports.generatePrivateKey = generatePrivateKey;
var initWallet = function () {
    // let's not override existing private keys
    if (fs_1.existsSync(privateKeyLocation)) {
        return;
    }
    var newPrivateKey = generatePrivateKey();
    fs_1.writeFileSync(privateKeyLocation, newPrivateKey);
    console.log('new wallet with private key created to : %s', privateKeyLocation);
};
exports.initWallet = initWallet;
var deleteWallet = function () {
    if (fs_1.existsSync(privateKeyLocation)) {
        fs_1.unlinkSync(privateKeyLocation);
    }
};
exports.deleteWallet = deleteWallet;
var getBalance = function (address, unspentTxOuts) {
    return _(findUnspentTxOuts(address, unspentTxOuts))
        .map(function (uTxO) { return uTxO.amount; })
        .sum();
};
exports.getBalance = getBalance;
var findUnspentTxOuts = function (ownerAddress, unspentTxOuts) {
    return _.filter(unspentTxOuts, function (uTxO) { return uTxO.address === ownerAddress; });
};
exports.findUnspentTxOuts = findUnspentTxOuts;
var findTxOutsForAmount = function (amount, myUnspentTxOuts) {
    var currentAmount = 0;
    var includedUnspentTxOuts = [];
    for (var _i = 0, myUnspentTxOuts_1 = myUnspentTxOuts; _i < myUnspentTxOuts_1.length; _i++) {
        var myUnspentTxOut = myUnspentTxOuts_1[_i];
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            var leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts: includedUnspentTxOuts, leftOverAmount: leftOverAmount };
        }
    }
    var eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};
var createTxOuts = function (receiverAddress, myAddress, amount, leftOverAmount) {
    var txOut1 = new transaction_1.TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    }
    else {
        var leftOverTx = new transaction_1.TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};
var filterTxPoolTxs = function (unspentTxOuts, transactionPool) {
    var txIns = _(transactionPool)
        .map(function (tx) { return tx.txIns; })
        .flatten()
        .value();
    var removable = [];
    var _loop_1 = function (unspentTxOut) {
        var txIn = _.find(txIns, function (aTxIn) {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });
        if (txIn === undefined) {
        }
        else {
            removable.push(unspentTxOut);
        }
    };
    for (var _i = 0, unspentTxOuts_1 = unspentTxOuts; _i < unspentTxOuts_1.length; _i++) {
        var unspentTxOut = unspentTxOuts_1[_i];
        _loop_1(unspentTxOut);
    }
    return _.without.apply(_, [unspentTxOuts].concat(removable));
};
var createTransaction = function (receiverAddress, amount, privateKey, unspentTxOuts, txPool) {
    console.log('txPool: %s', JSON.stringify(txPool));
    var myAddress = transaction_1.getPublicKey(privateKey);
    var myUnspentTxOutsA = unspentTxOuts.filter(function (uTxO) { return uTxO.address === myAddress; });
    var myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
    // filter from unspentOutputs such inputs that are referenced in pool
    var _a = findTxOutsForAmount(amount, myUnspentTxOuts), includedUnspentTxOuts = _a.includedUnspentTxOuts, leftOverAmount = _a.leftOverAmount;
    var toUnsignedTxIn = function (unspentTxOut) {
        var txIn = new transaction_1.TxIn();
        txIn.txOutId = unspentTxOut.txOutId;
        txIn.txOutIndex = unspentTxOut.txOutIndex;
        return txIn;
    };
    var unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);
    var tx = new transaction_1.Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
    tx.id = transaction_1.getTransactionId(tx);
    tx.txIns = tx.txIns.map(function (txIn, index) {
        txIn.signature = transaction_1.signTxIn(tx, index, privateKey, unspentTxOuts);
        return txIn;
    });
    return tx;
};
exports.createTransaction = createTransaction;
