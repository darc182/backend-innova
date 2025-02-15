import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from '../helpers/emailRegistro.js';
import emailOlvidePassword from '../helpers/emailOlvidePassword.js';

const registrar = async (req, res) =>{
    const { email, nombre } = req.body;

    try {
        const usuarioExiste = await Usuario.findOne({ email });

        if (usuarioExiste) {
            const error =  new Error('Usuario ya registrado')
            return res.status(400).json({ msg: error.message });
        }


        const usuario = new Usuario(req.body);
        const usuarioGuardado = await usuario.save();

        emailRegistro({
            email, 
            nombre,
            token: usuarioGuardado.token
        })

        res.json(usuarioGuardado)

    } catch (error) {
        console.log(error);
        
    }
    
};

const perfil = (req, res)=>{
    const {usuario} = req;

    res.json(usuario)
    
};


const confirmar = async (req, res)=>{
    const {token} = req.params;

    const usuarioConfirmar = await Usuario.findOne({token});

    if (!usuarioConfirmar) {
        const error =  new Error('Token no valido')
        return res.status(400).json({ msg: error.message });
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg: 'Usuario Confirmado Correctamente'});
    } catch (error) {
        console.log(error);
        
    }
    
};


const autenticar =async (req, res)=>{
    const {email, password} = req.body;

    const usuario =  await Usuario.findOne({email});

    if (!usuario) {
        const error =  new Error('El Usuario no existe')
        return res.status(404).json({ msg: error.message });
    }

    if (!usuario.confirmado){
        const error =  new Error('Tu Cuenta no ha sido confirmada')
        return res.status(403).json({ msg: error.message });
    }

    //Revisar el password
    if (await usuario.comprobarPassword(password)) {
        //autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            role: usuario.role,
            token: generarJWT(usuario.id,usuario.role)
        });
    }else{
        const error =  new Error('El Pasword es incorrecto')
        return res.status(403).json({ msg: error.message });
    }
};

const olividePassword = async (req,res)=>{
    const {email} = req.body;

    const existeUsuario = await Usuario.findOne({email});

    if (!existeUsuario) {
        const error = new Error('El usuario no existe');
        return res.status(400).json({msg: error.message})
    }

    try {
        existeUsuario.token = generarId();
        await existeUsuario.save();

        emailOlvidePassword({
            email,
            nombre: existeUsuario.nombre,
            token: existeUsuario.token
        })

        res.json({msg: 'Hemos enviado un email con las intrucciones'})
    } catch (error) {
        console.log(error);
        
    }
};

const comprobarToken = async(req,res)=>{
    const {token} = req.params;

    const tokenValido = await Usuario.findOne({token});

    if (tokenValido) {
        res.json({msg: 'Token valido y el usuario existe'});
    } else {
        const error = new Error('Token no valido');
        return res.status(400).json({msg: error.message}) 
    }
};

const nuevoPassword = async (req, res)=>{
    const {token} =  req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token});

    if (!usuario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message}) 
    }

    try {
        usuario.token = null;
        usuario.password = password;
        await usuario.save();
        res.json({msg: 'Password modificado correctamente'});
        
    } catch (error) {
        console.log(error);
        
    }
};


const actualizarPerfil = async (req, res) => {
    const { id } = req.usuario;
    const { nombre, direccion, telefono } = req.body;

    try {
        const usuario = await Usuario.findByIdAndUpdate(
            id,
            { 
                nombre: nombre.trim(),
                direccion: direccion?.trim(),
                telefono: telefono?.trim()
            },
            { new: true, runValidators: true }
        ).select('-password -token -confirmado -__v');

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el perfil' });
    }
};

const cambiarPassword = async (req, res) => {
    const { id } = req.usuario;
    const { passwordActual, nuevoPassword } = req.body;

    try {
        const usuario = await Usuario.findById(id);
        
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // Verificar password actual
        const passwordCorrecto = await usuario.comprobarPassword(passwordActual);
        if (!passwordCorrecto) {
            return res.status(400).json({ msg: 'Password actual incorrecto' });
        }

        // Validar nuevo password
        if (nuevoPassword.length < 6) {
            return res.status(400).json({ msg: 'El password debe tener al menos 6 caracteres' });
        }

        // Actualizar password
        usuario.password = nuevoPassword;
        await usuario.save();

        res.json({ msg: 'Password actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al cambiar la contraseña' });
    }
};


export{
    registrar,
    perfil,
    confirmar,
    autenticar,
    olividePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    cambiarPassword
    
}