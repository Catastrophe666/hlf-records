const { Gateway, Wallets } = require('fabric-network');

const fs = require('fs');
const path = require('path');

async function main(){
    try{

        // network config
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

        //query
        result = await contract.evaluateTransaction('GetAllAssets');
        console.log(`result: ${result.toString()}`)

        // Disconnect from the gateway 
		gateway.disconnect();

        console.log('success')



    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

main()