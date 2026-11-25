import {createServer} from 'node:http';
import {auth,transact,walletRef} from './firebase.mjs';
import {rapidHandler} from './http.mjs';

const origin=process.env.RAPID_WEB_ORIGIN||'https://semicolonxss.github.io';
createServer(rapidHandler({origin,auth,transact,walletRef})).listen(Number(process.env.PORT||3000),'0.0.0.0');
