class DLNode {
  public L: DLNode;
  public R: DLNode;
  public value: any;

  constructor(value: any) {
    this.value = value;
    this.L = this;
    this.R = this;
  }
}

class DancingLinkedList {
  private head: DLNode;

  constructor(values: any[]) {
    this.head = new DLNode('HEAD');
    let current = this.head;

    for (const val of values) {
      const newNode = new DLNode(val);
      newNode.L = current;
      newNode.R = current.R;
      current.R.L = newNode;
      current.R = newNode;
      current = newNode;
    }
  }

  /**
   * Knuth's Equation (1): Deleting a node.
   * Note: The node X itself still points to its old neighbors!
   */
  public remove(x: DLNode): void {
    x.R.L = x.L;
    x.L.R = x.R;
  }

  /**
   * Knuth's Equation (2): Restoring a node (Backtrack).
   * This only works if restored in the exact reverse order of removal.
   */
  public restore(x: DLNode): void {
    x.R.L = x;
    x.L.R = x;
  }

  public toArray(): any[] {
    const result = [];
    let current = this.head.R;
    while (current !== this.head) {
      result.push(current.value);
      current = current.R;
    }
    return result;
  }

  public getNodes(): DLNode[] {
    const nodes = [];
    let current = this.head.R;
    while (current !== this.head) {
      nodes.push(current);
      current = current.R;
    }
    return nodes;
  }
}
