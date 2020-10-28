export default function tryy(promise) {
  return promise
    .then((data) => [null, data])
    .catch((err) => [err])
}
