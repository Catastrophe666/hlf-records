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
		console.log(caInfo)
	    const caTLSCACerts = caInfo.tlsCACerts.pem;
	    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
		console.log(caClient);

        // Create a new  wallet : Note that wallet is for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
		console.log(walletPath)
        const wallet = await Wallets.newFileSystemWallet(walletPath);


		// Enroll the admin user, and import the new identity into the wallet.
		const enrollment = await caClient.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
		console.log(enrollment);
		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: 'Org1MSP',
			type: 'X.509',
		};
		await wallet.put('admin', x509Identity);
        console.log("Admin enrolled")


    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

main()