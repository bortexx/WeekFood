class GestorProductos {
    constructor() {
        this.seHaPedidoExplicitamenteDestacados = false
        this.productos = []
        this.categoriasPrincipales = []
        GLOBAL_CACHE_JSONS.getJSON("/api/productos/categorias/subcategorias").then((respuesta) => {
            respuesta.forEach(categoria => {
                var categoriaEncontrada = this.categoriasPrincipales.find(categoriaPrincipal => this.filtrarCategoriaPrincipal(categoria["subCategoriaDe"], categoriaPrincipal))
                if (categoriaEncontrada == undefined) {
                    var nuevaCategoria = new Categoria(categoria.subCategoriaDe)
                    nuevaCategoria.categorias.push(categoria["nombre"])
                    this.categoriasPrincipales.push(nuevaCategoria)
                } else {
                    categoriaEncontrada.categorias.push(categoria["nombre"])
                }
            })
        })
    }
    /**
     * 
     * @param {String} categoriaPrincipal Categoria buscando
     * @param {Categoria} actual Categoria actual en el array
     */
    filtrarCategoriaPrincipal(categoriaPrincipal, actual) {
        return actual.nombre == categoriaPrincipal
    }
    /**
     * 
     * @param {String} categoria Categoria buscando
     * @param {Producto} actual producto actual en el array
     */
    filtrarCategoria(categoria, actual) {
        return actual.categorias.indexOf(categoria) > -1
    }
    /**
     * 
     * @param {int} id Id del producto que se esta buscando
     * @param {Producto} actual producto actual en el array
     */
    filtrarId(id, actual) {
        return actual.id == id
    }
    /**
     * @param {String} categoriaPrincipal Categoria principal a buscar
     * 
     */
    getCategoriasEnCategoriaPrincipal(categoriaPrincipal) {
        var categoriaEncontrada = this.categoriasPrincipales.find(categoria => this.filtrarCategoriaPrincipal(categoriaPrincipal, categoria))
        if (categoriaEncontrada == undefined) { return undefined }
        if (categoriaEncontrada.categorias.length > 0) {
            return $.when(categoriaEncontrada.categorias)
        } else {
            return GLOBAL_CACHE_JSONS.getJSON("/api/productos/categorias/" + categoriaPrincipal+"/subcategorias").then((respuesta) => {
                var categoriasDescargadas = []
                respuesta.forEach(categoria => {
                    categoriasDescargadas.push(categoria.nombre)
                    categoriaEncontrada.categorias.push(categoria.nombre)
                });
                return categoriaEncontrada
            })
        }
    }
    /**
     * 
     * @param {String} categoria Categoria a buscar
     */
    getProductosCategoria(categoriaPrincipal, categoria) {
        var productosFiltrados = this.productos.filter(producto => this.filtrarCategoria(categoria, producto))
        if (productosFiltrados.length > 0) {
            return $.when(productosFiltrados)
        } else {
            return GLOBAL_CACHE_JSONS.getJSON("/api/productos?categoria="+ categoria).then((respuesta) => {
                var nuevosProductos = []
                respuesta.forEach(prod => {
                    var nuevoProducto = new Producto(prod.id, prod.nombre, prod.foto, (prod.destacado == 1), prod.categoria.split(","), prod.descripcion, prod.precio)
                    if (this.getProductoId(nuevoProducto.id) == undefined){
                        this.productos.push(nuevoProducto)
                    }
                    nuevosProductos.push(nuevoProducto)
                });
                return nuevosProductos
            })
        }
    }
    /**
     * 
     * @param {int} id Id a buscar
     */
    getProductoId(id) {
        return this.productos.find(producto => this.filtrarId(id, producto))
    }

    getCategoriasPrincipales() {
        return this.categoriasPrincipales.map(cate => cate.nombre)
    }
    /**
    * 
    * @param {int} id Id del producto a generar la ventana modal.
    * @param {String} tipo tipo de la ventana a generar, defecto info
    * @param {function} callback_Confirmar callback del boton confirmar en caso de que exista, defecto funcion vacia
    * @param {function} callback_Denegar callback del boton denegar en caso de que exista, defecto funcion vacia
    */
    generarModal(id, tipo = "info", callback_Confirmar = () => { }, callback_Denegar = () => { }) {

        var producto = this.getProductoId(id)
        if (producto == undefined) { throw "El producto no existe." }
        generarVentanaModal({
            tamaño: 'pequeño',
            contenido: generarModalProducto(producto),
        })

        $('.js-modal-producto_añadir-carrito').on('click', function () {
            carrito_AñadirArticulo(producto.id);
            cerrarVentanaModal();
        });
    }

    getProductosDestacados() {
        var productosFiltrados = this.productos.filter(producto => producto.destacado)
        if (productosFiltrados.length > 0 && this.seHaPedidoExplicitamenteDestacados) {
            return $.when(productosFiltrados)
        } else {
            return GLOBAL_CACHE_JSONS.getJSON("/api/productos?destacado=1").then((respuesta) => {
                this.seHaPedidoExplicitamenteDestacados = true
                var nuevosProductos = []
                respuesta.forEach(prod => {
                    var nuevoProducto = new Producto(prod.id, prod.nombre, prod.foto, (prod.destacado == 1), prod.categoria.split(","), prod.descripcion, prod.precio)
                    if (this.getProductoId(nuevoProducto.id) == undefined){
                        this.productos.push(nuevoProducto)
                    }
                    nuevosProductos.push(nuevoProducto)
                });
                return nuevosProductos
            })
        }
    }
    /**
     * 
     * @param {int} id Id a descargar
     */
    descargarProductoId(id) {
        var productoFiltrado = this.getProductoId(id)
        if (productoFiltrado !== undefined) {
            return $.when(productoFiltrado)
        } else {
            return GLOBAL_CACHE_JSONS.getJSON("/api/productos/" + id).then((respuesta) => {
                var nuevoProducto = new Producto(respuesta[0].id, respuesta[0].nombre, respuesta[0].foto, (respuesta[0].destacado == 1), respuesta[0].categoria.split(","), respuesta[0].descripcion, respuesta[0].precio)
                this.productos.push(nuevoProducto)
                return true
            })
        }
    }
}