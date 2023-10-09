import { JsonRpcProvider, devnetConnection, Connection } from "@mysten/sui.js";

const MAX_RETRIES = 10;

export async function getObjectDetails(objectId: string, rpc: string) {
  const connection = new Connection({ fullnode: rpc });
  let provider = new JsonRpcProvider(connection);

  let objectDetails = await provider.getObject({
    id: objectId,
    options: {
      showContent: true,
      showDisplay: true,
    },
  });

  return objectDetails;
}

export async function getPackageDetails(packageId: string, rpc: string) {
  console.log("packageId", packageId)
  console.log("rpc", rpc)
  const connection = new Connection({ fullnode: rpc });
  let provider = new JsonRpcProvider(connection);

  let packageDetails;
  let count = 0;
  while(true) {
    count++;
    if (count > MAX_RETRIES) {
      return {error: 'timeout'};
    }
    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      packageDetails = await provider.getNormalizedMoveModulesByPackage({
        package: packageId,
      });
      console.log('packageDetails', packageDetails)
      break
    } catch (e) {
      console.log('error', e)
      continue
    }
  }
  
  return packageDetails;
}

export async function getTransactionDetails(transactionDigest: string, rpc: string) {
  const connection = new Connection({ fullnode: rpc });
  let provider = new JsonRpcProvider(connection);

  let transactionDetails = await provider.getTransactionBlock({
    digest: transactionDigest,
    options: {
      "showInput": true,
      "showEffects": true,
      "showEvents": true,
      "showObjectChanges": true,
      "showBalanceChanges": true
    }
  });
  
  return transactionDetails;
}