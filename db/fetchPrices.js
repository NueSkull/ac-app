const Client = require('ftp');
const fs = require('fs');
const dotenv = require("dotenv").config();
const storePrices = require('./storePrices');

const client = new Client();

const config = {
    host: process.env.STOCKHOST,
    user: process.env.STOCKUSER,
    password: process.env.STOCKPASS
};

console.log("Prices being retrieved");

client.on('ready', () => {
    const remoteDir = '/Web Files/Apparel Catalogue/';

    client.list(remoteDir, async (err, list) => {
        if (err) {
            console.error('Error listing directory:', err);
            client.end();
            return;
        }

        const priceFiles = list.filter(file => file.name.includes('ap_catalogue_prices') && file.type === '-');

        for (const file of priceFiles) {
            const remotePath = `${remoteDir}${file.name}`;
            const localPath = `./${file.name}`;

            await new Promise((resolve, reject) => {
                client.get(remotePath, (err, stream) => {
                    if (err) return reject(err);

                    const writeStream = fs.createWriteStream(localPath);
                    stream.pipe(writeStream);

                    writeStream.on('finish', async () => {
                        try {
                            await storePrices(localPath, file.name);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            });
        }
        client.end();
    });
});

client.on('error', (err) => {
    console.error('FTP Client Error:', err);
});

client.on('close', (hadError) => {
    if (hadError) {
        console.error('Connection closed due to an error.');
    } else {
        console.log('Connection closed.');
    }
});

client.connect(config);