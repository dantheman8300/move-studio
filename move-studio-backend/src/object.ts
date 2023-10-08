import { JsonRpcProvider, devnetConnection, Connection } from "@mysten/sui.js";

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
  const connection = new Connection({ fullnode: rpc });
  let provider = new JsonRpcProvider(connection);

  let packageDetails = await provider.getNormalizedMoveModulesByPackage({
    package: packageId,
  });
  
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