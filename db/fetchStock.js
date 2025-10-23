const Client = require('ftp');
const fs = require('fs');
const dotenv = require("dotenv").config();
const storeStock = require('./storeStock')


const client = new Client();

const config = {
    host: process.env.STOCKHOST,
    user: process.env.STOCKUSER,
    password: process.env.STOCKPASS
};
  console.log("Stock being retreived");

client.on('ready', () => {
    const remotePath = '/Customer Data/AF051/Stock/stock_list.csv';
    const localPath = './stock_update.csv';

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
                await storeStock(); 
                console.log('Stock processing finished.');
            } catch (processError) {
                console.error('Error processing the stock file:', processError);
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