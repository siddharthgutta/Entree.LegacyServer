#!/usr/bin/env node
import * as Bootstrap from './bootstrap.es6';

Bootstrap.initScribe();
Bootstrap.initDatabase();
Bootstrap.initServer();
