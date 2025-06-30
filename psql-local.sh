#!/bin/bash

# PostgreSQL connection script for local development
# This connects to the PostgreSQL instance defined in compose.yaml

PGPASSWORD=pass psql -h localhost -p 5432 -U user -d dbname
