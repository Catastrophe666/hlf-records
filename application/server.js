const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const Record = require('./model');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Create a new Record
app.post('/api/records', upload.single('certificate'), async (req, res) => {
  try {
    // Save to db
    const { name, email, phone, passport } = req.body;
    let certificateFilePath = '';
    if (req.file) {
      certificateFilePath = req.file.path; // Store the path to the uploaded file
    }
    const record = await Record.create({ name, email, phone, passport, certificate: certificateFilePath });

    //save to Block
    const contract = await createGateway();
    await contract.submitTransaction("CreateAsset",record.id,record.name,record.email,record.phone,record.passport,certificateFilePath)

   
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all Records
app.get('/api/records', async (req, res) => {
  try {
    //get from db
    const records = await Record.findAll();

    //get from Block
    const contract = await createGateway();
    result = await contract.evaluateTransaction('GetAllAssets');

    res.status(200).json({ dbRecords: records, blockRecords: result.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a Record by ID
app.get('/api/records/:id', async (req, res) => {
  try {
    //get from db
    const record = await Record.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    //get from Block
    const contract = await createGateway();
    result = await contract.evaluateTransaction('ReadAsset',req.params.id);
    res.status(200).json({ dbRecord: record, blockRecord: result.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a Record
app.put('/api/records/:id', upload.single('certificate'), async (req, res) => {
  try {
    const record = await Record.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    const { name, email, phone, passport } = req.body;

    let certificateFilePath = '';
    if (req.file) {
      certificateFilePath = req.file.path; // Store the path to the uploaded file
    }

    //update in DB
    await record.update({ name, email, phone, passport, certificateFilePath });

    //update in block
    const contract = await createGateway();
    await contract.submitTransaction("UpdateAsset",req.params.id,name,email,phone,passport,certificateFilePath)

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a Record
app.delete('/api/records/:id', async (req, res) => {
  try {
    const record = await Record.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    //delete from db
    await record.destroy();

    //delete from block
    const contract = await createGateway();
    await contract.submitTransaction("DeleteAsset",req.params.id)

    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync Sequelize models with the database
async function syncDatabase() {
  try {
    await Record.sync();
    console.log('Database synced');
  } catch (err) {
    console.error('Error syncing database:', err);
  }
}

async function createGateway(){
    const ccpPath = path.resolve(__dirname,'..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));


    // Create a new  wallet : Note that wallet is for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Create gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser1',
        discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = await gateway.getNetwork('channel9');

    // Get the contract from the network.
    const contract = network.getContract('records');

    return contract;
}

// Start the server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  await createGateway()
  await syncDatabase();
});