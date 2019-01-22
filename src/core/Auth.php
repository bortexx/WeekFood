<?php
namespace core;

use vendor\firebase\phpjwt\ExpiredException as ExpiredException;
use vendor\firebase\phpjwt\JWT as JWT;
use vendor\firebase\phpjwt\SignatureInvalidException as SignatureInvalidException;

class Auth {
    static private $PRIVATE_KEY = "F4Ev-17IbLRcEkwr2p8NRL62bys5fo6AqJrfWZwd5wBUBqDdDueKZz4VlJiWaD1TOXkmNtrU2gCmhNeZvimikm-3yI293zaufdnSoJ0isJ_i1SDmR8GeWVTVkBIPRewP4yBlb2uHbm1Uxppd0wkFau8iNmm5tqQppG0O5Rij5oojForsrvT8ahB9YYkX3fbM5u0RAW4AHbXqrN62xlN17FuXzZUtknI_W_HSOnnrQH5Rj0ZaT2GzRdR9PyaoXfLEduCq_2NowAxIzznsn-OnTFf7VuSrqmj5z1cvO_qyGM0sDNJiUQjKV-R-FQYK9yBkWsWclncU7CVN8uz44CSQng";

    static private $token = null;

    static function createToken($data) {
        $token = [
            "iat" => time(),
            "exp" => time() + 60 * 60 * 24 /* 1 dia */,
            "data" => $data
        ];

        $jwt = JWT::encode($token, self::$PRIVATE_KEY, 'HS256');

        return $jwt;
    }

    static function decodeToken($jwt) {
        /* TODO: usar la estructura valida, porque firebase comprueba expiracion y payload y tal */
        self::setToken();

        /* TODO: naming token jwt ??? diferencias? */
        $token;

        try {
            $token = JWT::decode($jwt, self::$PRIVATE_KEY, ['HS256']);
        } catch (SignatureInvalidException $e) {
            echo '@@@@ firma inválida @@@@';
            // TODO: dedicir que devolver en caso de expirado
            exit();
        } catch (ExpiredException $e) {
            echo '@@@@ expirado @@@@';
            // TODO: dedicir que devolver en caso de expirado
            exit();
        }

        return JWT::decode($jwt, self::$PRIVATE_KEY, ['HS256']);
    }

    static private function setToken() {
        if (self::$token == null) {
            if (!isset(getallheaders()['x-jwt-token'])) {
                throw new AuthHeaderNotPresentException();
            }
    
            self::$token = getallheaders()['x-jwt-token'];
        }
    }
}

class AuthJWTHeaderMissingException extends \Exception {
    public function __construct() {
        parent::__construct('Header X-JWT-TOKEN no presente en la petición');
    }
}