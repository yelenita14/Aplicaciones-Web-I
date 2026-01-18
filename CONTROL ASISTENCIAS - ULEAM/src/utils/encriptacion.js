import CryptoJS from 'crypto-js'

// Clave secreta para encriptación
const CLAVE_SECRETA = 'ULEAM_CONTROL_ASISTENCIAS_2026'

// Encriptar contraseña
export function encriptarContrasena(contrasena) {
  return CryptoJS.AES.encrypt(contrasena, CLAVE_SECRETA).toString()
}

// Desencriptar contraseña
export function desencriptarContrasena(contrasenaEncriptada) {
  try {
    const bytes = CryptoJS.AES.decrypt(contrasenaEncriptada, CLAVE_SECRETA)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (e) {
    console.error('Error al desencriptar contraseña:', e)
    return null
  }
}

// Validar contraseña encriptada (compara con texto plano)
// Soporta tanto contraseñas encriptadas como sin encriptar (legacy)
export function validarContrasena(contrasenaPlana, contrasenaAlmacenada) {
  // Primero intenta desencriptar
  const desencriptada = desencriptarContrasena(contrasenaAlmacenada)
  if (desencriptada === contrasenaPlana) {
    return true
  }
  
  // Si no funciona la desencriptación, compara directamente (legacy - contraseñas sin encriptar)
  if (contrasenaAlmacenada === contrasenaPlana) {
    return true
  }
  
  return false
}

