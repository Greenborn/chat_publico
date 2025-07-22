# Documentación del Backend

Este directorio contiene la documentación detallada de los módulos principales del backend del proyecto.

## Índice
- [SalaChat](./SalaChat.md)
- [UsuarioChat](./UsuarioChat.md)


---

## ¿Cómo contribuir?
Agrega o actualiza la documentación de cada módulo en los archivos correspondientes. 

---

## Ejemplo de configuración de Nginx

```nginx
server {
    listen 443 ssl;
    server_name chat.greenborn.com.ar;

    # Cabeceras recomendadas
    add_header Access-Control-Allow-Origin "*";
    add_header Alt-Svc  'h3=":443"; ma=3600, h2=":443"; ma=3600';

    # Servir archivos estáticos del frontend
    root /var/www/chat_publico/front/dist;
    index index.html;

    location / {
        try_files $uri $uri/ @rewrite_url;
        add_header Alt-Svc  'h3=":443"; ma=3600, h2=":443"; ma=3600';
    }

    # Proxy para WebSocket
    location /ws/ {
        proxy_pass http://localhost:8998/;  # Puerto del backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
    }

    # Certificados SSL (ajusta las rutas según tu instalación de Certbot)
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    ssl_certificate /etc/letsencrypt/live/chat.greenborn.com.ar-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.greenborn.com.ar-0001/privkey.pem;
}

server {
    listen 80;
    server_name chat.greenborn.com.ar;
    return 301 https://$host$request_uri;
}
```

> **Notas:**
> - Cambia el path de `root` si tu build está en otra carpeta.
> - El bloque `/ws/` es esencial para que el WebSocket funcione correctamente.
> - Recuerda recargar Nginx tras modificar la configuración: `sudo systemctl reload nginx`. 