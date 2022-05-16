/* eslint-disable max-classes-per-file */

export default abstract class DTErrors {
  static get ExpectedDefined() {
    return new Error("Expected value to be defined");
  }

  static get ExpectedObject() {
    return new Error("Expected value to be an object");
  }
}
