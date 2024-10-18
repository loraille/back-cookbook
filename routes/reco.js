const express = require('express');
const router = express.Router();
const uniqid = require('uniqid');
const fs = require('fs');
const mindee = require('mindee');
const path = require('path');

// Init a new Mindee client
const mindeeClient = new mindee.Client({
  apiKey: process.env.MINDEE_API,
});

router.post('/', async (req, res) => {
  try {
    console.log('---------------Mindee treatment---------------');
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const file = req.files.file;
    if (!file) {
      return res.status(400).json({ error: 'File not found in request.' });
    }

    const filePath = `/tmp/${uniqid()}.jpg`;

    // Sauvegarde temporaire du fichier
    const resultMove = await file.mv(filePath);

    if (resultMove) {
      return res.status(500).json({ result: false, error: resultMove });
    }

    const inputSource = mindeeClient.docFromPath(filePath);

    const customEndpoint = mindeeClient.createEndpoint(
      'recettes',
      'loraille',
      '1', // Defaults to "1"
    );

    const asyncApiResponse = mindeeClient.enqueueAndParse(
      mindee.product.GeneratedV1,
      inputSource,
      { endpoint: customEndpoint },
    );

    asyncApiResponse
      .then((resp) => {
        const response = { result: true, summary: resp };
        console.log('API Response:', JSON.stringify(response, null, 2));
        res.json(response);
        fs.unlinkSync(filePath);
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
