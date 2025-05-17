<?php

namespace App\Http\Controllers;

abstract class Controller
{
    abstract public function getAll();
    abstract public function getOne();
    abstract public function post();
    abstract public function put();
    abstract public function delete();
    abstract public function patch();
}
