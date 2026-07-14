// === CONFIGURACIÓN GLOBAL  ===
let carrito = [];
let productos = [];
const CLAVE_CARRITO = "carrito";

// === PETICIÓN ASINCRÓNICA A LA API (JSON) ===
function cargarProductosDesdeJSON() {
    fetch("productos.json")
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("Error al recuperar los datos del archivo JSON");
            }
            return respuesta.json();
        })
        .then(datos => {
            productos = datos;
            mostrarProductos(); 
        })
        .catch(error => {
            console.error("Fallo en la comunicación con la API interna:", error);
        });
}

// === RENDERIZACIÓN DE TARJETAS EN EL DOM ===
function mostrarProductos() {
    const lista = document.getElementById("productos-container");
    
    if (!lista) return;
    
    lista.innerHTML = "";

    productos.forEach((producto, indice) => {
        const item = document.createElement("div");
        item.className = "card-horizontal"; 

        item.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="card-horizontal-img">
            <div class="card-horizontal-content">
                <div class="card-horizontal-text">
                    <h3>${producto.nombre}</h3>
                    <p class="producto-descripcion">${producto.descripcion || ""}</p>
                </div>
                <div class="card-horizontal-action">
                    <p class="producto-precio">$${producto.precio}</p>
                    <button class="btn-agregar" data-indice="${indice}">Agregar</button>
                </div>
            </div>
        `;

        lista.appendChild(item);
    });

    // Eventos para los botones de compra creados
    const botones = document.querySelectorAll(".btn-agregar");
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const indice = parseInt(boton.getAttribute("data-indice"));
            agregarProducto(productos[indice]);
        });
    });
}

// === GESTIÓN DEL ALMACENAMIENTO LOCAL CON LOCALSTORAGE ===
function guardarCarrito() {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function cargarCarrito() {
    const guardado = localStorage.getItem(CLAVE_CARRITO);
    if (guardado) {
        carrito = JSON.parse(guardado);
    }
}

// === LÓGICA DE INTERACCIÓN DEL CARRITO ===
function agregarProducto(producto) {
    const productoExistente = carrito.find(item => item.nombre === producto.nombre);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();
}

function quitarProducto(indice) {
    carrito.splice(indice, 1);
    actualizarCarrito();
}

function cambiarCantidad(indice, cambio) {
    carrito[indice].cantidad += cambio;

    if (carrito[indice].cantidad <= 0) {
        quitarProducto(indice);
    } else {
        actualizarCarrito();
    }
}

function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
}

function calcularTotal() {
    return carrito.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);
}

/// === ACTUALIZACIÓN DINÁMICA DE LA INTERFAZ DEL CARRITO ===
function actualizarCarrito() {
    const listaCarrito = document.getElementById("items-carrito");
    const totalTexto = document.getElementById("total-carrito");
    const cantidadTexto = document.getElementById("cantidad-carrito");

    if (!listaCarrito || !totalTexto || !cantidadTexto) return;

    listaCarrito.innerHTML = "";

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<li class='carrito-vacio' style='text-align: center; list-style: none; font-size: 14px; color: #777;'>Tu carrito está vacío.</li>";
    } else {
        carrito.forEach((item, i) => {
            const elementoLi = document.createElement("li");
            
            elementoLi.className = "item-carrito-linea"; 

            elementoLi.innerHTML = `
                <div class="carrito-item-info">
                    <span class="carrito-item-nombre"><strong>${item.nombre}</strong> (x${item.cantidad})</span>
                    <span class="carrito-item-precio">$${item.precio * item.cantidad}</span>
                </div>
                <div class="carrito-item-controles">
                    <button class="btn-cantidad" data-indice="${i}" data-cambio="-1">-</button>
                    <button class="btn-cantidad" data-indice="${i}" data-cambio="1">+</button>
                    <button class="btn-eliminar" data-indice="${i}">✕</button>
                </div>
            `;

            listaCarrito.appendChild(elementoLi);
        });

        // Eventos para los selectores de cantidad (+ / -)
        const botonesCantidad = document.querySelectorAll(".btn-cantidad");
        botonesCantidad.forEach(boton => {
            boton.addEventListener("click", () => {
                const indice = parseInt(boton.getAttribute("data-indice"));
                const cambio = parseInt(boton.getAttribute("data-cambio"));
                cambiarCantidad(indice, cambio);
            });
        });

        // Eventos para los botones de eliminación directa (✕)
        const botonesEliminar = document.querySelectorAll(".btn-eliminar");
        botonesEliminar.forEach(boton => {
            boton.addEventListener("click", () => {
                const indice = parseInt(boton.getAttribute("data-indice"));
                quitarProducto(indice);
            });
        });
    }

    totalTexto.textContent = `$${calcularTotal()}`;
    cantidadTexto.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);

    guardarCarrito();
}

// === FINALIZACIÓN DE LA COMPRA ===
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. Agregá productos antes de pagar.");
        return;
    }

    alert(`¡Gracias por tu compra! El total es: $${calcularTotal()}.\nPronto nos comunicaremos para coordinar la entrega.`);
    vaciarCarrito();
}

// === INICIALIZACIÓN DE COMPONENTES  ===
document.addEventListener("DOMContentLoaded", function () {
    cargarCarrito();

    cargarProductosDesdeJSON();
    
    actualizarCarrito();

    let botonVaciar = document.getElementById("btn-vaciar");
    let botonPagar = document.getElementById("btn-pagar");

    if (botonVaciar) {
        botonVaciar.addEventListener("click", vaciarCarrito);
    }
    if (botonPagar) {
        botonPagar.addEventListener("click", finalizarCompra);
    }
});