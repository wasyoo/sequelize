import express from 'express';
import {
  login, register, getMe, getUserProfile, UpdateUserProfile,
} from './routes/userCtrl';
import { createMessage, listMessages, DeleteMessage, updateMessage } from './routes/messageCtrl';

const apiRouter = express.Router();

apiRouter.post('/users/register', register)
apiRouter.post('/users/login', login)
apiRouter.get('/users/me', getMe)
apiRouter.get('/users/:id', getUserProfile)
apiRouter.post('/users/update', UpdateUserProfile)
apiRouter.post('/message/add', createMessage)
apiRouter.get('/messages', listMessages)
apiRouter.delete('/message/:id', DeleteMessage)
apiRouter.put('/message/:id', updateMessage)
export default apiRouter;