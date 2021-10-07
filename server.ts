import App from './app';
import express from 'express'
import ApiRouter from './routers/ApiRouter';

const app = new App({
    port: 3000,
    routers: [
        new ApiRouter()
    ],
    middleWares: [
        express.json()
    ]
})

app.listen();