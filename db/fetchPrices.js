const Client = require('ftp');
const fs = require('fs');
const dotenv = require("dotenv").config();
const storePrices = require('./storePrices')


const client = new Client();

const config = {
    host: process.env.STOCKHOST,
    user: process.env.STOCKUSER,
    password: process.env.STOCKPASS
};
  console.log("Prices being retreived");

client.on('ready', () => {
    const remotePath = '/Customer Data/AF051/Prices/price_list.csv';
    const localPath = './price_list.csv';

    client.get(remotePath, (err, stream) => {
        if (err) {
            console.log("ERRORRRR DOWNLOADDINGGG THE FILLEEEE")
            console.error('Error downloading file:', err);
            client.end();
            return;
        }

        const writeStream = fs.createWriteStream(localPath);
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            try {
                await storePrices(); 
                console.log('Prices processing finished.');
            } catch (processError) {
                console.error('Error processing the prices file:', processError);
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