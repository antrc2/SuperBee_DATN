<?php

namespace App\Http\Controllers;

abstract class Controller
{
    abstract public function index();
    abstract public function show();
    abstract public function store();
    abstract public function update();
    abstract public function destroy();
}
