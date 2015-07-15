#!/bin/bash

################################################################################
# More verbose alternative to `set -e`.

set -o errtrace
trap 'err_handler $?' ERR

err_handler() {
  trap - ERR

  exit_status=$1
  idx=0

  echo "Aborting on error ${exit_status}"
  echo "Stack trace:"
  while caller ${idx} ; do
    ((idx++))
  done

  exit ${exit_status}
}

################################################################################
# Constants.

SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

INPUT_FILES=(
  chrome.manifest
  install.rdf
  chrome/content/fireKnockout.js
  chrome/content/fireKnockoutOverlay.xul
)

OUTPUT_DIRECTORY="${SCRIPT_DIR}/build"
OUTPUT_FILENAME_PREFIX="fireknockout-"
OUTPUT_FILENAME_SUFFIX=".xpi"

################################################################################
# Parse the version from `./install.rdf`.

version=$(xpath '/RDF/Description/em:version/text()' < "${SCRIPT_DIR}/install.rdf" 2> /dev/null)
[ "${version}" ] || (echo 2>&1 "No version found" ; exit 1)

output_filename="${OUTPUT_FILENAME_PREFIX}${version}${OUTPUT_FILENAME_SUFFIX}"
output_path="${OUTPUT_DIRECTORY}/${output_filename}"

################################################################################
# Create the XPI file.

mkdir -p "${OUTPUT_DIRECTORY}"
rm -f "${output_path}"

sh -c "cd ${SCRIPT_DIR} && zip ${output_path} ${INPUT_FILES[*]}"
