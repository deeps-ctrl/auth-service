import app from './app';
import { Config } from './config';
import logger from './config/logger';

const startServer = () => {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () =>
            logger.info(`Server started listening on ${PORT}`),
        );
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();
