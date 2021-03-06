function vista_Productos(puntoMontaje, categoria) {
    if (($(puntoMontaje).children().length < 1 || $(puntoMontaje).children(".c-final").length > 0) && GLOBAL_VISTA_ACTUAL !== "productos") {
        cargarVista('ofertas');
        return false;
    }
    if (GLOBAL_VISTA_ACTUAL != "productos" && GLOBAL_VISTA_ACTUAL != "ofertas") {
        $.when(montarMenu("/api/menu", "productos")).then(() => { vista_Productos_montarMenu(puntoMontaje, categoria) });
    } else {
        vista_Productos_montarMenu(puntoMontaje, categoria);
    }
}

function vista_Productos_Ofertas(puntoMontaje) {
    $.when(montarMenu("/api/menu", "productos")).then(() => { vista_Productos_montarMenu(puntoMontaje, false) });
    $(puntoMontaje).html("<div class='c-productos js-productos-destacados'></div>")
    GLOBAL_GESTOR_PRODUCTOS.getProductosDestacados().then((productos) => {
        productos.forEach(producto => {
            if (!vista_Productos_existeEnGrid(producto.id)) {
                $('.js-productos-destacados').append(vista_Productos_generarProducto(producto))
            }
        })
        $(".js-producto-carrito").off('click').on('click', function (evento) {
            evento.stopPropagation();
            carrito_AñadirArticulo($(this).parent().data('id'));
        })
        $(".js-producto").on('click', vista_Productos_generarModal)
    })
}

function vista_Productos_montarMenu(puntoMontaje, categoria) {
    if (categoria.hasOwnProperty("nombre")) {
        $(".c-menu__sub").removeClass("c-menu__item--destacado")
        $("[data-id=" + categoria["nombre"] + "]").addClass("c-menu__item--destacado")
        if ($(".l-distribucion__menu--expandido").length < 1) {
            $(`
            <div class="l-distribucion__menu--expandido">
                <div class="c-menu-expandido c-menu-expandido--plegado js-menu-expandido"> 
                    <div class='c-menu-expandido__borde' onclick='vista_Productos_alternarExtendido()'> 
                        <i class='fas fa-angle-right c-menu-expandido__flecha'></i> 
                    </div>
                    <p class="c-menu-expandido__titulo">Filtro</p>
                    <ul class="c-menu-expandido__listado js-menu-expandido__listado">
                    </ul>
                </div>
            </div>
        `).insertBefore(".l-distribucion__menu")
        }
        GLOBAL_GESTOR_PRODUCTOS.getCategoriasEnCategoriaPrincipal(categoria["nombre"]).then((cates) => {
            var html = "";
            cates.forEach(cate => {
                html += `<li>
                            <label class="c-menu-expandido__item">
                                <input type="checkbox" onclick="vista_Productos__montarContenido('` + puntoMontaje + `')" class="c-menu-expandido__checkbox js-menu-expandido__checkbox__` + cate + `" checked>` + cate + 
                           `</label>
                        </li>`;
            })
            $(".js-menu-expandido__listado").html(html)
            vista_Productos__montarContenido(puntoMontaje, categoria["nombre"])
        })
    } else {
        if ($(".js-menu-productos__contenedor").length < 1) {
            var contenedorCategoriasPrincipales = "<li class='js-menu-productos__contenedor'><ul>"
            contenedorCategoriasPrincipales += `<li class="c-menu__item  c-menu__sub c-menu__item--destacado" onclick="cargarVista('ofertas')">Ofertas</li>`
            GLOBAL_GESTOR_PRODUCTOS.getCategoriasPrincipales().forEach(cate => {
                contenedorCategoriasPrincipales += `<li data-id='` + cate + `'class='c-menu__item c-menu__sub' onclick='cargarVista("productos",{"nombre" : "` + cate + `"})'>` + cate + `</li>`
            })
            contenedorCategoriasPrincipales += "</ul></li>"
            $(contenedorCategoriasPrincipales).insertAfter(".js-menu-productos")
        } else {
            $(".js-menu-productos__contenedor").remove()
        }
    }
}

