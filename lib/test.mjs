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

/**
 * Assert something.
 * @param expected The expected value.
 */
export const assert = function(expected) {
    return new function() {
        /**
         * @param actual The actual value.
         */
        this.equals = actual => {
            const isEqual = JSON.stringify(expected) === JSON.stringify(actual);
            if (!isEqual) {
                const error = new Error('{expected} does not equal {actual}.');
                error.expected = JSON.stringify(expected);
                error.actual = JSON.stringify(actual);
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
