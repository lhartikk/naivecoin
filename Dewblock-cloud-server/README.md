# Dewblock-cloud-server Package 

This package has no modes. Dewblock-cloud-server behaves like Naivecoin. Especially, it provides the whole blockchain to other nodes to fulfil the responsibility a full blockchain node. It also uses the complete blochchain to garantee the accuracy of all the transactions. 


#### Installation and System Start

```
npm install
npm start
```

##### Set Dew Server Address
```
curl -H "Content-type:application/json" --data '{"address" : "192.168.1.186"}' http://localhost:3001/setdewaddress
```
For Windows:
```
curl -H "Content-type:application/json" --data "{\"address\" : \"192.168.1.186\"}" http://localhost:3001/setdewaddress
```

##### Query the whole blockchain
```
curl http://localhost:3001/blocks
```

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

#### Stop the server
```
curl -X POST http://localhost:3001/stop
```