function vista_Productos__montarContenido(puntoMontaje, categoria) {
    if (categoria == undefined) {
        var categoria = $(".c-menu__item--destacado").last().data('id')
        vista_Productos_montarContenidoCategoria(puntoMontaje, categoria)

    } else {
        vista_Productos_montarContenidoCategoria(puntoMontaje, categoria)
    }
}
function vista_Productos_montarContenidoCategoria(puntoMontaje, categoria) {
    GLOBAL_GESTOR_PRODUCTOS.getCategoriasEnCategoriaPrincipal(categoria).then((cates) => {
        var montados = 0
        $(puntoMontaje).html("");
        cates.forEach(cate => {
            if ($('.js-menu-expandido__checkbox__' + cate).is(':checked')) {
                vista_Productos_cargarDe(puntoMontaje, categoria, cate)
                montados++;
            }
        })
        if (montados < 1) {
            $(puntoMontaje).html("<div class='c-final'><i class='far fa-sad-tear fa-7x c-final__emoticono'></i><h1 class='c-final__cabecera c-final__cabecera--sub-cabecera'>Vaya, nos hemos quedado sin productos.</h1><h3 class='c-boton c-boton--basico' onclick='vista_Productos_restablecerFiltro(\"" + puntoMontaje + "\")'>Restablecer el filtro</h3></div>")
        }
    })
}
function vista_Productos_generarModal(evento) {
    evento.stopImmediatePropagation()
    GLOBAL_GESTOR_PRODUCTOS.generarModal($(this).data('id'))
}

function vista_Productos_cargarDe(puntoMontaje, categoriaPrincipal, categoria) {
    if ($('.js-productos-destacados').length < 1) {
        $(puntoMontaje).append("<div class='c-productos js-productos-destacados'></div>")
    } if ($('.js-productos-normales').length < 1) {
        $(puntoMontaje).append("<div class='c-productos js-productos-normales'></div>")
    }
    GLOBAL_GESTOR_PRODUCTOS.getProductosCategoria(categoriaPrincipal, categoria).then((productos) => {
        productos.forEach(producto => {
            if (!vista_Productos_existeEnGrid(producto.id)) {
                if (producto["destacado"] == 1) {
                    $('.js-productos-destacados').append(vista_Productos_generarProducto(producto))
                } else {
                    $('.js-productos-normales').append(vista_Productos_generarProducto(producto))
                }
            }
        })
        $(".js-producto-carrito").off('click').on('click', function (evento) {
            evento.stopPropagation();
            carrito_AñadirArticulo($(this).parent().data('id'));
        })
        $(".js-producto").on('click', vista_Productos_generarModal)
        if ($($(".js-productos-destacados")[0]).children().length < 1) {
            $(".js-productos-destacados").remove()
        }
    })
}
function vista_Productos_existeEnGrid(id) {
    var hijos = $(".c-productos").children()
    var encontrado = false
    for (var x = 0; x < hijos.length; x++) {
        if ($(hijos[x]).data("id") == id) { return hijos[x] }
    }
    return encontrado
}
function vista_Productos_generarProducto(producto) {
    var html = `
    <div data-id='`+ producto["id"] + `' class='c-producto js-producto'>
    <img class='c-producto__imagen' src='/imagenes/productos/`+ producto["foto"] + `'>`
    if (producto["destacado"] == 1) {
        html += `
        <div class='c-producto__imagen-destacado'>
            <i class='fas fa-star fa-3x'></i>
        </div>
        `
    }
    html += `
            <p class='c-producto__titulo'>
                `+ producto["nombre"].charAt(0).toUpperCase() + producto["nombre"].slice(1) + `
            </p> 
        <div class='c-producto__precio'>
            `+ precioEnEuros(producto["precio"]) + `
        </div>
        <div class='c-producto__carrito`
    if (GLOBAL_CARRITO.getArticulo(producto.id) !== undefined) {
        html += ` c-producto__carrito--en-carrito`
    }
    html += ` js-producto-carrito'>
            <i class='fas fa-cart-plus'></i>
        </div>
    </div>
    `
    return html;
}

function vista_Productos_alternarExtendido() {
    $(".c-menu-expandido__flecha").toggleClass("c-menu-expandido__flecha--plegado").toggleClass("c-menu-expandido__flecha--desplegado")
    if ($(".js-menu-expandido").hasClass("c-menu-expandido--plegado")) {
        $(".js-menu-expandido").removeClass("c-menu-expandido--plegado").addClass("c-menu-expandido--desplegando")
    } else {
        $(".js-menu-expandido").toggleClass("c-menu-expandido--plegando").toggleClass("c-menu-expandido--desplegando")
    }
}

function vista_Productos_restablecerFiltro(puntoMontaje) {
    $(".c-menu-expandido__checkbox").prop("checked", true);
    vista_Productos__montarContenido(puntoMontaje)
}