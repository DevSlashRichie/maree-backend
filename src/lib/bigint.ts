// biome-ignore lint/suspicious/noExplicitAny: fix the serialization issue of BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
