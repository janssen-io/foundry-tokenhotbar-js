if [ -z "$1" ]; then
    echo "No argument supplied: preprelease x.y.z"
    exit 1
fi

if [[ `git status --porcelain` ]]; then
    echo "Please commit your changes first"
    exit 1
fi

OLDVER=`cat module.json | jq -r '.version'`
sed -i "s/$OLDVER/$1/g" module.json README.md

echo "Updated $OLDVER to $1, please commit and tag."

