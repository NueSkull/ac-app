const Client = require('ftp');
const fs = require('fs');
const dotenv = require("dotenv").config();
const storeSizes = require('./storeSizes')


const client = new Client();

const config = {
    host: process.env.STOCKHOST,
    user: process.env.STOCKUSER,
    password: process.env.STOCKPASS
};
  console.log("Sizes being retrieved");

client.on('ready', () => {
    const remotePath = '/Web Files/ApparelCatalogue/ap_catalogue_sizes.csv';
    const localPath = './size_update.csv';

    client.get(remotePath, (err, stream) => {
        if (err) {
            console.error('Error downloading file:', err);
            client.end();
            return;
        }

        const writeStream = fs.createWriteStream(localPath);
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                await storeSizes(); 
                console.log('Sizes processing finished.');
            } catch (processError) {
                console.error('Error processing the sizes file:', processError);
            } finally {
                client.end();
            }
        });
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