import express from 'express';
import bodyParser from 'body-parser';
import apiRouter from './apiRouter';
import models from './models';

const PORT = process.env.PORT || 4000;

const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use('/api/', apiRouter);

server.listen(PORT,()=>{
  // console.log(models.sequelize)
  // models.sequelize.sync()
  console.log("server is running on port 4000")
})