class DLNode {
  public value: string | number;
  public llink: DLNode;
  public rlink: DLNode;

  constructor(value: string | number) {
    this.value = value;
    this.llink = this; // Initially point to self
    this.rlink = this;
  }

  /**
   * Equation (1) from the text: Deletes the node from the list.
   * Crucially, we DON'T nullify this node's own llink and rlink.
   */
  remove(): void {
    this.llink.rlink = this.rlink;
    this.rlink.llink = this.llink;
  }

  /**
   * Equation (2) from the text: Reinserts the node into its original position.
   * This only works because the node 'remembered' its neighbors.
   */
  restore(): void {
    this.llink.rlink = this;
    this.rlink.llink = this;
  }
}

class DancingLinksList {
  public head: DLNode;

  constructor(values: (string | number)[]) {
    this.head = new DLNode("LIST_HEAD");

    let current = this.head;
    for (const val of values) {
      const newNode = new DLNode(val);

      // Link the new node into the chain
      newNode.llink = current;
      newNode.rlink = current.rlink;

      current.rlink.llink = newNode;
      current.rlink = newNode;

      current = newNode;
    }
  }

  /**
   * Utility to print the list state
   */
  display(): void {
    const result = [];
    let current = this.head.rlink;
    while (current !== this.head) {
      result.push(current.value);
      current = current.rlink;
    }
    console.log(`List: [ ${result.join(" <-> ")} ]`);
  }

  /**
   * Finds a node by value (for demonstration)
   */
  find(value: string | number): DLNode | null {
    let current = this.head.rlink;
    while (current !== this.head) {
      if (current.value === value) return current;
      current = current.rlink;
    }
    return null;
  }
}

// --- Demonstration ---

const myList = new DancingLinksList([1, 2, 3, 4]);
myList.display(); // List: [ 1 <-> 2 <-> 3 <-> 4 ]

const node3 = myList.find(3);
const node2 = myList.find(2);

// 1. Delete the third element (as in the screenshot)
console.log("\nDeleting node 3...");
node3?.remove();
myList.display(); // List: [ 1 <-> 2 <-> 4 ]

// 2. Delete the second element
console.log("Deleting node 2...");
node2?.remove();
myList.display(); // List: [ 1 <-> 4 ]

// 3. UNDO: Restore them in reverse order (LIFO)
console.log("\nRestoring node 2...");
node2?.restore();
myList.display(); // List: [ 1 <-> 2 <-> 4 ]

console.log("Restoring node 3...");
node3?.restore();
myList.display(); // List: [ 1 <-> 2 <-> 3 <-> 4 ]
