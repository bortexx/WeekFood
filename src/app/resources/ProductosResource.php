<?php

use core\MVC\Resource as Resource;
use vendor\firebase\phpjwt\JWT as JWT;

class ProductosResource extends Resource {
    public function getCarruselAction() {
        $this->sql = 'SELECT foto FROM productos ORDER BY RAND() LIMIT 5';
        $this->execSQL();
        $this->setData();
    }

    public function getTodosAction() {

        /* estaAutenticado */
        if (!isset(getallheaders()['x-jwt-token'])) {
            header('HTTP/1.1 403 Forbidden', true, 403);
            $this->setError(403, "No se ha enviando token JWT");
            exit();
        }

        $jwt = getallheaders()['x-jwt-token'];

        echo '@@@ JWT' . $jwt;
        /* end estaAutenticado */
        //if ()

        $this->sql = 'SELECT * FROM productos';
        $this->execSQL();
        $this->setData();
    }

    public function getCategoriasPrincipalesTodosAction() {
        $this->sql = 'SELECT * FROM categoriasprincipales';
        $this->execSQL();
        $this->setData();
    }

    public function getCategoriasTodosAction() {
        $params = [
            "categoriaPrincipal" => $this->controller->getParam("categoriaPrincipal")
        ];
        $this->sql = 'SELECT nombre FROM categorias WHERE subCategoriaDe = :categoriaPrincipal';
        $this->execSQL($params);
        $this->setData();
    }

    public function getCategoriaAction() {
        $params = [
            "categoriaEspecifica" => "%" . $this->controller->getParam("categoriaEspecifica") . "%"
        ];
        $this->sql = 'SELECT * FROM productos WHERE categoria LIKE :categoriaEspecifica';
        $this->execSQL($params);
        $this->setData();
    }
}