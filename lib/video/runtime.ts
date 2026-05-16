export type RuntimeVariables = Record<string, string | number | boolean | null>

type RuntimeCondition = {
  key?: string
  operator?: 'equals' | 'not_equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'not_exists'
  value?: unknown
}

export function evaluateRuntimeConditions(
  conditions: RuntimeCondition[] | undefined,
  variables: RuntimeVariables
) {
  if (!conditions || conditions.length === 0) return true

  return conditions.every((condition) => {
    const key = condition.key
    const current = key ? variables[key] : undefined

    switch (condition.operator || 'equals') {
      case 'exists':
        return current !== undefined && current !== null && current !== ''
      case 'not_exists':
        return current === undefined || current === null || current === ''
      case 'not_equals':
        return current !== condition.value
      case 'gt':
        return Number(current) > Number(condition.value)
      case 'gte':
        return Number(current) >= Number(condition.value)
      case 'lt':
        return Number(current) < Number(condition.value)
      case 'lte':
        return Number(current) <= Number(condition.value)
      case 'equals':
      default:
        return current === condition.value
    }
  })
}

export function applyVariableAssignments(
  variables: RuntimeVariables,
  assignments?: Record<string, unknown>
) {
  if (!assignments) return variables

  const next = { ...variables }

  for (const [key, assignment] of Object.entries(assignments)) {
    if (
      assignment &&
      typeof assignment === 'object' &&
      'operation' in assignment &&
      'value' in assignment
    ) {
      const operation = String((assignment as { operation: unknown }).operation)
      const value = (assignment as { value: unknown }).value

      if (operation === 'increment') {
        next[key] = Number(next[key] || 0) + Number(value || 1)
      } else if (operation === 'decrement') {
        next[key] = Number(next[key] || 0) - Number(value || 1)
      } else if (operation === 'reset') {
        next[key] = null
      } else {
        next[key] = value as RuntimeVariables[string]
      }
    } else {
      next[key] = assignment as RuntimeVariables[string]
    }
  }

  return next
}

