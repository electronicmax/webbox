
window.__modules == {};
function define(modulename, dependencies, fn) {
    if (window.__modules[modulename]) {
	 return window.__modules[modulename];
    }
    __modules[modulename] = fn.apply(window,dependencies.map(function(x) { return __modules[x]; }));
    return window.__modules[modulename];
}
function require() {
    define.apply(window,arguments);    
}