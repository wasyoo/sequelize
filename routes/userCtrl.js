import bcrypt from 'bcryptjs'
import jwtUtils from '../utils/jwt.utils';
import models from '../models';

export const login = async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password ){
    return res.status(400).json({ 'error': 'missing parameters' });
  }

  try {
    const userFound = await models.User.findOne({
      where: { email }
    })
    
    if (!userFound) {
      return res.status(403).json({'error': 'wrong email'});
    }
    if (!bcrypt.compareSync(password, userFound.password)) {
      return res.status(403).json({'error': 'wrong password'});
    }
  
    return res.status(200).json({
      'userId' : userFound,
      'token' :jwtUtils.generateTokenForUser(userFound),
    })
  }
  catch(err) {
    return res.status(500).json({ 'error': 'unable to verify user'})
  }
}

export const register = async (req, res) => {
  const { email, username, password } = req.body;
  if(!email || !username || !password ){
    return res.status(400).json({ 'error': 'missing parameters' });
  }

  try {
    const userFound = await models.User.findOne({
      attributes: ['email'],
      where: { email }
    })
    if (userFound) {
      return res.status(409).json({ 'error': 'user already exist' })
    }
  } 
  catch(err) {
    res.status(500).json({ 'error': 'unable to verify user'})
  }
  

  try {
    const passwordHash = bcrypt.hashSync(password, 10)
    const newUser = await models.User.create({
      ...req.body,
      isAdmin: 0,
      password: passwordHash
    })
    return res.status(200).json({
      'user' : newUser,
      'token' :jwtUtils.generateTokenForUser(newUser),
    })
  }
  catch(err) {
    return res.status(500).json({'error' : 'cannot add user'})
  }
}

export const getMe = async (req, res) => {
  const token = req.headers.authorization;
  const userId = jwtUtils.getUserId(token);

  if (userId < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  try {
    const userFound = await models.User.findOne({
      attributes: ['email', 'bio', 'username', 'isAdmin', 'createdAt'],
      where: {
        id: userId
      },
      include: models.Message,
    })
    if(userFound) {
      return res.status(400).json({ 'user': userFound });
    } else {
      return res.status(400).json({ 'error': 'User not found!' });
    }
  }
  catch(err){
    return res.status(500).json({ 'error': 'unable to verify user'})
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const userFound = await models.User.findOne({
      attributes: ['email', 'bio', 'username', 'isAdmin', 'createdAt'],
      where: {
        id: req.params.id
      },
      include: models.Message,
    })
    if(userFound) {
      return res.status(400).json({ 'user': userFound });
    } else {
      return res.status(400).json({ 'error': 'User not found!' });
    }
  }
  catch(err){
    return res.status(500).json({ 'error': 'unable to verify user'})
  }
}

export const UpdateUserProfile = async (req, res) => {
  
  const token = req.headers.authorization;
  const userId = jwtUtils.getUserId(token);

  if (userId < 0)
    return res.status(400).json({ 'error': 'wrong token' });

  try {
    const userFound = await models.User.findOne({
      attributes: ['id', 'email', 'bio', 'username', 'isAdmin'],
      where: {
        id: userId
      }
    })
    if(userFound) {
      const userUpdated = await userFound.update({
        ...req.body
      })
      if(!userUpdated){
        return res.status(400).json({ 'error': 'cannot update user!' });
      }
      return res.status(400).json({ 'user': userUpdated });
    } else {
      return res.status(400).json({ 'error': 'User not found!' });
    }
  }
  catch(err){
    return res.status(500).json({ 'error': 'unable to verify user'})
  }
}