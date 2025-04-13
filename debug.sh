IFS=
code=$(cat)
file=$(mktemp temp/XXXXXX.sic.asm)
echo $code > $file

input=$1

echo $1 | java -jar ~/Downloads/sictools.jar $file

trap 'rm $file' EXIT
