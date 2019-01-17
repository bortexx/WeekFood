#!/bin/bash
set -e

NOMBRE_CONTENEDOR=weekfood_www
PUERTO_CONTENEDOR=8004
VOLUMEN=/opt/webapps/weekfood/www/

# TODO: comprobar $HOSTNAME si es preproduccion, sino salir con 1

printf "> Copiando dist/ a ../../www \n"
    # TODO evitar subir a favor de ruta en variable
    rm ../../www/* -rf && 
    cp ./build/config/htaccess ../../www/.htaccess &&
    cp ./dist/* ../../www -r &&
    mv ../../www/configs/preprod_config.php ../../www/configs/config.php
    printf "> Copiado correctamente. \n"

printf "> Creando contenedor"
# TODO: comprobar si el contenedor ya esta running (o incluso borrarlo para recrearlo)
# https://stackoverflow.com/questions/38576337/how-to-execute-a-bash-command-only-if-a-docker-container-with-a-given-name-does
    docker container run \
    -p $PUERTO_CONTENEDOR:80 \
    --name $NOMBRE_CONTENEDOR \
    --detach \
    --volume $VOLUMEN:/var/www/html \
    php:7.2-apache
printf "> Contenedor creado correctamente. \n"

printf "> Configurando contenedor \n"
    printf "\t> Activando modulo rewrite \n"
    docker exec -it $NOMBRE_CONTENEDOR a2enmod rewrite

    printf "\t> Activando extension PDO de PHP \n"
    docker exec -it $NOMBRE_CONTENEDOR docker-php-ext-install pdo pdo_mysql

    rintf "\t> Reiniciando contenedor \n"
    docker container restart weekfood_www

    printf "> Contenedor configurado correctamente. \n"    