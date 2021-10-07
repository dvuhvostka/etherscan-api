import express, { Request, Response } from 'express'
import axios from 'axios';

export default class ApiRouter{
    path: string =  '/api/'
    router = express.Router();
    
    
    api_key = '7IR5F5633YUFXZ5T5KDWDJHMVIQFPY4H8A';
    lastBlockUrl = `https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${ this.api_key }`;
    

    constructor() {
        this.initRoutes();
    }

    initRoutes() {
        this.router.get('/changedtokens', this.getChangedTokens );
    }

    getMaxAndMinKey = ( obj: any ): any => {
        let max = Object.keys(obj).reduce((a, b) => Math.abs(obj[a]) > Math.abs(obj[b]) ? a : b);
        return max;
    }

    async getTransactionsByBlockNumber( blockNumber: number ): Promise < any > /* Долго писать интерфейс для транзакции */ {
        const apiUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${ blockNumber.toString(16) }&boolean=true&apikey=${ this.api_key }`;
        let transactions = await axios.get( apiUrl );
        return transactions;
    }

    async getLastBlockNumber(): Promise < string > {
        const lastBlockNumber: string = ( await axios.get( this.lastBlockUrl ) as any ).data.result;
        return lastBlockNumber;
    }

    async getTransactionsByPeriod( period: number ): Promise <any> {
        
        let lastBlockNumber = Number(await this.getLastBlockNumber());
        let transactionsArray: any[] = [];

        for (let i = 0; i < period; i++ ) {
            console.log(i+1, "/", period);
            let txs = ( await this.getTransactionsByBlockNumber( lastBlockNumber - i ) as any ).data.result.transactions;
            transactionsArray.push( txs );
        }
        return transactionsArray;
    }

    async findChangesInTxs( transactionsArray: any[ ] ) {
        let txObject: any = { };
        
        for await ( let block of transactionsArray ){
            for await ( let tx of block ) {
                if( tx.value != '0x0' && tx.value ) {
                    if ( !txObject.hasOwnProperty( tx.from ) ) {
                        txObject[tx.from] = 0;
                        txObject[tx.to] = 0;
                    }
                    txObject[tx.from] -= parseInt(tx.value, 16);
                    txObject[tx.to] += parseInt(tx.value, 16);
                }
            }
        }

        return txObject;
    };

    getChangedTokens = async ( req: Request, res: Response ) => {
        let transactionsArray = await this.getTransactionsByPeriod( 100 ); // Поменять на 100.
        let addresses = await this.findChangesInTxs( transactionsArray );
        let max = this.getMaxAndMinKey( addresses );
        
        if ( !max ) return res.status(503).json({
            "error": "Something went wrong."
        });

        res.json( {
            address: max
        } );
    }
}