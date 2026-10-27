/**
 * 已挂载实例的 appKey。
 * TOKEN_INVALID 取任一在挂实例，壳按实例定向回发；多开时关掉其中一个不影响其余实例。
 */
const mounted = new Set<string>();

export function addMountedInstance(appKey: string): void {
  mounted.add(appKey);
}

export function removeMountedInstance(appKey: string): void {
  mounted.delete(appKey);
}

export function peekMountedInstance(): string | undefined {
  return mounted.values().next().value;
}
