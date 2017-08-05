const cluster = require('cluster');

const startWorker = () => {
    let worker = cluster.fork();
    console.log(`Cluster: worker ${worker.id} started`);
}
if(cluster.isMaster) {
    require('os').cpus().forEach(() => {
        startWorker();
    });
    cluster.on('disconnect', (worker) => {
        console.log(`Cluster: Worker ${worker.id} disconnected from the cluster`);
    });
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Cluster: worker ${worker.id} died with code ${code} ${signal}`);
        startWorker();
    });
} else {
    const app = require('./app');
    app();
}