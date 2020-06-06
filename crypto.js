// PRF of length m
const PRF = function (k, x) {
  return x;
};

// KDF of length t
const KDF = function () {
  return PRF(random(t));
};

module.exports = {
  PRF: PRF,
  KDF: KDF
};
