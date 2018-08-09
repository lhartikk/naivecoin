# Dewcoin 

naivecoin dew computing version. a proof of concept for blockchain applications that follow dew computing principles. http://www.dewcomputing.org/

(in progress)

Basic principles of naivecoin can be found in: A tutorial for building a cryptocurrency https://lhartikk.github.io/
```
npm install
npm start
```

##### Set Dew Address
Example for Windows:
curl -H "Content-type:application/json" --data "{\"address\": \"192.168.1.186\"}" http://localhost:4001/SetDewAddress


##### Query the whole blockchain
curl http://localhost:3001/blocks
pass to cloud


##### Query all accounts

curl http://localhost:3001/accounts


##### Query the transaction pool
```
curl http://localhost:3001/transactionPool
```


#### Query all connected peers
```
curl http://localhost:3001/peers
```


##### Query my account

curl http://localhost:3001/myaccount


##### Query my account balance
```
curl http://localhost:3001/mybalance
```


##### Query my account address

curl http://localhost:3001/myaddress



##### Query a block with block hash

curl http://localhost:3001/block/:hash

pass to cloud



##### Query a transaction with transaction id

curl http://localhost:3001/transaction/:id
pass to cloud


##### Query an account with account address

curl http://localhost:3001/account/:address



##### Mine a block
The block will contain the transactions in the pool.
```
curl -X POST http://localhost:3001/mineBlock
``` 
pass to cloud


##### Send a transaction to the pool
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/sendTransaction
```
For Windows:
curl -H "Content-type: application/json" --data "{\"address\": \"04b3e56e277a9a7cf8216982cf85f1b8edd51de012f1222bd2b37bb1217a42d31f8feda18be34aa09a759d2a70c5d6d0cc6cdd67e4e8c1761beb27e680bddd89b6\", \"amount\" : 25}" http://localhost:3001/sendTransaction



##### Mine a block with a transaction
If the transaction is invalid, the block will still be mined.
pass to cloud
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/mineTransaction
```
For Windows:
curl -H "Content-type: application/json" --data "{\"address\": \"04b3e56e277a9a7cf8216982cf85f1b8edd51de012f1222bd2b37bb1217a42d31f8feda18be34aa09a759d2a70c5d6d0cc6cdd67e4e8c1761beb27e680bddd89b6\", \"amount\" : 20}" http://localhost:3001/mineTransaction


##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addpeer
```
For Windows:
curl -H "Content-type:application/json" --data "{\"peer\" : \"ws://localhost:7001\"}" http://localhost:3001/addpeer
```


#### Stop the server
```
curl -X POST http://localhost:3001/stop
```

