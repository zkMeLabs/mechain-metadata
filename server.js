import http from 'http';
import url from 'url';
import { ethers } from 'ethers';

const host = 'localhost';
const port = 8000;

const rpc = 'http://127.0.0.1:8545';
const storageAddress = '0x0000000000000000000000000000000000002001';
const abi = JSON.parse(
  `[{"inputs":[{"internalType":"string","name":"objectId","type":"string"}],"name":"headObjectById","outputs":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"bucketName","type":"string"},{"internalType":"string","name":"objectName","type":"string"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint32","name":"localVirtualGroupId","type":"uint32"},{"internalType":"uint64","name":"payloadSize","type":"uint64"},{"internalType":"enum VisibilityType","name":"visibility","type":"uint8"},{"internalType":"string","name":"contentType","type":"string"},{"internalType":"int64","name":"createAt","type":"int64"},{"internalType":"enum ObjectStatus","name":"objectStatus","type":"uint8"},{"internalType":"enum RedundancyType","name":"redundancyType","type":"uint8"},{"internalType":"enum SourceType","name":"sourceType","type":"uint8"},{"internalType":"string[]","name":"checksums","type":"string[]"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"value","type":"string"}],"internalType":"struct Tag[]","name":"tags","type":"tuple[]"},{"internalType":"bool","name":"isUpdating","type":"bool"},{"internalType":"int64","name":"updatedAt","type":"int64"},{"internalType":"address","name":"updatedBy","type":"address"},{"internalType":"int64","name":"version","type":"int64"}],"internalType":"struct ObjectInfo","name":"objectInfo","type":"tuple"},{"components":[{"internalType":"uint32","name":"id","type":"uint32"},{"internalType":"uint32","name":"familyId","type":"uint32"},{"internalType":"uint32","name":"primarySpId","type":"uint32"},{"internalType":"uint32[]","name":"secondarySpIds","type":"uint32[]"},{"internalType":"uint64","name":"storedSize","type":"uint64"},{"internalType":"address","name":"virtualPaymentAddress","type":"address"},{"internalType":"string","name":"totalDeposit","type":"string"}],"internalType":"struct GlobalVirtualGroup","name":"globalVirtualGroup","type":"tuple"}],"stateMutability":"view","type":"function"}]`
);
const provider = new ethers.JsonRpcProvider(rpc);
const storage = new ethers.Contract(storageAddress, abi, provider);

const requestListener = async function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathSegments = parsedUrl.pathname.split('/');

  // pathSegments[1] 是 {type}，pathSegments[2] 是 {id}
  const type = pathSegments[1];
  const id = pathSegments[2];

  let [object, globalVirtualGroup] = await storage.headObjectById(id);
  object = object.toObject(true);
  console.log('object:', object);
  console.log('globalVirtualGroup:', globalVirtualGroup.toObject(true));

  console.log(`Type: ${type}, ID: ${id}`);

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);

  const metadata = {
    description: `Stroage NFT #${id}`,
    external_url: 'https://zk.me/',
    image: 'https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png',
    name: object.objectName,
    attributes: [
      {
        display_type: 'string',
        trait_type: 'Owner',
        value: object.owner,
      },
      {
        display_type: 'string',
        trait_type: 'Creator',
        value: object.creator,
      },
      {
        display_type: 'string',
        trait_type: 'BucketName',
        value: object.bucketName,
      },
      {
        display_type: 'string',
        trait_type: 'Personality',
        value: 'Sad',
      },
    ],
  };

  res.end(JSON.stringify(metadata));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
