# Dewcoin 

Dewcoin is a blockchain cryptocurrency system that is based on dew computing principles. The code is pretty detailed but still not detailed enough for immediate production operation. It is basically a Proof of Concept system. The mechanism of dewcoin will be introduced separately. Some information about dew computing can be found in: http://www.dewcomputing.org/

Dewcoin is based on Naivecoin. The introduction of Naivecoin can be found in: A tutorial for building a cryptocurrency https://lhartikk.github.io/


## Package Placement

Dewcoin has two components: dewcoin-cloud package and the dewcoin-dew package. Ideally, dewcoin-cloud package should be placed in a computer that is running all the time and has a fixed IP address so that it can be accessed easily; dewcoin-dew package can be placed in a local computer. For testing purposes, dewcoin-cloud package and dewcoin-dew package can be placed in the same computer. 

## Package Configuraton

Configuraton files:
dewcoin-dew/src/config.ts
dewcoin-cloud/src/config.ts

Detailed configuration guidelines can be found in these files.

Please notice: if only one machine is involved in testing, default config files are OK. If more than one machine is involved, config files should not use localhost or 127.0.0.1 at all.


## Package Installation

Both packages should be installed in Node.js environment. 

Installation command: 
```
npm install
```
Running command: 
```
npm start
```
## Dewcoin Operation

Dewcoin system can be operated through an API composed of a group of HTTP commands. These commands can be issued through browsers, designed web forms, or HTTP clients such as curl.

We use curl to describe the API, but it does not mean curl is the only way to operate Dewcoin.

