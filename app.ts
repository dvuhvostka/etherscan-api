import express from 'express';
import { Application } from 'express'

class App {
    app: Application
    port: number
    constructor(config: {port: number, middleWares: any, routers: any}) {
        this.app = express()
        this.port = config.port;
        this.middleWares(config.middleWares);
        this.routes(config.routers);

    }

    private middleWares(middleWares: { forEach: (arg0: (middleware: any) => void) => void; }) {
        middleWares.forEach( middleWare => {
            this.app.use(middleWare);
        });
    }

    private routes(routes: { forEach: (arg0: (controller: any) => void) => void; }) {
        routes.forEach(controller => {
            this.app.use(controller.path || '/', controller.router)
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        });
    }
}

export default App