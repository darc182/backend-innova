import Pedido from "../models/Pedido.js";

const crearPedido = async (req,res)=>{
    const pedido = new Pedido(req.body);

    pedido.usuario  = req.usuario._id;

    
    try {
        const nuevoPedido = await pedido.save();
        res.json(nuevoPedido);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el pedido" });
    }
};





const obtenerPedidoPorId =async (req, res)=>{
    try {
        const pedido = await Pedido.findById(req.params.id).populate("productos.producto").populate("usuario");
        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el pedido" });
    }
};


const actualizarEstadoPedido = async (req, res)=>{
    try {
        const { estado } = req.body;
        const pedido = await Pedido.findById(req.params.id);

        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        // Verificar si el estado es válido
        const estadosValidos = ["pendiente", "pagado", "enviado", "entregado"];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: "Estado inválido" });
        }

        pedido.estado = estado;
        await pedido.save();
        res.json({ message: "Estado actualizado correctamente", pedido });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado" });
    }
};

// En pedidoController.js
const obtenerPedidosUsuario = async (req, res) => {
    try {
      // Si el usuario autenticado es admin, no se filtra por usuario.
      // Si es user, se filtra por su _id.
      const query = req.usuario.role === "admin" ? {} : { usuario: req.usuario._id };
  
      const pedidos = await Pedido.find(query)
      .populate("usuario", "nombre") // Obtiene solo el nombre del usuario
      .populate("productos.producto", "nombre precio") // Obtiene el nombre y el precio del producto
      .sort(req.query.sort || "-fecha");
  
      console.log("Pedidos obtenidos:", pedidos);
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener pedidos" });
    }
  };
  

export {
    crearPedido,
    obtenerPedidoPorId,
    obtenerPedidosUsuario,
    actualizarEstadoPedido
}

