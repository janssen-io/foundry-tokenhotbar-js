export const it = (description, test) => {
    try {
        test();
        pass(description);
    } catch(error) {
        fail(description);
        console.error(error);
    }
}

export const assert = function(left) {
    return new function() {
        this.equals = right => {
            if (JSON.stringify(left) !== JSON.stringify(right)) {
                throw new Error(`${JSON.stringify(left)} does not equals ${JSON.stringify(right)}`);
            }
        }
    }
}
function pass(msg) {
    console.log('\x1b[32m%s\x1b[0m', `\u2714 ${msg}`);
}

function fail(msg) {
    console.log('\x1b[31m%s\x1b[0m', `\u2718 ${msg}`);
}