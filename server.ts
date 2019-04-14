// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

import * as compression from 'compression';
import * as express from 'express';
import * as https from 'https';
import * as fs from 'fs';
import { join } from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

const PORT = process.env.PORT || 443;
const DIST_FOLDER = join(process.cwd(), 'app');

const certificate = fs.readFileSync('/etc/letsencrypt/live/zenretail.westeurope.cloudapp.azure.com/fullchain.pem');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/zenretail.westeurope.cloudapp.azure.com/privkey.pem');
const credentials = { key: privateKey, cert: certificate, requestCert: false, rejectUnauthorized: false };

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./app/server/main');

// Express Engine
const app = express();
// compress all responses
app.use(compression())

import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// TODO: implement data requests securely
app.get('/api/*', (req, res) => {
  res.status(404).send('data requests are not supported');
});

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
const server = https.createServer(credentials, app);
server.listen(PORT, () => {
  console.log(`Node server listening on port ${PORT}`);
});
