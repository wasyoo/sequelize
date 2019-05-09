import { Message, User } from '../models';
import jwtUtils from '../utils/jwt.utils';
import Sequelize from 'sequelize';

export const createMessage = async (req, res) => {
  const token = req.headers.authorization;
  const idUser = jwtUtils.getUserId(token);

  if (idUser < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  const userFound = await User.findOne({
    where: {
      id: idUser
    }
  })
  
  if(!userFound)
    return res.status(400).json({ 'error': 'User not found!' });

  const { title, content } = req.body
  if(!title || !content ){
    return res.status(400).json({ 'error': 'missing parameters' });
  }
  try {
    const messages = await Message.create({
      ...req.body,
      likes: 0
    })
    return res.status(200).json({'message' : await messages.setUser(userFound)})
  }
  catch(err) {
    return res.status(500).json({'error' : 'cannot create Message'})
  }
}

export const listMessages = async (req, res) => {

  const limit = parseInt(req.query.limit) || null
  const offset = parseInt(req.query.offset) || null
  const order = req.query.order && req.query.order.split(':') || ['id', 'ASC']
  const fields = req.query.fields && req.query.fields.split(',') || null
  const find = req.query.find || null
  const Op = Sequelize.Op

  try {
    const messages = await Message.findAll(
      {
        limit,
        offset,
        order: [order],
        attributes: fields,
        where: find && {
          [Op.or]: [{title: {[Op.like]: `%${find}%`}},{content: {[Op.like]: `%${find}%`}}]
        } 
        ,
        include: {
          model: User,
          attributes: ['email', 'bio', 'username', 'isAdmin', 'createdAt'],
        },
      }
    )
    return res.status(200).json({'message': messages})
  }
  catch(err) {
    res.status(500).json({ 'error': err.message})
  }
}

export const updateMessage = async (req, res) => {
  const token = req.headers.authorization;
  const idUser = jwtUtils.getUserId(token);

  if (idUser < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  try {
    const messageFound = await Message.findOne({
      where: {
        id: req.params.id
      }
    })
  
    if(!messageFound){
      return res.status(400).json({ 'error': 'message not found!' });
    }
  
    const MessageUpdated = await messageFound.update({
      ...req.body
    })

    return res.status(400).json({ 'message': MessageUpdated });
  }
  catch(err) {
    return res.status(400).json({ 'error': 'cannot update message!' });
  }
}

export const DeleteMessage = async (req, res) => {
  try {
    const token = req.headers.authorization;
  const idUser = jwtUtils.getUserId(token);

  if (idUser < 0)
    return res.status(400).json({ 'error': 'wrong token' });
  
  const messageFound = await Message.findOne({
    where: {
      id: req.params.id
    }
  })

  if (!messageFound) {
    return res.status(400).json({ 'error': 'Message not found!' });
  }

  const messageDeleted = await Message.destroy({
    where: {
      id: req.params.id
    }
  })

  if (messageDeleted === 1)
    return res.status(200).json({ 'message': messageFound });
  }
  catch(err){
    return res.status(200).json({ 'error': 'cannot delete message' });
  }
}