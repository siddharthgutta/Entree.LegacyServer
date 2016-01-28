#!/usr/bin/env node
import * as Bootstrap from './bootstrap'

Bootstrap.initScribe();
Bootstrap.initDatabase();
Bootstrap.initServer();