export const it = (description, test) => {
    try {
        test();
        pass(description);
    } catch(error) {
        fail(description);
        console.error(error);
        const message = error.message;
        const vars = message.matchAll(/\{([a-zA-Z]+)\}/g);
        for(let match in vars) {
            console.log(match[1], error[match[1]]);
        }
    }
}

export const describe = (description, tests) => {
    console.log('\x1b[4mTest Case: %s\x1b[0m ', description);
    tests();
}

export const assert = function(left) {
    return new function() {
        let isNegated = false;
        this.equals = right => {
            const isEqual = JSON.stringify(left) === JSON.stringify(right);
            if (!isEqual) {
                const error = new Error('{left} does not equal {right}.');
                error.left = JSON.stringify(left);
                error.right = JSON.stringify(right);
                throw error;
            }
        }
    }
}
function pass(msg) {
    console.log('\t\x1b[32m%s\x1b[0m', `\u2714 ${msg}`);
}

function fail(msg) {
    console.log('\t\x1b[31m%s\x1b[0m', `\u2718 ${msg}`);
}
