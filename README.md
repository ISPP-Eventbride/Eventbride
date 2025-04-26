<div align="center">

## <center>Ingeniería del Software y Práctica Profesional (ISPP)</center>

</div>
<p align="center">
    <img src="img/Eventbride.png" width="225" height="225">
</p>

## Introducción

Eventbride es una plataforma dedicada a la contratación de servicios ver con eventos como bodas, comuniones y bautizos. Permite gestionar invitados, proveedores, presupuestos y todo lo demás.

## Características

- Gestor de invitados: Organiza y realiza seguimiento de las confirmaciones de asistencia.

- Gestor de proveedores: Administra contratos y servicios de catering, música, decoración, entre otros.

- Presupuesto y pagos: Lleva un control detallado de los gastos y pagos.

- Agenda y tareas: Planifica actividades y fechas importantes.

- Interfaz intuitiva: Diseño moderno y fácil de usar.

## Guía de instalación y arranque del sistema

### Pasos previos

1. Instalar [MariaDB](https://mariadb.org/).
2. Instalar [Java 17](https://www.oracle.com/es/java/technologies/downloads/#java17).
3. Configurar variable de entorno (JAVA_HOME) con la ruta donde esté el jdk17.
4. Abrir MYSQL Client y configurar la contraseña que se desee.
5. Poner los siguientes comandos:
```
    create database eventbride; (para crear la database)
    use eventbride; (para meterte en la database)
    show tables; (para ver si se han creado. De primeras saldrá vacio)
```

6. En el proyecto buscar el archivo *application-dev.properties.example* (ruta: src\main\resources\application-dev.properties.example).

7. Duplicar ese archivo y renombrar la copia a *application-dev.properties*.

8. Cambiar en el nuevo *application-dev.properties* el usuario y la contraseña que pusieras en la instalación de MariaDB. El username habitual suele ser *root*:
```
    spring.datasource.username=${MYSQL_USER:TUUSUARIO}
    spring.datasource.password=${MYSQL_PASS:TUCONTRASEÑA}
```
> [!IMPORTANT]
> No pongas el user y contraseña entre comillas, sigue la estructura literal, por ejemplo:

```
    spring.datasource.username=${MYSQL_USER:RyanGosling}
    spring.datasource.password=${MYSQL_PASS:lalaland}
```

9. Repetir los pasos 6, 7 y 8 con el archivo *application-mysql.properties.example* (ruta: src\main\resources\application-mysql.properties.example).

### Arranque del sistema

#### ***Backend***
```
    ./mvnw clean install
    ./mvnw spring-boot:run
```
#### ***Frontend***
```
    cd frontend
    npm install
    npm run dev
```

Con las siguientes credenciales deberías poder acceder al sistema correctamente:
```
    - user: alice123
    - pass: 1234
```

¡Ya puedes empezar a realizar cambios!

## Participantes

Estos son todos los participantes de este proyecto. Gracias a ellos ha sido posible.

[![Contribuidores](https://contrib.rocks/image?repo=ISPP-Eventbride/Eventbride)](https://github.com/ISPP-Eventbride/Eventbride/graphs/contributors)

## Licencias

Puede ver la licencia de nuestro proyecto en el siguiente enlace: [Licencia](./docs/S2/legal%20implications.md)

## Contacto

- Email corporativo: eventbride6@gmail.com
- Email soporte: soporte@eventbride.fun

- [Instagram](https://www.instagram.com/eventbride_svq/)

- [LinkedIn](https://www.linkedin.com/company/eventbride/)

- [TikTok](https://www.tiktok.com/@eventbride)
