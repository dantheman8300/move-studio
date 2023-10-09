import cors from 'cors';
import express from 'express';
import { compile, test } from './build';
import { getObjectDetails, getPackageDetails, getTransactionDetails } from './object';

const app = express();
const portHttp = 80;
const portHttps = 443;

// // USE FOR PRODUCTION
// import https from 'https';
// import fs from 'fs';
// const CERT_PATH = "/etc/letsencrypt/live/api.movestudio.dev/fullchain.pem"
// const KEY_PATH = "/etc/letsencrypt/live/api.movestudio.dev/privkey.pem"
// const options = {
//   key: fs.readFileSync(KEY_PATH),
//   cert: fs.readFileSync(CERT_PATH)
// };
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(portHttps, () => {
// 	console.log('HTTPs Server running on port ', portHttps);
// });

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: '10mb' }));

app.get('/', (_req, res) => {
  res.send('Move Studio IDE Backend');
});

app.post('/compile', async (req, res) => {
  const project = req.body;

  // Call compile function
  const compileResult = await compile(project);

  console.log('compileResult', compileResult)

  res.send(compileResult);
});

app.post('/test', async (req, res) => {
  const project = req.body;

  // Call compile function
  const testResult = await test(project);

  console.log('testResult', testResult)

  res.send(testResult);
});

app.post('/object-details', async (req, res) => {
  const objectId = req.body.objectId;
  const rpc = req.body.rpc;

  // Call compile function
  const objectDetails = await getObjectDetails(objectId, rpc);

  res.send(objectDetails);
});

app.post('/package-details', async (req, res) => {
  const packageId = req.body.packageId;
  const rpc = req.body.rpc;

  // Call compile function
  const packageDetails = await getPackageDetails(packageId, rpc);

  res.send(packageDetails);
});

app.post('/transaction-details', async (req, res) => {
  const transactionDigest = req.body.transactionDigest;
  const rpc = req.body.rpc;

  // Call compile function
  const transactionDetails = await getTransactionDetails(transactionDigest, rpc);

  res.send(transactionDetails);
});

app.listen(process.env.PORT || portHttp, () => {
  console.log(`REST API is listening on port: ${process.env.PORT || portHttp}.`);
});