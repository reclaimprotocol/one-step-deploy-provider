import express from 'express';
import { reclaimprotocol } from '@reclaimprotocol/reclaim-sdk'

const app = express();
const port = 3000;

const reclaim = new reclaimprotocol.Reclaim()

app.get("/request-proofs", async(req, res) => {
    const request = reclaim.requestProofs({
        title: "Reclaim Protocol",
        baseCallbackUrl: `https://example.com`,
        requestedProofs: [
            new reclaim.HttpsProvider({
                name: "Reddit Karma",
                logoUrl: "https://i.redd.it/snoovatar/avatars/97178518-5ce1-400b-8185-54dcaef96d9c.png",
                url: "https://www.reddit.com",
                loginUrl: "https://reddit.com/login",
                loginCookies: ['session', 'reddit_session', 'loid', 'token_v2', 'edgebucket'],
                selectionRegex: '<span class=\"_2BMnTatQ5gjKGK5OWROgaG\">{{username}}</span>.*?<span>{{karma}} karma</span>',
            }),
        ],
    });

    const { callbackId, expectedProofsInCallback } = request;
    const reclaimUrl = await request.getReclaimUrl();
    // Save the callbackId, reclaimUrl, and expectedProofsInCallback for future use
    // ...
    res.json({ reclaimUrl });
})


// The call back can only be used when it is deployed on public internet connect with a domain or endpoint, for this example this is non functional
app.post("/callback/", async (req, res) => {
    const { id } = req.query;
    const { proofs } = req.body;

    const onChainClaimIds = reclaim.getOnChainClaimIdsFromProofs(proofs)

    // check if onChainClaimIds have been submitted in the database before
    // const results = db.find({{ valueField: { $in: valuesArray } }; -> // Replace 'valueField' with the field name in your database

    if(results){
        res.status(400).json({ error: "Proofs already submitted" });
    } else {
        const isProofsCorrect = await reclaim.verifyCorrectnessOfProofs(proofs);

        if (isProofsCorrect) {
            console.log("Proofs submitted:", proofs);
            // store proofs in your backend for future use
            res.json({ success: true });
        } else {
            console.error("Proofs verification failed");
            res.status(400).json({ error: "Proofs verification failed" });
        }
    }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});