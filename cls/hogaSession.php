<?php
class hogaSession {

    static protected $userID = 0;

    static protected $hasStarted = false;

    static protected $hasSessionCookie = null;

    static protected $callbackFunctions = array();

    static protected $handlerInstance = null;
    static protected $CookieTimeout = 20;
    function __construct() {

    }

    static public function &get( $key = null, $defaultValue = null )
    {
        if ( $key === null )
            return $_SESSION;
        else if ( isset( $_SESSION[ $key ] ) )
            return $_SESSION[ $key ];
        return $defaultValue;
    }

    static public function set( $key, $value )
    {
        $_SESSION[ $key ] = $value;
        return true;
    }

    static public function issetkey( $key, $forceStart = true )
    {
        return isset( $_SESSION[ $key ] );
    }


    static public function unsetkey( $key, $forceStart = true )
    {
        if ( !isset( $_SESSION[ $key ] ) )
            return false;

        unset( $_SESSION[ $key ] );
        return true;
    }

    static public function setCookieParams( $lifetime = false )
    {
        $params	= session_get_cookie_params();
        if ( $lifetime === false )
                $lifetime = static::$CookieTimeout;
         else
            $lifetime = $params['lifetime'];

        $path   = '/';
        $domain = $_SERVER['HTTP_HOST'];
        $secure = off;
        session_set_cookie_params( $lifetime, $path, $domain, $secure );

    }

    /**
     * Starts the session and sets the timeout of the session cookie.
     * Multiple calls will be ignored unless you call {@link eZSession::stop()} first.
     *
     * @since 4.1
     * @param int|false $cookieTimeout Use this to set custom cookie timeout.
     * @return bool Depending on if session was started.
     */
    static public function start( $cookieTimeout = false )
    {
        if ( self::lazyStart( false ) === false )
        {
            return false;
        }
        self::setCookieParams( $cookieTimeout );
        return self::forceStart();
    }

    /**
     * Inits eZSession and starts it if user has cookie and $startIfUserHasCookie is true.
     *
     * @since 4.4
     * @param bool $startIfUserHasCookie
     * @return bool|null
     */
    static public function lazyStart( $startIfUserHasCookie = true )
    {
        if ( self::$hasStarted  )
        {
            return false;
        }
        if ( $startIfUserHasCookie && self::$hasSessionCookie )
        {
            self::setCookieParams();
            return self::forceStart();
        }
        return null;
    }

    /**
     * See {@link eZSession::start()}
     *
     * @since 4.4
     * @return true
     */
    static protected function forceStart()
    {
        session_start();
        return self::$hasStarted = true;
    }

    /**
     * Gets/generates the user hash for use in validating the session based on [Session]
     * SessionValidation* site.ini settings. The default hash is result of md5('empty').
     *
     * @since 4.1
     * @deprecated as of 4.4, only returns default md5('empty') hash now for BC.
     * @return string MD5 hash based on parts of the user ip and agent string.
     */
    static public function getUserSessionHash()
    {
        return 'a2e4822a98337283e39f7b60acf85ec9';
    }

    /**
     * Writes session data and stops the session, if not already stopped.
     *
     * @since 4.1
     * @return bool Depending on if session was stopped.
     */
    static public function stop()
    {
        if ( !self::$hasStarted )
        {
            return false;
        }
        session_write_close();
        self::$hasStarted = false;
        self::$handlerInstance = null;
        return true;
    }


    /**
     * Removes the current session and resets session variables.
     * Note: implicit stops session as well!
     *
     * @since 4.1
     * @return bool Depending on if session was removed.
     */
    static public function remove()
    {
        if ( !self::$hasStarted )
        {
            return false;
        }
        $_SESSION = array();
        session_destroy();
        self::$hasStarted = false;
        self::$handlerInstance = null;
        return true;
    }

    /**
     * Sets the current userID used by ezpSessionHandlerDB::write() on shutdown.
     *
     * @since 4.1
     * @param int $userID to use in {@link ezpSessionHandlerDB::write()}
     */
    static public function setUserID( $userID )
    {
        self::$userID = $userID;
    }

    /**
     * Gets the current user id.
     *
     * @since 4.1
     * @return int User id stored by {@link eZSession::setUserID()}
     */
    static public function userID()
    {
        return self::$userID;
    }

    /**
     * Returns if user had session cookie at start of request or not.
     *
     * @since 4.1
     * @return bool|null Null if session is not started yet.
     */
    static public function userHasSessionCookie()
    {
        return self::$hasSessionCookie;
    }

    /**
     * Returns if user session validated against stored data in db
     * or if it was invalidated during the current request.
     *
     * @since 4.1
     * @deprecated as of 4.4, only returns true for bc
     * @return bool|null Null if user is not validated yet (for instance a new session).
     */
    static public function userSessionIsValid()
    {
        return true;
    }

    /**
     * Return value to indicate if session has started or not
     *
     * @since 4.4
     * @return bool
     */
    static public function hasStarted()
    {
        return self::$hasStarted;
    }

}
?>