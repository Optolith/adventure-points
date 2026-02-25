import { equal } from "node:assert/strict"
import { describe, it } from "node:test"
import {
  getAdventurePointsForActivation,
  getAdventurePointsForRating,
  getAdventurePointsForRatingRange,
} from "../src/improvementCost.ts"

describe("getAdventurePointsForActivation", () => {
  it("calculates the correct adventure points for activation", () => {
    equal(getAdventurePointsForActivation("A"), 1)
    equal(getAdventurePointsForActivation("B"), 2)
    equal(getAdventurePointsForActivation("C"), 3)
    equal(getAdventurePointsForActivation("D"), 4)
    equal(getAdventurePointsForActivation("E"), 15)
  })
})

describe("getAdventurePointsForRating", () => {
  it("calculates the correct adventure points for a single rating", () => {
    equal(getAdventurePointsForRating("A", 1), 1)
    equal(getAdventurePointsForRating("A", 12), 1)
    equal(getAdventurePointsForRating("A", 13), 2)
    equal(getAdventurePointsForRating("A", 14), 3)
    equal(getAdventurePointsForRating("A", 15), 4)
    equal(getAdventurePointsForRating("D", 1), 4)
    equal(getAdventurePointsForRating("D", 12), 4)
    equal(getAdventurePointsForRating("D", 13), 8)
    equal(getAdventurePointsForRating("D", 14), 12)
    equal(getAdventurePointsForRating("D", 15), 16)
    equal(getAdventurePointsForRating("E", 1), 15)
    equal(getAdventurePointsForRating("E", 12), 15)
    equal(getAdventurePointsForRating("E", 13), 15)
    equal(getAdventurePointsForRating("E", 14), 15)
    equal(getAdventurePointsForRating("E", 15), 30)
    equal(getAdventurePointsForRating("E", 16), 45)
  })
})

describe("getAdventurePointsForRatingRange", () => {
  it("returns 0 for an empty rating range", () => {
    equal(getAdventurePointsForRatingRange("A", 1, 1), 0)
    equal(getAdventurePointsForRatingRange("A", 5, 5), 0)
  })

  it("calculates the correct adventure points for a rating range", () => {
    equal(getAdventurePointsForRatingRange("A", 1, 12), 11)
    equal(getAdventurePointsForRatingRange("A", 1, 13), 13)
    equal(getAdventurePointsForRatingRange("A", 1, 14), 16)
    equal(getAdventurePointsForRatingRange("A", 1, 15), 20)
    equal(getAdventurePointsForRatingRange("D", 1, 15), 80)
    equal(getAdventurePointsForRatingRange("E", 1, 16), 270)
  })

  it("calculates negative adventure points for a decreasing rating range", () => {
    equal(getAdventurePointsForRatingRange("A", 12, 1), -11)
    equal(getAdventurePointsForRatingRange("A", 13, 1), -13)
    equal(getAdventurePointsForRatingRange("A", 14, 1), -16)
    equal(getAdventurePointsForRatingRange("A", 15, 1), -20)
    equal(getAdventurePointsForRatingRange("D", 15, 1), -80)
    equal(getAdventurePointsForRatingRange("E", 16, 1), -270)
  })
})
