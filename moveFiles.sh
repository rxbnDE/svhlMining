#!/bin/bash
# this scripts moves all files to an s3 storage

echo "Checking all environment variables"
CHECK_VARS=("S3_BUCKET" "S3_OPTS" "STORAGE")
# S3_BUCKET: s3 bucket name
# S3_OPTS: aws cli options like profile, region, endpoint-url etc.
# STORAGE: path to local storage
for check in "${CHECK_VARS[@]}"; do
	if [[ -z "${!check}" ]]; then
		echo "variable ${check} not set or empty" 1>&2
		CHECK_VAR_FAILED=1
	else
		echo "${check}=\"${!check}\""
	fi
done
if [[ $CHECK_VAR_FAILED -eq 1 ]]; then
	echo "check failed"
	exit 2
fi
echo "check done"



## find files in subfolder and move them to s3 bucket
## args:
# $1 - subfolder
findFilesAndMove() {
	echo "lets find files in \"$1\" which are older than an hour and move them"

	pattern="${STORAGE}/$1";
	for file in ${pattern}/*.json; do
		[[ ! -e ${file} ]] && continue # continue, if file does not exist
		filename="${file/"${pattern}/"/""}"

		# age check
		AGEminutes=$((($(date +%s) - $(date +%s -r "$file")) / 60 ))
		[[ ! $AGEminutes -gt 59 ]] && continue # continue, if file is not older than 59 minutes

		# move to s3
		aws $S3_OPTS s3 mv "${file}" "s3://${S3_BUCKET}/$1/$filename"
	done

	echo "files completely processed in \"$1\""
}
findFilesAndMove "trips"
findFilesAndMove "radar"
exit 0
