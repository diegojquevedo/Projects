const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const signUp = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  // Validación personalizada para contraseña
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos un símbolo, una mayúscula y un número' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    });
    return res.status(201).json({ message: 'Usuario creado exitosamente', user });
} catch (error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'El correo ya está registrado' });
  }
  return res.status(500).json({ error: 'Error al crear el usuario' });
}
};

const signIn = async (req, res) => {
const { email, password } = req.body;

if (!email || !password) {
  return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
}

try {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({ message: 'Inicio de sesión exitoso', token });
} catch (error) {
  return res.status(500).json({ error: 'Error al iniciar sesión' });
}
};

const recoveryPassword = async (req, res) => {
const { email } = req.body;

if (!email) {
  return res.status(400).json({ error: 'El correo es obligatorio' });
}

try {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const recoveryToken = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const recoveryLink = `${process.env.FRONTEND_URL}/reset-password?token=${recoveryToken}`;

  return res.status(200).json({ message: 'Link de recuperación generado', link: recoveryLink });
} catch (error) {
  return res.status(500).json({ error: 'Error al generar el link de recuperación' });
}
};

//verificación de token parte 2

const resetPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const { token } = req.query; // Obtener el token desde la URL (req.query)

    console.log('Token recibido en el backend:', req.query.token);
    console.log('Nueva contraseña recibida:', req.body.newPassword);
    console.log('Nueva contraseña confirmada:', req.body.confirmPassword);
  
    if (!token || !newPassword || !confirmPassword) {
        console.log('Falta algún parámetro');
      return res.status(400).json({ error: 'El token, la nueva contraseña y la confirmación son obligatorios' });
    }
  
    if (newPassword !== confirmPassword) {
        console.log('Las contraseñas no coinciden');
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }
  
    if (newPassword.length < 8) {
        console.log('La contraseña es demasiado corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }
  
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        console.log('La contraseña no cumple con los requisitos');
      return res.status(400).json({ error: 'La contraseña debe tener al menos un símbolo, una mayúscula y un número' });
    }
  
    try {
        console.log('Verificando token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token desde la URL
      console.log('Token verificado correctamente:', decoded);
      const user = await User.findByPk(decoded.userId);
  
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Actualizar la contraseña
      console.log('Usuario encontrado, actualizando contraseña...');
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      console.log('Contraseña actualizada exitosamente');
      return res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      return res.status(500).json({ error: 'Error al resetear la contraseña' });
    }
  };
  
  
 
module.exports = {
signUp,
signIn,
recoveryPassword,
resetPassword,
};