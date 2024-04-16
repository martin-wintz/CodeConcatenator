// utils.js

/**
 * Debounces a function so it will only execute after waiting a specified amount of time
 * since the last call.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {boolean} immediate True to execute the function immediately, false to delay execution.
 * @return {Function} A debounced version of the given function.
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Export the debounce function
module.exports = {
    debounce,
};
