export default function asyncHandler(name, fn) {
    Object.defineProperty(fn, 'name', { value: name, writable: false });

    const wrappedFunc = (req, res, next) =>
        fn(req, res).then(next).catch(next);
    

    return wrappedFunc;
};