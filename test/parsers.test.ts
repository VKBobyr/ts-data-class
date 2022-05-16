import { DTErrors, Parsers } from "../src";

describe("Parsers", () => {
  describe("makeParserDefined", () => {
    it("should throw the ExpectedDefinedError if return value is undefined", async () => {
      // arrange
      const f1 = () => undefined;
      const f2 = (a: number) => (a % 2 == 0 ? undefined : a);

      // act & assert
      expect(() => Parsers.makeParserDefined(f1)()).toThrow(
        DTErrors.ExpectedDefined
      );
      expect(() => Parsers.makeParserDefined(f2)(2)).toThrow(
        DTErrors.ExpectedDefined
      );
      expect(() => Parsers.makeParserDefined(f2)(4)).toThrow(
        DTErrors.ExpectedDefined
      );
    });

    it("should not throw the ExpectedDefinedError if return value is undefined", async () => {
      // arrange
      const f1 = () => 1;
      const f2 = (a: number) => 4;

      // act & assert
      expect(() => Parsers.makeParserDefined(f1)()).not.toThrow();
      expect(() => Parsers.makeParserDefined(f2)(1)).not.toThrow();
      expect(() => Parsers.makeParserDefined(f2)(3)).not.toThrow();
    });

    it("should throw any other exception in the function", async () => {
      // arrange
      const someError = new Error("test");
      const f1 = () => {
        throw someError;
      };

      // act & assert
      expect(() => Parsers.makeParserDefined(f1)()).toThrow(someError);
    });
  });

  describe("string", () => {
    it("should return undefined for all values that aren't strings", async () => {
      // arrange

      // act
      const out1 = Parsers.string(undefined);
      const out2 = Parsers.string(1);
      const out3 = Parsers.string(2);
      const out4 = Parsers.string({});
      const out5 = Parsers.string([]);

      // assert
      expect(out1).toBeUndefined();
      expect(out2).toBeUndefined();
      expect(out3).toBeUndefined();
      expect(out4).toBeUndefined();
      expect(out5).toBeUndefined();
    });

    it("should forward strings", async () => {
      // arrange
      const v1 = "";
      const v2 = "1";

      // act
      const out1 = Parsers.string(v1);
      const out2 = Parsers.string(v2);

      // assert
      expect(out1).toEqual(v1);
      expect(out2).toEqual(v2);
    });
  });

  describe("number", () => {
    it("should return undefined for all values that aren't numbers", async () => {
      // arrange

      // act
      const out1 = Parsers.number("-1");
      const out2 = Parsers.number("0");
      const out3 = Parsers.number({});
      const out4 = Parsers.number([]);
      const out5 = Parsers.number([1]);

      // assert
      expect(out1).toBeUndefined();
      expect(out2).toBeUndefined();
      expect(out3).toBeUndefined();
      expect(out4).toBeUndefined();
      expect(out5).toBeUndefined();
    });

    it("should forward numbers", async () => {
      // arrange
      const v1 = -1;
      const v2 = 0;
      const v3 = 1;

      // act
      const out1 = Parsers.number(v1);
      const out2 = Parsers.number(v2);
      const out3 = Parsers.number(v3);

      // assert
      expect(out1).toEqual(v1);
      expect(out2).toEqual(v2);
      expect(out3).toEqual(v3);
    });

    it("should clamp between min and max if they're provided", async () => {
      // arrange
      const max = 5;
      const min = 2;

      const v1 = 1;
      const v2 = 2;
      const v3 = 3;
      const v4 = 4;
      const v5 = 5;
      const v6 = 6;

      // act
      const out1 = Parsers.number(v1, { max, min });
      const out2 = Parsers.number(v2, { max, min });
      const out3 = Parsers.number(v3, { max, min });
      const out4 = Parsers.number(v4, { max, min });
      const out5 = Parsers.number(v5, { max, min });
      const out6 = Parsers.number(v6, { max, min });

      // assert
      expect(out1).toEqual(2);
      expect(out2).toEqual(2);
      expect(out3).toEqual(3);
      expect(out4).toEqual(4);
      expect(out5).toEqual(5);
      expect(out6).toEqual(5);
    });

    it("should round the number to the given number of decimal places", async () => {
      // arrange
      const v1 = 1.5689;
      const v2 = 1.4789;

      // act
      const out11 = Parsers.number(v1, { roundTo: 0 });
      const out12 = Parsers.number(v1, { roundTo: 1 });
      const out13 = Parsers.number(v1, { roundTo: 2 });

      const out21 = Parsers.number(v2, { roundTo: 0 });
      const out22 = Parsers.number(v2, { roundTo: 1 });
      const out23 = Parsers.number(v2, { roundTo: 2 });

      // assert
      expect(out11).toEqual(2);
      expect(out12).toEqual(1.6);
      expect(out13).toEqual(1.57);
      expect(out21).toEqual(1);
      expect(out22).toEqual(1.5);
      expect(out23).toEqual(1.48);
    });

    it("should round up when in the middle", async () => {
      // arrange
      const v1 = 1.55;

      // act
      const out11 = Parsers.number(v1, { roundTo: 1 });

      // assert
      expect(out11).toEqual(1.6);
    });
  });

  describe("boolean", () => {
    it("should return undefined for all values that aren't booleans", async () => {
      // arrange

      // act
      const out1 = Parsers.boolean("true");
      const out2 = Parsers.boolean("0");
      const out3 = Parsers.boolean(0);
      const out4 = Parsers.boolean([]);
      const out5 = Parsers.boolean([1]);

      // assert
      expect(out1).toBeUndefined();
      expect(out2).toBeUndefined();
      expect(out3).toBeUndefined();
      expect(out4).toBeUndefined();
      expect(out5).toBeUndefined();
    });

    it("should forward booleans", async () => {
      // arrange
      const v1 = true;
      const v2 = false;

      // act
      const out1 = Parsers.boolean(v1);
      const out2 = Parsers.boolean(v2);

      // assert
      expect(out1).toEqual(v1);
      expect(out2).toEqual(v2);
    });
  });

  describe("array", () => {
    it("should return undefined for all values that aren't arrays", async () => {
      // arrange

      // act
      const out1 = Parsers.array("0", Parsers.number);
      const out2 = Parsers.array("[]", Parsers.number);
      const out3 = Parsers.array({}, Parsers.number);
      const out4 = Parsers.array(0, Parsers.number);

      // assert
      expect(out1).toBeUndefined();
      expect(out2).toBeUndefined();
      expect(out3).toBeUndefined();
      expect(out4).toBeUndefined();
    });

    it("should parse arrays and their contents", async () => {
      // arrange
      const v1 = [1, 2, -1, 8];
      const v2 = ["a", "b", "c"];

      // act
      const out1 = Parsers.array(v1, (v) => Parsers.definedNumber(v) * 2);
      const out2 = Parsers.array(v2, (v) =>
        Parsers.definedString(v).toUpperCase()
      );

      // assert
      expect(out1).toEqual([2, 4, -2, 16]);
      expect(out2).toEqual(["A", "B", "C"]);
    });
  });
});
