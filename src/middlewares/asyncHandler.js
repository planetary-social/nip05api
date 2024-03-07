export default function asyncHandler(name, asyncFn) {
    Object.defineProperty(asyncFn, 'name', { value: name, writable: false });

    const wrappedFunc = (req, res, next) =>
        asyncFn(req, res).then(next).catch(next);

    return wrappedFunc;
};