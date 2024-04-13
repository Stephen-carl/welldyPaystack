//This module is for the payout of the smart meter
const https= require('https');
const asyncWrapper = require('./async');

const estateSecretKeys = {
    101: process.env.SecretKey101,
    102: process.env.SecretKey102,
    103: process.env.SecretKey103,
    104: process.env.SecretKey104,
    105: process.env.SecretKey105,
    106: process.env.SecretKey106
    // Add more estates as needed
    };
const estateSubAccount = {
    101: process.env.SubAccount101,
    102: process.env.SubAccount102,
    103: process.env.SubAccount103,
    104: process.env.SubAccount104,
    105: process.env.SubAccount105,
    106: process.env.SubAccount106
}

const thePayment = asyncWrapper(
    async (req, res) => {
        //get the required data from the query
        var estateID = req.body.estateID
        var amount = req.body.amount;
        var reference = req.body.reference;
        var email = req.body.email;
        //var meterID = req.body.meterID;
    
        //get the secret key of the entered estateiD
        const SecretKey = estateSecretKeys[estateID];
        const subaccount = estateSubAccount[estateID];

        if (!SecretKey) {
            console.error('Invalid estate name:', estateID);
            res.status(400).json({ error: 'Invalid estate name' });
            return;
        }

        if (!subaccount) {
            console.error('Invalid subaccount of:', estateID);
            res.status(400).json({ error: 'Invalid subaccount' });
            return;
        }

        const params = JSON.stringify({
            "amount": [amount],
            "email": email,
            "reference": reference,
            "subaccount" : subaccount
          })

          //stringify the meterID parameter into the body
        //   const metadata = JSON.stringify({
        //     "meterID": meterID
        //   })
          
          const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
              Authorization: 'Bearer '+SecretKey,
              'Content-Type': 'application/json'
            },
            body: {
                'subaccount' : subaccount,
                //metadata is under customer array
                //'metadata' : metadata,
            }
          }
          
          const reqR = https.request(options, resS => {
            let data = ''
          
            resS.on('data', (chunk) => {
              data += chunk
            });
          
            resS.on('end', () => {
              res.send(data)
              console.log(JSON.parse(data))
              
            })
          }).on('error', error => {
            console.error(error)
          })
          
          reqR.write(params)
          reqR.end()
    },
)
        //verify call back
const verifyTrans = asyncWrapper(
    async (req, res) => {
        var refID = req.body.reference;
        //pass in the estateId from the app so i can get the exact secretKey
        var estateID = req.body.estateID;

        //get the secret key of the entered estateiD
        const SecretKey = estateSecretKeys[estateID];
        //and get the secret for the exact bearer
        if (!SecretKey) {
            console.error('Invalid estate name:', estateID);
            res.status(400).json({ error: 'Invalid estate name' });
            return;
        }

        const params = JSON.stringify({
            "reference": refID
          })

        const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/verify/'+refID,
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + SecretKey
        }
        }
        const reqR = https.request(options, resS => {
        let data = ''

        resS.on('data', (chunk) => {
            data += chunk
        });

        resS.on('end', () => {
            res.send(data)
            console.log(JSON.parse(data))
        })
        }).on('error', error => {
        console.error(error)
        })
        //reqR.write(refID)
        reqR.end()
    },
)


module.exports = {
    thePayment, 
    verifyTrans
}