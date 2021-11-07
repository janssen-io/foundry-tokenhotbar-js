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

git add .
git commit -m "Prepared for release v$1"
git tag "v$1"

zip -r token-hotbar.zip lang/ index.mjs module.json src/

echo "Updated $OLDVER to $1, ready to push: git push --tags"



