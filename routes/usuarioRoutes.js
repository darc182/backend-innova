import express from 'express';
import { 
    registrar,
    perfil,
    confirmar,
    autenticar,
    olividePassword,
    nuevoPassword,
    comprobarToken,
    actualizarPerfil,
    cambiarPassword
   

 } from '../controllers/usuarioController.js';

 import {checkAuth} from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', registrar);
router.get('/confirmar/:token', confirmar);
router.post('/login', autenticar);
router.post('/olvide-password', olividePassword);
router.route('/olvide-password/:token')
            .get(comprobarToken).post(nuevoPassword);

router.get('/perfil',checkAuth, perfil);
router.put('/actualizar-perfil', checkAuth, actualizarPerfil);
router.put('/cambiar-password', checkAuth, cambiarPassword);


export default router;