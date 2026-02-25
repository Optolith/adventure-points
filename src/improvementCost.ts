import { assertExhaustive } from "@elyukai/utils/typeSafety"

export type ImprovementCost = "A" | "B" | "C" | "D" | "E"

/**
 * Returns the base adventure points for an improvement cost. This may be multiplied by a factor for higher ratings.
 */
const getBase = (improvementCost: ImprovementCost): number => {
  switch (improvementCost) {
    case "A":
      return 1
    case "B":
      return 2
    case "C":
      return 3
    case "D":
      return 4
    case "E":
      return 15
    default:
      return assertExhaustive(improvementCost)
  }
}

/**
 * Returns the last rating for which the adventure points for an improvement cost are the same as for the previous rating. For higher ratings, the adventure points increase by the base value for each rating.
 */
const getLastRatingOfConstantValue = (improvementCost: ImprovementCost): number => {
  switch (improvementCost) {
    case "A":
    case "B":
    case "C":
    case "D":
      return 12
    case "E":
      return 14
    default:
      return assertExhaustive(improvementCost)
  }
}

/**
 * Returns the adventure points for activating a skill of the specified improvement cost.
 */
export const getAdventurePointsForActivation = (improvementCost: ImprovementCost): number =>
  getBase(improvementCost)

/**
 * Returns the adventure points to increment a rating to the specified rating.
 *
 * This only calculates a single step. To calculate the sum of adventure points for going from and to an arbitrary rating, use {@link calculateAdventurePointsFromImprovementCost} with a rating range.
 *
 * @throws {RangeError} if the rating is negative, since adventure points are not defined for negative ratings.
 * @example
 * getAdventurePointsForRating("A", 1) // returns 1
 * getAdventurePointsForRating("A", 12) // returns 1
 * getAdventurePointsForRating("A", 13) // returns 2
 * getAdventurePointsForRating("A", 14) // returns 3
 */
export const getAdventurePointsForRating = (
  improvementCost: ImprovementCost,
  rating: number,
): number => {
  if (rating < 0) {
    throw new RangeError("Adventure points are not defined for negative ratings.")
  }

  const base = getBase(improvementCost)
  const lastRatingOfSameValue = getLastRatingOfConstantValue(improvementCost)

  return base * (rating < lastRatingOfSameValue ? 1 : rating - lastRatingOfSameValue + 1)
}

/**
 * Returns the adventure points to increment a rating from the specified source rating to the specified target rating.
 *
 * If the target rating is lower than the source rating, a negative value is returned that reflects how many adventure points are returned when decrementing the rating.
 * @param from The source rating to increment from.
 * @param to The target rating to increment to.
 * @returns The change in spent adventure points when changing the rating from the source rating to the target rating.
 * @throws {RangeError} if at least one of the given ratings is negative, since adventure points are not defined for negative ratings.
 */
export const getAdventurePointsForRatingRange = (
  improvementCost: ImprovementCost,
  from: number,
  to: number,
): number => {
  if (from < 0 || to < 0) {
    throw new RangeError("Adventure points are not defined for negative ratings.")
  }

  const base = getBase(improvementCost)
  const lastRatingOfSameValue = getLastRatingOfConstantValue(improvementCost)

  const [min, max, negate] = from <= to ? [from, to, false] : [to, from, true]

  const size = max - min
  const constantRangeSize = Math.min(size, lastRatingOfSameValue - min)
  const variableRangeSize = size - constantRangeSize

  const constantCost = base * constantRangeSize
  const variableCost = base * (((variableRangeSize + 1) * (variableRangeSize + 2)) / 2 - 1)

  const totalCost = constantCost + variableCost

  // checking totalCost > 0 to avoid returning -0
  return totalCost * (negate && totalCost > 0 ? -1 : 1)
}
