function asyncHandler(name, fn) {
    Object.defineProperty(fn, 'name', { value: name, writable: false });

    const wrappedFunc = (req, res, next) =>
        new Promise(() => fn(req, res, next), next);

    return wrappedFunc;
};

export default asyncHandler;