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

## Cancelación y reposición

El endpoint administrativo existente permite cancelar únicamente pedidos en
`pending` o `processing`. El cambio a `cancelled` y la devolución de todas las
unidades se guardan en la misma transacción. Las demás transiciones conservan
su política y no modifican stock. Todas las actualizaciones de estado necesitan
MongoDB con soporte de transacciones.

Repetir una cancelación ya confirmada devuelve el pedido sin volver a sumar
existencias. Dos solicitudes simultáneas se resuelven mediante la escritura
condicional del estado y los reintentos transaccionales. Si compiten envío y
cancelación de un pedido en preparación, solo una transición puede confirmarse.

Se devuelve stock a productos inactivos sin reactivarlos. Si falta un producto,
hay cantidades inválidas o el stock no puede representarse como entero seguro
no negativo, se responde 409 y no se guarda ningún cambio parcial. Es necesario
corregir los datos antes de repetir la operación; no se recrean productos.

Los pedidos que ya estaban cancelados antes de esta corrección no se reparan
automáticamente: el estado por sí solo no permite saber si hubo una reposición
manual. Una conciliación histórica requeriría una tarea separada. La cancelación
no modifica el carrito, los importes ni el estado del pago y no ejecuta reembolsos.

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
node --import tsx --test src/services/order-cancellation.test.ts
```

La suite comprueba rollback ante fallos en escrituras, disputa por la última
unidad, checkout duplicado del mismo carrito y rechazo de guardados antiguos.
Las pruebas unitarias de validación y errores complementan estas comprobaciones;
no sustituyen la ejecución contra el replica set.

La suite de cancelación verifica reposición completa, reintentos, concurrencia,
carrera entre envío y cancelación, rollback ante fallos y productos no disponibles.
