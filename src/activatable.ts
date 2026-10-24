import { isNotEmpty, type NonEmptyArray } from "@elyukai/utils/array/nonEmpty"
import { sumWith } from "@elyukai/utils/array/reductions"
import { range } from "@elyukai/utils/range"
import { assertExhaustive } from "@elyukai/utils/typeSafety"
import type * as Gen from "@optolith/database-schema/gen"
import { evaluateMathOperation } from "./utils.ts"

export const getFixedAdventurePointsForInactiveActivatableInstance = (
  config: { value: number; onlyHighestLevelOnce: boolean },
  instance: { level?: number },
  highestLevel?: number,
): number => {
  if (instance.level === undefined) {
    return config.value
  }

  if (config.onlyHighestLevelOnce && highestLevel !== undefined) {
    return instance.level <= highestLevel ? 0 : config.value * (instance.level - highestLevel)
  }

  return config.value * instance.level
}

export const getFixedAdventurePointsForActiveActivatableInstances = (
  config: { value: number; onlyHighestLevelOnce: boolean },
  instances: NonEmptyArray<{ level?: number }>,
): number => {
  if (config.onlyHighestLevelOnce) {
    const highestLevel = Math.max(...instances.map(i => i.level ?? 1))
    return highestLevel * config.value
  }

  return sumWith(instances, instance => (instance.level ?? 1) * config.value)
}

export const getAdventurePointsByLevelForInactiveActivatableInstance = (
  config: Gen.AdventurePointsValueByLevel,
  instance: { level?: number },
  sizeCategory: keyof Gen.BySizeCategory<number>,
): number => {
  const base = config.list[instance.level ?? 1 - 1] ?? 0
  const additional = config.additionalBySizeCategory?.[sizeCategory] ?? 0
  return base + additional * (instance.level ?? 1)
}

export const getAdventurePointsByLevelForActiveActivatableInstances = (
  config: Gen.AdventurePointsValueByLevel,
  instances: NonEmptyArray<{ level?: number }>,
  sizeCategory: keyof Gen.BySizeCategory<number>,
): number =>
  sumWith(instances, instance =>
    getAdventurePointsByLevelForInactiveActivatableInstance(config, instance, sizeCategory),
  )

export const getAdventurePointsDependingOnSelectionForInactiveActivatableInstance = <O>(
  config: (option: O) => number,
  instance: { options?: O[] },
): number =>
  instance.options !== undefined && isNotEmpty(instance.options) ? config(instance.options[0]) : 0

export const getAdventurePointsDependingOnSelectionForActiveActivatableInstances = <O>(
  config: (option: O) => number,
  instances: NonEmptyArray<{ options?: O[] }>,
): number =>
  sumWith(instances, instance =>
    getAdventurePointsDependingOnSelectionForInactiveActivatableInstance(config, instance),
  )

export const getAdventurePointsDependingOnActiveForInactiveActivatableInstance = (
  config: Gen.AdventurePointsDependingOnActive,
  checkActive: (id: Gen.ActivatableIdentifier) => boolean,
): number => (checkActive(config.id) ? config.active : config.inactive)

export const getAdventurePointsDependingOnActiveForActiveActivatableInstances = (
  config: Gen.AdventurePointsDependingOnActive,
  checkActive: (id: Gen.ActivatableIdentifier) => boolean,
  instanceCount: number,
): number =>
  getAdventurePointsDependingOnActiveForInactiveActivatableInstance(config, checkActive) *
  instanceCount

export const getAdventurePointsDependingOnActiveInstancesForInactiveActivatableInstance = (
  config: Gen.AdventurePointsDependingOnActiveInstances,
  instanceCount: number,
): number => {
  switch (config.kind) {
    case "Expression":
      return evaluateMathOperation(config.Expression.expression, value => {
        switch (value.kind) {
          case "Active":
            return instanceCount
          case "Constant":
            return value.Constant
          default:
            return assertExhaustive(value)
        }
      })
    case "Threshold":
      return instanceCount < config.Threshold.threshold
        ? config.Threshold.normal
        : config.Threshold.alternative
    default:
      return assertExhaustive(config)
  }
}

export const getAdventurePointsDependingOnActiveInstancesForActiveActivatableInstances = (
  config: Gen.AdventurePointsDependingOnActiveInstances,
  instanceCount: number,
): number =>
  sumWith(range(0, instanceCount - 1), count =>
    getAdventurePointsDependingOnActiveInstancesForInactiveActivatableInstance(config, count),
  )

export const getAdventurePointsForActiveActivatableInstances = <O>(
  config: Gen.AdventurePointsValue,
  instances: NonEmptyArray<{ level?: number; options?: O[] }>,
  getAPValueForOption: (option: O) => number,
  checkActive: (id: Gen.ActivatableIdentifier) => boolean,
  sizeCategory: keyof Gen.BySizeCategory<number>,
): number => {
  switch (config.kind) {
    case "Fixed":
      return getFixedAdventurePointsForActiveActivatableInstances(
        { value: config.Fixed, onlyHighestLevelOnce: false },
        instances,
      )
    case "ByLevel":
      return getAdventurePointsByLevelForActiveActivatableInstances(
        config.ByLevel,
        instances,
        sizeCategory,
      )
    case "DerivedFromSelection":
      return getAdventurePointsDependingOnSelectionForActiveActivatableInstances(
        getAPValueForOption,
        instances,
      )
    case "DependingOnActive":
      return getAdventurePointsDependingOnActiveForActiveActivatableInstances(
        config.DependingOnActive,
        checkActive,
        instances.length,
      )
    case "DependingOnActiveInstances":
      return getAdventurePointsDependingOnActiveInstancesForActiveActivatableInstances(
        config.DependingOnActiveInstances,
        instances.length,
      )
    case "Indefinite":
      return 0
    default:
      return assertExhaustive(config)
  }
}
