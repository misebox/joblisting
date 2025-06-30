#!/bin/bash

# PostgreSQL connection script for local development
# This connects to the PostgreSQL instance defined in compose.yaml

PGPASSWORD=password psql -h localhost -p 5432 -U postgres -d postgres
