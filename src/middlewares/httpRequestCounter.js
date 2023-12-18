export default function httpRequestCounter(counterName) {
    const httpRequestCounter = new req.promClient.Counter({
        name: counterName,
        help: `Total number of HTTP requests for ${counterName}`,
        registers: [req.promRegister],
      });

    return (req, res, next) => {
        httpRequestCounter.inc();
        next();
    };
};