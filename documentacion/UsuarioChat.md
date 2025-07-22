# UsuarioChat

## Descripción
Este módulo representa a un usuario dentro de una sala de chat. Gestiona la conexión, el nombre y el identificador único del usuario, así como el envío de mensajes.

## Atributos principales
- **conexion**: Conexión WebSocket asociada al usuario.
- **nombre**: Nombre del usuario.
- **id**: Identificador único del usuario (UUID).

## Métodos principales
- **enviarMesaje(msg)**: Envía un mensaje al usuario a través de la conexión WebSocket.

## Ejemplo de uso
```js
const UsuarioChat = require('./UsuarioChat');
const usuario = new UsuarioChat({ nombre: 'Juan', conexion: ws });
usuario.enviarMesaje({ texto: 'Bienvenido' });
``` 