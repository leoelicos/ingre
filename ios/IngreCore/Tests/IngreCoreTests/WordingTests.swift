import XCTest
@testable import IngreCore

final class WordingTests: XCTestCase {
    let clove = CountUnit(one: "clove", other: "cloves")
    let tomato = CountUnit(one: "tomato", other: "tomatoes")
    let head = CountUnit(one: "head", other: "heads")
    let garlic = CountedItem(
        countUnit: CountUnit(one: "head", other: "heads"),
        partMeasure: "clove",
        approxGrams: 60,
        measureGrams: ["clove": 6]
    )
    let eggs = CountedItem(countUnit: CountUnit(one: "egg", other: "eggs"))
    let springOnion = CountedItem(
        countUnit: CountUnit(one: "bunch", other: "bunches"),
        partMeasure: "stalk",
        approxGrams: 100,
        measureGrams: ["stalk": 10]
    )

    func testPluralEdgeCases() {
        XCTAssertEqual([0.0, 1, 2, 1.5].map { formatCountUnit($0, clove) }, ["cloves", "clove", "cloves", "cloves"])
        XCTAssertEqual([0.0, 1, 2, 1.5].map { formatItemUnit($0) }, ["items", "item", "items", "items"])
        XCTAssertEqual(pluralCount(0.5), 1)
        XCTAssertEqual(formatQuantity(0.5, "whole", tomato), "½ tomato")
        XCTAssertEqual(formatQuantity(0.5, "clove"), "½ clove")
        XCTAssertEqual([0, 0.001, 0.25, 1, 1.004, 1.5, 2].map { pluralCount($0) }, [0, 0, 1, 1, 1, 1.5, 2])
    }

    func testReadsLikeTheList() {
        XCTAssertEqual(formatQuantity(1, "clove"), "1 clove")
        XCTAssertEqual(formatQuantity(2, "clove"), "2 cloves")
        XCTAssertEqual(formatQuantity(1, "whole", head), "1 head")
        XCTAssertEqual(formatQuantity(2, "whole", tomato), "2 tomatoes")
        XCTAssertEqual(formatQuantity(1.5, "whole", tomato), "1½ tomatoes")
        XCTAssertEqual(formatCount(1, nil), "1 item")
        XCTAssertEqual(formatCount(3, nil), "3 items")
        XCTAssertEqual(formatCount(0, nil), "0 items")
    }

    func testMeasures() {
        XCTAssertEqual(["cup", "clove", "stalk", "bunch"].map { formatMeasure(2, $0) }, ["cups", "cloves", "stalks", "bunches"])
        XCTAssertEqual(["cup", "clove", "stalk", "bunch"].map { formatMeasure(1, $0) }, ["cup", "clove", "stalk", "bunch"])
        XCTAssertEqual(["tsp", "tbsp", "g", "ml", "g tin", "ml tin", "kg", "L"].map { formatMeasure(2, $0) }, ["tsp", "tbsp", "g", "ml", "g tin", "ml tin", "kg", "L"])
        XCTAssertEqual(formatMeasure(2, "pinch"), "pinch")
        XCTAssertEqual(formatQuantity(2, "pinch"), "2 pinch")
        XCTAssertEqual(formatQuantity(37.5, "g"), "37.5 g")
        XCTAssertEqual(formatQuantity(400, "g tin"), "400 g tin")
        XCTAssertEqual(formatQuantity(0.5, "tbsp"), "½ tbsp")
        XCTAssertEqual(formatQuantity(1.75, "cup"), "1¾ cups")
        XCTAssertEqual(formatMass(250, "g"), "250 g")
        XCTAssertEqual(formatMass(1000, "g"), "1 kg")
        XCTAssertEqual(formatMass(2500, "g"), "2.5 kg")
        XCTAssertEqual(formatMass(1500, "ml"), "1.5 L")
        XCTAssertEqual(formatMass(999.999, "ml"), "1000 ml")
    }

    func testNumbers() {
        XCTAssertEqual(formatNumber(37.5), "37.5")
        XCTAssertEqual(formatNumber(1.0 / 3.0), "0.33")
        XCTAssertEqual(formatNumber(12500), "12500")
        XCTAssertEqual(formatNumber(-0.001), "0")
        XCTAssertEqual(rounded(2.345), 2.35)
    }

    func testToBaseAndConvert() {
        XCTAssertEqual(toBase(2, "g", nil), Amount(amount: 2, unit: "g"))
        XCTAssertEqual(toBase(1, "tsp", nil), Amount(amount: 5, unit: "ml"))
        XCTAssertEqual(toBase(0.5, "cup", nil), Amount(amount: 125, unit: "ml"))
        XCTAssertEqual(toBase(2, "clove", ["clove": 6]), Amount(amount: 12, unit: "g"))
        XCTAssertNil(toBase(2, "clove", nil))
        XCTAssertEqual(convert(Amount(amount: 5, unit: "ml"), "g", nil), 5)
        XCTAssertEqual(convert(Amount(amount: 2, unit: "count"), "g", 150), 300)
        XCTAssertEqual(convert(Amount(amount: 300, unit: "g"), "count", 150), 2)
        XCTAssertNil(convert(Amount(amount: 2, unit: "count"), "g", nil))
    }

    func testCountedTotals() {
        XCTAssertEqual(countText(1, eggs), "1 egg")
        XCTAssertEqual(countText(12, eggs), "12 eggs")
        XCTAssertEqual(countText(0, eggs), "0 eggs")
        XCTAssertEqual(countText(1.5, CountedItem(countUnit: CountUnit(one: "onion", other: "onions"))), "1½ onions")
        XCTAssertEqual(formatAmount(Amount(amount: 2, unit: "count")), "2 items")
        XCTAssertEqual(countText(0.3, garlic), "3 cloves")
        XCTAssertEqual(countText(0.1, garlic), "1 clove")
        XCTAssertEqual(countText(1.3, garlic), "13 cloves")
        XCTAssertEqual(countText(1, garlic), "1 head")
        XCTAssertEqual(countText(2, garlic), "2 heads")
        XCTAssertEqual(countText(0.2, springOnion), "2 stalks")
        XCTAssertEqual(countText(1, springOnion), "1 bunch")
        XCTAssertNil(partsOf(0.5, nil))
        XCTAssertNil(partsOf(0.5, eggs))
        XCTAssertEqual(partsOf(0.5, garlic), Parts(quantity: 5, measure: "clove"))
        XCTAssertEqual(formatAmount(Amount(amount: 1.456, unit: "count")), "1.46 items")
        XCTAssertEqual(formatAmount(Amount(amount: 1000, unit: "g")), "1 kg")
        XCTAssertEqual(formatAmount(Amount(amount: 1500, unit: "ml")), "1.5 L")
    }

    func testItemUnits() {
        XCTAssertEqual(itemUnit([SoldOption(type: "carton", size: SoldSize(amount: 1, unit: "ml"))]), "ml")
        XCTAssertEqual(itemUnit([SoldOption(type: "weighed", size: nil)]), "g")
        XCTAssertEqual(itemUnit(nil), "count")
        XCTAssertEqual(unitMeasure("count"), "whole")
        XCTAssertEqual(unitMeasure("g"), "g")
    }
}
