(function (global) {
  function desiredOutput(input) {
    const [x1, x2, x3] = input;
    if (x1 === -1 && x2 === -1) {
      return x3 === -1 ? 1 : -1;
    }
    return 1;
  }

  function predict(weights, bias, input) {
    const value = input.reduce((sum, value, index) => sum + weights[index] * value, bias);
    return value >= 0 ? 1 : -1;
  }

  function trainPattern(input, target, weights, bias, eta = 1) {
    const nextWeights = weights.map((weight, index) => weight + eta * target * input[index]);
    return {
      weights: nextWeights,
      bias: bias + eta * target,
    };
  }

  const PATTERNS = [];
  for (const x1 of [-1, 1]) {
    for (const x2 of [-1, 1]) {
      for (const x3 of [-1, 1]) {
        PATTERNS.push({
          input: [x1, x2, x3],
          target: desiredOutput([x1, x2, x3]),
        });
      }
    }
  }

  const api = {
    PATTERNS,
    desiredOutput,
    predict,
    trainPattern,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.perceptronModel = api;
})(typeof window !== 'undefined' ? window : globalThis);
