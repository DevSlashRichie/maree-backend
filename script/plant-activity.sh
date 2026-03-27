#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

DIAGRAMS_DIR="$PROJECT_DIR/diagrams/activity"
OUTPUT_DIR="$PROJECT_DIR/diagrams/activity/photos"

mkdir -p "$OUTPUT_DIR"

for file in "$DIAGRAMS_DIR"/*.puml; do
    plantuml -tpng -o "$OUTPUT_DIR" "$file"
done
