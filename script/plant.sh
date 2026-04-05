#!/bin/bash

DIAGRAMS_DIR="./diagrams"
OUTPUT_DIR="./diagrams/out"

mkdir -p "$OUTPUT_DIR"

for file in "$DIAGRAMS_DIR"/*.puml; do
    plantuml -tpng -o "$OUTPUT_DIR" "$file"
done