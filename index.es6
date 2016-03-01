#!/usr/bin/env node
import * as Bootstrap from './bootstrap.es6';

Bootstrap.initErrorHandling();
Bootstrap.initScribe();
Bootstrap.initServer();
