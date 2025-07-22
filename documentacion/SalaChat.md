# SalaChat

## Descripción
Este módulo representa una sala de chat donde los usuarios pueden unirse, enviar y recibir mensajes. Gestiona la lista de usuarios conectados y la comunicación entre ellos.

## Atributos principales
- **usuarios**: Lista de usuarios conectados a la sala.
- **nombre**: Nombre de la sala de chat.
- **id**: Identificador único de la sala.

## Métodos principales
- **agregarUsuario(usuario)**: Agrega un usuario a la sala.
- **eliminarUsuario(usuario)**: Elimina un usuario de la sala.
- **enviarMensaje(mensaje, usuario)**: Envía un mensaje a todos los usuarios de la sala.
- **obtenerUsuarios()**: Devuelve la lista de usuarios conectados.

## Ejemplo de uso
```js
const SalaChat = require('./SalaChat');
const sala = new SalaChat({ nombre: 'General' });
sala.agregarUsuario(usuario1);
sala.enviarMensaje({ texto: '¡Hola a todos!' }, usuario1);
``` 