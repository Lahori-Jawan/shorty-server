import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import PublicRoutes from './routes/auth';
import RedirectRoute from './routes/url/redirect';
import ProtectedRoutes from './routes';
import {
  finalErrorHandler,
  unhandledPromiseRejectionHandler,
  uncaughtExceptionHandler,
  authMiddleware as AuthMiddleware,
  ignoreFavicon as IgnoreFavicon,
} from './middlewares';

class App {
  public app: express.Application;
  public MONGO_URL: string;

  constructor() {
    dotenv.config();
    this.MONGO_URL = process.env.MONGO_URL;
    this.app = express();
    this.mongoSetup();
    this.initializeMiddlewares();
    this.setupRoutes();
    this.setupProcessEventHandlers();
    this.initializeErrorHandlers();
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

  private mongoSetup(): void {
    mongoose.connect(this.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  }

  private setupRoutes(): void {
    this.app.use(IgnoreFavicon);
    this.app.get('/', (req, res) =>
      res.json({
        message: 'Its Working',
      })
    );
    this.app.use(RedirectRoute);
    this.app.use('/auth', PublicRoutes);
    this.app.use('/api', AuthMiddleware, ProtectedRoutes);
  }

  private setupProcessEventHandlers(): void {
    process.on('unhandledRejection', unhandledPromiseRejectionHandler);
    process.on('uncaughtException', uncaughtExceptionHandler);
  }

  private initializeErrorHandlers(): void {
    this.app.use(finalErrorHandler);
  }
}

export default new App().app;
