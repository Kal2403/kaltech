# Transacciones de checkout

La creación de pedidos necesita MongoDB con transacciones: un replica set o un
despliegue fragmentado compatible. Una instancia standalone no permite este
checkout. No existe una alternativa que escriba sin transacción.

El servidor valida dirección y método de pago antes de abrir la transacción.
Las lecturas de productos y carrito, descuentos condicionales de stock, guardado
del pedido y vaciado del carrito utilizan la misma sesión. Cualquier fallo
revierte todas esas escrituras. Los precios y la identidad del usuario proceden
del servidor, no del cuerpo enviado por el cliente. Impuestos y envío conservan
las reglas existentes.

Los guardados del carrito usan concurrencia optimista. Una edición con una
versión antigua recibe 409 y debe recargar antes de reintentarse. Tras completar
una compra, un nuevo checkout con el carrito vacío responde 400 y no crea otro
pedido. No se reproduce la respuesta anterior ni se incorporan claves de
idempotencia. Si el carrito vuelve a llenarse, una nueva compra es otra operación.

La cancelación y la reposición de existencias se tratarán en otra rama.

## Pruebas aisladas

Desde `server`, ejecutar `npm test`. La suite de pedidos utiliza
`mongodb-memory-server` como dependencia de desarrollo y arranca un replica set
temporal de MongoDB 8.2.6. La primera ejecución puede necesitar conexión a Internet
para descargar el binario; las siguientes pueden utilizar la caché local.

No se utiliza `MONGO_URI` ni se carga `.env`. La suite crea datos ficticios en su
instancia local aislada y cierra la conexión y el proceso al terminar. No hace
falta configurar una base existente. Las comprobaciones de CI ejecutan esta
suite mediante el comando `npm test` que ya estaba configurado.

Para ejecutar únicamente las pruebas de pedidos:

```sh
node --import tsx --test src/services/order.service.test.ts
```

La suite comprueba rollback ante fallos en escrituras, disputa por la última
unidad, checkout duplicado del mismo carrito y rechazo de guardados antiguos.
Las pruebas unitarias de validación y errores complementan estas comprobaciones;
no sustituyen la ejecución contra el replica set.
