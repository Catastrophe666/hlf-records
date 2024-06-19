const FabricCAServices = require('fabric-ca-client')
const { Gateway, Wallets } = require('fabric-network');

const fs = require('fs');
const path = require('path');

async function main(){
    try{

        // network config
        const ccpPath = path.resolve(__dirname,'..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        // Create a new CA client for interacting with the CA.
	    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
	    const caClient = new FabricCAServices(caInfo.url);

        // Create a new  wallet : Note that wallet is for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);


		// build a user object for authenticating with the CA
        const adminIdentity = await wallet.get('admin');
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, 'admin');

		// Register the user, enroll the user, and import the new identity into the wallet.
		// if affiliation is specified by client, the affiliation value must be configured in CA
		const secret = await caClient.register({
			affiliation: 'org1.department1',
			enrollmentID: 'appUser1',
			role: 'client'
		}, adminUser);
		const enrollment = await caClient.enroll({
			enrollmentID: 'appUser1',
			enrollmentSecret: secret
		});
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: 'Org1MSP',
			type: 'X.509',
		};
		await wallet.put('appUser1', x509Identity);
        console.log("user Registered")


    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

main()