IFS=
code=$(cat)
file=$(mktemp temp/XXXXXX.sic.asm)
echo $code > $file

java -jar ~/Downloads/sictools.jar $file

trap 'rm $file' EXIT
