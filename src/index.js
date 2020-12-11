const rdkit = require('@iktos/rdkitjs/dist/full');
const express = require('express');
const groupBy = require('lodash/groupBy');

const app = express();
const port = process.env.PORT || 3000;

rdkit.initialise().then(() => {
    app.use(express.json());

    app.get('/health', (req, res) => {
        const responses = [
            'I am alive!',
            'What did you except?',
            'As awake as a Monday in December',
            'I am a teapot',
            'Too many beers but I am phineee zzzzzzz',
            'It\'s none of your business',
            'Whoa! someone is talking to me!',
        ]
    
        const id = Math.min(responses.length-1, Math.round(Math.random()*responses.length)); 
        
        res.send(responses[id]);
    });
    
    app.post('/', async (req, res) => {
        const smilesList = req.body.smiles;
        const response = {};
        
        console.log(`Processing ${smilesList.length} SMILES`);
    
        const groups = groupBy(smilesList, v => v);
        
        const duplicates = Object.keys(groups).filter(key => groups[key].length > 1 );
        if( duplicates.length ) {
            console.log(`The batch has duplicates: ${duplicates}`);
        }

        for(const smiles of smilesList) {
            let mol;
            let desc;

            try {
                mol = rdkit.Molecule.fromSmiles(smiles);
                desc = mol._mol.get_descriptors();
            } catch {
                console.log('failed');
                desc = {}
            }
    
            response[smiles] = [
                /* 0 */ desc.exactmw,
                /* 1 */ desc.lipinskiHba,
                /* 2 */ desc.lipinskiHbd,
                /* 3 */ desc.numRotatableBonds,
                /* 4 */ desc.numHba,
                /* 5 */ desc.numHbd,
                /* 6 */ desc.numHeteroatoms,
                /* 7 */ desc.numAmideBonds,
                /* 8 */ desc.fractionCsp3,
                /* 9 */ desc.numRings,
                /* 10 */ desc.numAromaticRings,
                /* 11 */ desc.numAliphaticRings,
                /* 12 */ desc.numSaturatedRings,
                /* 13 */ desc.numHeterocycles,
                /* 14 */ desc.numAromaticHeterocycles,
                /* 15 */ desc.numSaturatedHeterocycles,
                /* 16 */ desc.numAliphaticHeterocycles,
                /* 17 */ desc.numSpiroAtoms,
                /* 18 */ desc.numBridgeheadAtoms,
                /* 19 */ desc.numAtomStereoCenters,
                /* 20 */ desc.numUnspecifiedAtomStereoCenters,
                /* 21 */ desc.labuteAsa,
                /* 22 */ desc.tpsa,
                /* 23 */ desc.crippenClogP,
                /* 24 */ desc.crippenMr,
                /* 25 */ desc.amw,
                /* 26 */ desc.pfi,
            ];
    
            if(mol) {
                mol.delete();
            }
        }
           
        res
            .status(200)
            .type('json')        
            .header('X-Request-ID', req.header('X-Request-ID'))
            .send(response);
    });
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}, from process ${process.pid}`);
    });    
});

