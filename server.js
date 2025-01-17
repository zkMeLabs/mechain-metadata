import http from 'http';
import url from 'url';
import { ethers } from 'ethers';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const isPositiveInteger = (str) => {
  return /^\d+$/.test(str) && parseInt(str) > 0;
};

const host = '0.0.0.0';
const port = 8123;

const rpc = 'https://devnet-rpc.mechain.tech/';
const storageAddress = '0x0000000000000000000000000000000000002001';
const abi = JSON.parse(
  `[{"inputs":[{"internalType":"string","name":"objectId","type":"string"}],"name":"headObjectById","outputs":[{"components":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"bucketName","type":"string"},{"internalType":"string","name":"objectName","type":"string"},{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"uint32","name":"localVirtualGroupId","type":"uint32"},{"internalType":"uint64","name":"payloadSize","type":"uint64"},{"internalType":"enum VisibilityType","name":"visibility","type":"uint8"},{"internalType":"string","name":"contentType","type":"string"},{"internalType":"int64","name":"createAt","type":"int64"},{"internalType":"enum ObjectStatus","name":"objectStatus","type":"uint8"},{"internalType":"enum RedundancyType","name":"redundancyType","type":"uint8"},{"internalType":"enum SourceType","name":"sourceType","type":"uint8"},{"internalType":"string[]","name":"checksums","type":"string[]"},{"components":[{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"value","type":"string"}],"internalType":"struct Tag[]","name":"tags","type":"tuple[]"},{"internalType":"bool","name":"isUpdating","type":"bool"},{"internalType":"int64","name":"updatedAt","type":"int64"},{"internalType":"address","name":"updatedBy","type":"address"},{"internalType":"int64","name":"version","type":"int64"}],"internalType":"struct ObjectInfo","name":"objectInfo","type":"tuple"},{"components":[{"internalType":"uint32","name":"id","type":"uint32"},{"internalType":"uint32","name":"familyId","type":"uint32"},{"internalType":"uint32","name":"primarySpId","type":"uint32"},{"internalType":"uint32[]","name":"secondarySpIds","type":"uint32[]"},{"internalType":"uint64","name":"storedSize","type":"uint64"},{"internalType":"address","name":"virtualPaymentAddress","type":"address"},{"internalType":"string","name":"totalDeposit","type":"string"}],"internalType":"struct GlobalVirtualGroup","name":"globalVirtualGroup","type":"tuple"}],"stateMutability":"view","type":"function"}]`
);
const provider = new ethers.JsonRpcProvider(rpc);
const storage = new ethers.Contract(storageAddress, abi, provider);

const VisibilityType = {
  0: 'UnSpecified',
  1: 'PublicRead',
  3: 'Private',
  4: 'Inherit',
};

const SourceType = {
  0: 'Origin',
  1: 'MirrorPending',
  3: 'BscCrossChain',
  4: 'OpCrossChain',
};

const RedundancyType = {
  0: 'EcType',
  1: 'ReplicaType',
};

const ObjectStatus = {
  0: 'Created',
  1: 'Sealed',
  2: 'Discontinued',
};

const requestListener = async function (req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathSegments = parsedUrl.pathname.split('/');
  const type = pathSegments[1];
  const id = pathSegments[2];
  console.log(`type: ${type}, id: ${id}`);

  if (!isPositiveInteger(id)) {
    console.log(`id ${id} is not a positive integer`);
    res.writeHead(501);
    res.end('{}');
    return;
  }

  let metadata = undefined;
  try {
    if (type == 'object') {
      let [object, _] = await storage.headObjectById(id);
      object = object.toObject(true);

      // console.log('object:', object);

      metadata = {
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
            trait_type: 'Bucket Name',
            value: object.bucketName,
          },
          {
            display_type: 'string',
            trait_type: 'Local Virtual GroupId',
            value: object.localVirtualGroupId,
          },
          {
            display_type: 'string',
            trait_type: 'Payload Size',
            value: object.payloadSize,
          },
          {
            display_type: 'string',
            trait_type: 'Visibility',
            value: VisibilityType[object.visibility],
          },
          {
            display_type: 'string',
            trait_type: 'Content Type',
            value: object.contentType,
          },
          {
            display_type: 'date',
            trait_type: 'Create At',
            value: object.createAt,
          },
          {
            display_type: 'string',
            trait_type: 'Object Status',
            value: ObjectStatus[object.objectStatus],
          },
          {
            display_type: 'string',
            trait_type: 'Redundancy Type',
            value: RedundancyType[object.redundancyType],
          },
          {
            display_type: 'string',
            trait_type: 'Source Type',
            value: SourceType[object.sourceType],
          },
          {
            display_type: 'array',
            trait_type: 'Checksums',
            value: object.checksums,
          },
          {
            display_type: 'string',
            trait_type: 'Is Updating',
            value: object.isUpdating,
          },
          {
            display_type: object.updatedAt ? 'date' : 'string',
            trait_type: 'Updated At',
            value: object.updatedAt,
          },
          {
            display_type: 'string',
            trait_type: 'Updated By',
            value: object.updatedBy,
          },
          {
            display_type: 'string',
            trait_type: 'Version',
            value: object.version,
          },
        ],
      };
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(metadata));
    } else {
      console.log('input error');
      res.writeHead(501);
      res.end('{}');
    }
  } catch (error) {
    console.log('query error', error);
    res.writeHead(500);
    res.end('{}');
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
