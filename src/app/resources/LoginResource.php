<?php

use core\MVC\Resource as Resource;
use core\Auth as Auth;

class LoginResource extends Resource {
    public function getTokenAction() {
        $token = Auth::createToken([
            "usuario" => "juanito123",
            "nivelPrivilegios" => 1
        ]);

        $this->data = [
            "token" => $token
        ];

        $this->setData();
    }
}