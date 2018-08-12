import * as  bodyParser from 'body-parser';
import * as express from 'express';
import * as _ from 'lodash';

/*
import {
    Block, generateNextBlock, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction
} from './blockchain';
*/
import {
    Block, generateNextBlock, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain, getMyAccount, getAccounts, sendTransaction
} from './blockchain';

import {connectToPeers, getSockets, initP2PServer} from './p2p';

//import {UnspentTxOut} from './transaction';
import {Account, findAccount} from './transaction';

import {getTransactionPool} from './transactionPool';
import {getPublicFromWallet, initWallet} from './wallet';

//dewcoin
import {getDew, setDew} from './config';



const httpPort: number = parseInt(process.env.HTTP_PORT) || 4001;
const p2pPort: number = parseInt(process.env.P2P_PORT) || 7001;

const initHttpServer = (myHttpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });

    app.post('/SetDewAddress', (req, res) => {
        setDew(req.body.address);
        console.log('Dew address: ' + getDew());
        res.send();
    });

    app.get('/blocks', (req, res) => {
        res.send(getBlockchain());
    });

    app.get('/block/:hash', (req, res) => {
        const block = _.find(getBlockchain(), {'hash' : req.params.hash});
        res.send(block);
    });

    app.get('/transaction/:id', (req, res) => {
        const tx = _(getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({'id': req.params.id});
        res.send(tx);
    });

    /*
    app.get('/address/:address', (req, res) => {
        const unspentTxOuts: UnspentTxOut[] =
            _.filter(getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
        res.send({'unspentTxOuts': unspentTxOuts});
    });
    */
    app.get('/account/:address', (req, res) => {
        let acc: Account = findAccount(req.params.address, getAccounts());
        if(acc == undefined){
        	res.send({'Error:': "address is wrong"});             
        }
        res.send({'Account': acc});
    });

    /*
    app.get('/unspentTransactionOutputs', (req, res) => {
        res.send(getUnspentTxOuts());
    });
    */
    //display all accounts
    app.get('/accounts', (req, res) => {
        res.send(getAccounts());
    });

    /*
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send(getMyUnspentTransactionOutputs());
    });
    */
    app.get('/myaccount', (req, res) => {
        let acc: Account = findAccount(getPublicFromWallet(), getAccounts());
        if(acc == undefined){
           	res.send({'Error': 'No account was found.'})
        }else{
        	res.send({'My Account': acc});
        }
    });

    app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('data parameter is missing');
            return;
        }
        const newBlock: Block = generateRawNextBlock(req.body.data);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    app.post('/mineBlock', (req, res) => {
        const newBlock: Block = generateNextBlock();
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(newBlock);
        }
    });

    app.get('/mybalance', (req, res) => {
        let acc: Account = findAccount(getPublicFromWallet(), getAccounts());
        if(acc == undefined){
        	res.send({'Error:': "No such account."});             
        }else{
       	res.send({'Balance': acc.balance});
        }
    });

    app.get('/myaddress', (req, res) => {
        const address: string = getPublicFromWallet();
        res.send({'address': address});
    });

    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        try {
            const resp = generatenextBlockWithTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;

            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = sendTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    app.get('/transactionpool', (req, res) => {
        res.send(getTransactionPool());
    });

    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addpeer', (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.post('/stop', (req, res) => {
        res.send({'msg' : 'stopping server'});
        process.exit();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);
initWallet();
