# Dewcoin 

naivecoin dew computing version. a proof of concept for blockchain applications that follow dew computing principles. http://www.dewcomputing.org/

(in progress)

Basic principles of naivecoin can be found in: A tutorial for building a cryptocurrency https://lhartikk.github.io/
```
npm install
npm start
```


##### Query the whole blockchain
curl http://localhost:3001/blocks



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



##### Query a transaction with transaction id

curl http://localhost:3001/transaction/:id



##### Query an account with account address

curl http://localhost:3001/account/:address



##### Mine a block
```
curl -X POST http://localhost:3001/mineBlock
``` 


##### Send transaction
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/sendTransaction
```
For Windows:
curl -H "Content-type: application/json" --data "{\"address\": \"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\", \"amount\" : 35}" http://localhost:3001/sendTransaction



##### Mine transaction
```
curl -H "Content-type: application/json" --data '{"address": "04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534b", "amount" : 35}' http://localhost:3001/mineTransaction
```
For Windows:
curl -H "Content-type: application/json" --data "{\"address\": \"04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a\", \"amount\" : 20}" http://localhost:3001/mineTransaction


##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addpeer
```
For Windows:
curl -H "Content-type:application/json" --data "{\"peer\" : \"ws://localhost:6001\"}" http://localhost:3001/addpeer
```


#### Stop the server
```
curl http://localhost:3001/stop
```

