
/**
 * Type definitions for DOM operations and safety utilities
 */

/**
 * Type guard to check if a value is an Element
 */
export function isElement(value: unknown): value is Element {
  return value instanceof Element;
}

/**
 * Type guard to check if a value is a Node
 */
export function isNode(value: unknown): value is Node {
  return value instanceof Node;
}

/**
 * Type guard to check if a value is a ChildNode
 */
export function isChildNode(value: unknown): value is ChildNode {
  return isNode(value) && 
    ('parentNode' in value || 'parentElement' in value) &&
    typeof (value as any).remove === 'function';
}

/**
 * Type guard to check if a node is in the document
 */
export function isInDocument(node: Node | null): boolean {
  return !!node && !!document.body && document.body.contains(node);
}

/**
 * Interface for safe DOM operation responses
 */
export interface DOMOperationResult {
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * Interface for DOM registry operations
 */
export interface DOMRegistryOperations {
  registerNode: (node: Node) => void;
  unregisterNode: (node: Node) => void;
  registerOperation: (id: string) => void;
  unregisterOperation: (id: string) => void;
  cleanupOverlays: () => void;
  isDOMReady: () => boolean;
}

/**
 * Type for DOM cleanup selectors
 */
export type DOMCleanupSelector = string | string[];

/**
 * Type for DOM operation priority
 */
export type DOMOperationPriority = 'high' | 'normal' | 'low';
