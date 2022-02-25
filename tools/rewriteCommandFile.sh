cd "$( dirname "${BASH_SOURCE[0]}" )"

CATEGORIES=$(ls ../src/commands)
FILE=""

for category in $CATEGORIES
do
	if [[ $category != *.* ]]
	then
		FILE+="// $category\n"
		FILES=$(ls ../src/commands/$category)
		for file in $FILES
		do
			FILE+="export {command as $file} from './$category/$file/command.js';\n"
		done

		FILE+="\n"
	fi
done

FILE=${FILE::-2} # Remove last newline

printf "$FILE" > "../src/commands/commands.ts"
printf "Updated commands.ts successfully"
