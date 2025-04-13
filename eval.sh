IFS=
code=$(cat)
file=$(mktemp XXXXXX.sic.asm)
echo $code > $file

java -cp ~/Downloads/sictools.jar sic.VM $file

trap 'rm $file' EXIT
