import { assertExhaustive } from "@elyukai/utils/typeSafety"
import type { MathOperation } from "@optolith/database-schema/gen"

/**
 * Evaluate a math operation, using the provided function to evaluate the values.
 */
export const evaluateMathOperation = <T>(
  operation: MathOperation<T>,
  evaluateValue: (value: T) => number,
): number => {
  switch (operation.kind) {
    case "Value":
      return evaluateValue(operation.Value)
    case "Addition": {
      const [left, right] = operation.Addition
      return (
        evaluateMathOperation(left, evaluateValue) + evaluateMathOperation(right, evaluateValue)
      )
    }
    case "Subtraction": {
      const [left, right] = operation.Subtraction
      return (
        evaluateMathOperation(left, evaluateValue) - evaluateMathOperation(right, evaluateValue)
      )
    }
    case "Multiplication": {
      const [left, right] = operation.Multiplication
      return (
        evaluateMathOperation(left, evaluateValue) * evaluateMathOperation(right, evaluateValue)
      )
    }
    case "Division": {
      const [left, right] = operation.Division
      return (
        evaluateMathOperation(left, evaluateValue) / evaluateMathOperation(right, evaluateValue)
      )
    }
    case "Exponentiation": {
      const [left, right] = operation.Exponentiation
      return Math.pow(
        evaluateMathOperation(left, evaluateValue),
        evaluateMathOperation(right, evaluateValue),
      )
    }
    default:
      return assertExhaustive(operation)
  }
}
