# Naivecoin: chapter 1
The branch for Naivecoin, chapter1

```
npm install
npm start
```

##### Get blockchain
```
curl http://localhost:3001/blocks
```

##### Create block
```
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
``` 

##### Add peer
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```
#### Query connected peers
```
curl http://localhost:3001/peers
```
