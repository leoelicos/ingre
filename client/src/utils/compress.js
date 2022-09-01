var pluralize = require('pluralize');

const clean = (str) => pluralize.singular(str.trim().toLocaleLowerCase().replace(/-/g, ' '));

const aggregateQuantities = (arr) =>
  arr.reduce((prev, curr) => {
    let { name, quantity, measure, category } = curr;
    name = clean(name);
    const key = name;
    quantity = parseFloat(quantity);
    measure = clean(measure);
    category = clean(category);

    const foundIdx = prev.findIndex((r) => r.name === name && r.category === category);
    if (foundIdx === -1) {
      prev.push({ key, name, quantityMeasures: [{ quantity, measure }], category });
    } else {
      const foundMeasureIdx = prev[foundIdx].quantityMeasures.findIndex((qm) => qm.measure.trim().toLocaleLowerCase() === measure);
      if (foundMeasureIdx === -1) {
        prev[foundIdx].quantityMeasures.push({ quantity, measure });
      } else {
        prev[foundIdx].quantityMeasures[foundMeasureIdx].quantity += parseFloat(quantity);
      }
    }
    return prev;
  }, []);

const qualifyDescriptions = (arr) =>
  arr.map((i) => {
    let { name, quantityMeasures, category } = i;
    name = name.slice(0, 1).toLocaleUpperCase() + name.slice(1);
    category = category.slice(0, 1).toLocaleUpperCase() + category.slice(1);

    quantityMeasures = quantityMeasures
      // sort measures alphabetically, e.g. cups, grams, tablespoons, units
      .sort((a, b) => a.measure.localeCompare(b.measure))
      .map(({ quantity, measure }) => {
        const roundedQuantity = Math.round(quantity * 100) / 100;
        if (roundedQuantity !== 1) measure = pluralize.plural(measure);
        if (measure === 'unit' && quantityMeasures.length === 1) return roundedQuantity;
        return roundedQuantity + ' ' + measure;
      })
      .join(' + ');

    return { description: `${name} (${quantityMeasures})`, category };
  });

const categorize = (arr) => {
  const uniqueCategories = Array.from(new Set(arr.map((i) => i.category)));
  const newArr = uniqueCategories.map((i) => ({ category: i, items: [] }));
  arr.reduce((prev, curr) => {
    const { description, category } = curr;
    const j = newArr.findIndex((i) => i.category === category);
    newArr[j].items.push({ description, checked: false });
    return prev;
  }, {});

  return newArr;
};

const sortCategoriesAndItems = (arr) => {
  arr = arr.sort((a, b) => a.category.localeCompare(b.category));
  arr.forEach((c) => {
    c.items.sort();
  });
  return arr;
};

const convert = (arr) => {
  let newArr = aggregateQuantities(arr);
  newArr = qualifyDescriptions(newArr);
  newArr = categorize(newArr);
  newArr = sortCategoriesAndItems(newArr);
  return newArr;
};

export default convert;
