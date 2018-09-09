# Dewblock-dew-server Package 

This package has two modes: local mode and cloud-dew mode (for short from now on we refer it as dew mode). 

In local mode, Dewblock behaves like Naivecoin.

In dew mode, Dewblock behaves like Naivecoin without the blockchain. Thus, Dewblock-dew-server does not need huge memory like a normal blockchain system. 

#### Installation and System Start

```
npm install
npm start
```

##### Set Mode Local
```
curl http://localhost:3001/setmodelocal
```


##### Set Mode Dew
```
curl http://localhost:3001/setmodedew
```


##### Fetch Accounts
Send dew server accounts to the cloud server for verification. If consistent, the cloud server will do nothing; if not consistent, the cloud server accounts will be fetched to the dew server and replace the dew server accounts.
```
curl http://localhost:3001/fetchaccounts
```


##### Query the whole blockchain
```
curl http://localhost:3001/blocks
```
In dew mode, the blockchain has only the genesis block.


##### Query all accounts

```
curl http://localhost:3001/accounts
```

##### Query the transaction pool
```
curl http://localhost:3001/transactionPool
```


#### Query all connected peers
```
curl http://localhost:3001/peers
```


##### Query my account

```
curl http://localhost:3001/myaccount
```

##### Query my account balance
```
curl http://localhost:3001/mybalance
```


##### Query my account address

```
curl http://localhost:3001/myaddress
```



##### Query a block with block hash

```
curl http://localhost:3001/block/:hash
```
In dew mode, this is useless.



##### Query a transaction with transaction id

```
curl http://localhost:3001/transaction/:id
```
In dew mode, this is useless.


##### Query an account with account address

```
curl http://localhost:3001/account/:address
```

##### Mine a block
The block will contain the transactions in the pool.
```
curl -X POST http://localhost:3001/mineBlock
``` 

##### Mine a block in the cloud
The block will contain the transactions in the pool.
```
curl -X POST http://localhost:3001/mineInCloud
``` 

##### Send a transaction to the pool
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/sendTransaction
```
For Windows:
```
curl -H "Content-type: application/json" --data "{\"address\": \"04b3e56e277a9a7cf8216982cf85f1b8edd51de012f1222bd2b37bb1217a42d31f8feda18be34aa09a759d2a70c5d6d0cc6cdd67e4e8c1761beb27e680bddd89b6\", \"amount\" : 25}" http://localhost:3001/sendTransaction
```

##### Mine a block with a transaction
If the transaction is invalid, the block will still be mined.
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/mineTransaction
```
For Windows:
```
curl -H "Content-type: application/json" --data "{\"address\": \"04b3e56e277a9a7cf8216982cf85f1b8edd51de012f1222bd2b37bb1217a42d31f8feda18be34aa09a759d2a70c5d6d0cc6cdd67e4e8c1761beb27e680bddd89b6\", \"amount\" : 20}" http://localhost:3001/mineTransaction
```

##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addpeer
```
For Windows:
```
curl -H "Content-type:application/json" --data "{\"peer\" : \"ws://localhost:6001\"}" http://localhost:3001/addpeer
curl -H "Content-type:application/json" --data "{\"peer\" : \"ws://192.168.1.114:6001\"}" http://localhost:3001/addpeer
```

#### Stop the server
```
curl -X POST http://localhost:3001/stop
```
