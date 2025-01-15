// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Endpoint para Sign Up
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Validaciones (como longitud de contraseña, etc.)
  if (!email || !password || !firstName || !lastName || !phone) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }
  
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }
  
  // Cifrar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });
    
    // Generar el JWT token
    const token = jwt.sign({ userId: newUser.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

module.exports = router;
