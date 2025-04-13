IFS=
code=$(cat)
file=$(mktemp temp/XXXXXX.sic.asm)
echo $code > $file

input=$1

echo $1 | java -cp ~/Downloads/sictools.jar sic.VM -freq 99999 $file

trap 'rm $file' EXIT
