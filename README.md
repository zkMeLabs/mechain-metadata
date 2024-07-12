## Overview
In the Object precompiled contract, read the information of the Object and use it as Metadata for the blockscout blockchain explorer.

## Deploy
- Install Node.js, version v20.x.
- Execute `npm i` in the project directory to install dependencies.
- Execute `npm i pm2 -g` install pm2.
- Execute `pm2 start npm --name "metadata" -- start` start the service.
- On nginx, forward requests for the domain https://devnet-nft.mechain.tech/ to http://127.0.0.1:8123. 

## Test
- `curl https://devnet-nft.mechain.tech/object/1` should return Object id = 1 metadata.