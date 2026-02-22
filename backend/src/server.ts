import cluster from 'cluster';
import os from 'os';
import { httpServer } from './app.js';

const PORT = process.env.PORT || 3003;

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    console.log(`Primary ${process.pid} is running. Forking ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Starting a new one...`);
        cluster.fork();
    });
} else {
    httpServer.listen(PORT, () => {
        console.log(`Worker ${process.pid} started. Listening on port ${PORT}`);
    });
}
