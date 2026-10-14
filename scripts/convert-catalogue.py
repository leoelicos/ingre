"""One-off: convert the PO's plain-text `sold` draft into typed sold options (kept for provenance)."""
import json, re, sys

SRC = '/workspace/ingre-data/catalogue-sold-draft.json'
RECIPES = '/workspace/ingre-data/recipes-per-serve-draft.json'
OUT = '/workspace/ingre/client/src/data/'

WORD_TYPE = {'pack': 'pack', 'bag': 'bag', 'tin': 'tin', 'jar': 'jar', 'bottle': 'bottle',
             'tub': 'tub', 'block': 'pack', 'carton': 'carton', 'tube': 'tube'}
LIQUID_TYPE = {'cream': 'carton'}

def size(amount, unit):
    return {'amount': amount, 'unit': unit}

def opt(type_, s, label=None):
    o = {'type': type_, 'size': s}
    if label:
        o['label'] = label
    return o

def convert(item, text):
    if text == 'each':
        return opt('each', size(1, 'count'))
    if text == 'bunch':
        return opt('bunch', size(1, 'count'))
    if text == 'half bunch':
        return opt('bunch', size(0.5, 'count'), 'half bunch')
    if text == 'half':
        return opt('each', size(0.5, 'count'), 'half')
    if text == 'weighed':
        return opt('weighed', None)
    m = re.fullmatch(r'(\d+) pack', text)
    if m:
        return opt('carton', size(int(m[1]), 'count'))
    m = re.fullmatch(r'(\d+(?:\.\d+)?) ?(g|kg|ml|L)(?: (\w+))?', text)
    if m:
        amount = float(m[1]); unit = m[2]
        if unit == 'kg': amount, unit = amount * 1000, 'g'
        if unit == 'L': amount, unit = amount * 1000, 'ml'
        amount = int(amount) if amount == int(amount) else amount
        word = m[3]
        label = word if word == 'block' else None
        if word:
            t = WORD_TYPE[word]
        else:
            t = LIQUID_TYPE.get(item['id'], 'bottle')
        return opt(t, size(amount, unit), label)
    raise ValueError(f"{item['id']}: unknown sold option {text!r}")

# Verified Coles facts supplied by the PO (override the draft for these ids).
VERIFIED = {
    'garlic': {'sold': [opt('each', size(1, 'count'), 'loose bulb'), opt('pack', size(3, 'count'), '3-pack')],
               'approxGrams': 60, 'measureGrams': {'clove': 6}},
    'celery': {'sold': [opt('bunch', size(800, 'g')), opt('each', size(500, 'g'), 'trimmed head'),
                        opt('pack', size(300, 'g'), 'sticks')], 'measureGrams': {'stalk': 40}},
    'lemongrass': {'sold': [opt('pack', size(30, 'g'), 'punnet'), opt('tube', size(80, 'g'), 'paste')]},
    'parmesan': {'sold': [opt('pack', size(200, 'g'), 'block'), opt('pack', size(250, 'g'), 'block'),
                          opt('pack', size(100, 'g'), 'grated'), opt('pack', size(125, 'g'), 'shaved')]},
    'black-pepper': {'sold': [opt('grinder', size(50, 'g')), opt('jar', size(50, 'g'), 'ground')]},
    'rice-paper': {'sold': [opt('pack', size(250, 'g')), opt('pack', size(375, 'g'))]},
}
SPICE_JARS = {'garam-masala', 'ground-cumin', 'chilli-powder', 'cumin-seeds', 'ground-coriander', 'ground-turmeric'}
APPLE = {'id': 'apple', 'name': 'apples', 'category': 'fruit & veg',
         'sold': [opt('each', size(1, 'count'), 'loose'), opt('bag', size(1000, 'g'))], 'approxGrams': 185}
# Unverified estimates we had to add so every recipe measure converts.
ESTIMATES = {'spring-onion': {'measureGrams': {'stalk': 10}}}

catalogue = json.load(open(SRC))
out = []
for item in catalogue:
    new = {k: item[k] for k in ('id', 'name', 'category')}
    if item.get('staple'):
        new['staple'] = True
    sold = [] if item['id'] in VERIFIED else [convert(item, s) for s in item['sold'] if s not in ('packet', 'shaker')]
    if item['id'] == 'salt':
        sold.append(opt('jar', size(125, 'g'), 'shaker'))
    if item['id'] in SPICE_JARS:
        sold = [o for o in sold if o['type'] == 'jar']
    new['sold'] = sold
    if 'approxGrams' in item:
        new['approxGrams'] = item['approxGrams']
    new.update(VERIFIED.get(item['id'], {}))
    new.update(ESTIMATES.get(item['id'], {}))
    if item['id'] == 'lemongrass':
        new.pop('approxGrams', None)
    out.append(new)
out.append(APPLE)

# Default home location from the PO draft (Fruit bowl folded into Bench: exactly 4 locations).
HOME = json.load(open('/workspace/ingre-data/home-locations-draft.json'))
LOCATIONS = {'Fridge', 'Cupboard', 'Spice rack', 'Bench'}
# Confirmed (PO/user, 2026-10): frozen peas swapped for tinned peas; no freezer location.
TINNED_PEAS = {'id': 'tinned-peas', 'name': 'tinned peas', 'category': 'canned food',
               'sold': [opt('tin', size(420, 'g'))]}
out = [TINNED_PEAS if item['id'] == 'frozen-peas' else item for item in out]
HOME.setdefault('tinned-peas', 'Cupboard')
missing = [item['id'] for item in out if item['id'] not in HOME]
if missing:
    sys.exit(f'no home location for {missing}')
HOME['apple'] = 'Bench'  # PO 2026-10: apples live on the bench
for item in out:
    loc = HOME[item['id']]
    loc = 'Bench' if loc == 'Fruit bowl' else loc
    if loc not in LOCATIONS:
        sys.exit(f"{item['id']}: unknown location {loc}")
    item['pantry'] = loc

verified = sorted(list(VERIFIED) + ['apple'] + sorted(SPICE_JARS))
unverified = sorted(i['id'] for i in out if i['id'] not in verified)
note = (
    "Generic, brand-free items available at Coles/Woolworths/Aldi. `category` is the supermarket aisle. "
    "`sold` lists how the item is sold: {type, size: {amount, unit: g|ml|count} | null for weighed, label?}. "
    "`approxGrams` is the weight of one counted item (each/bunch); `measureGrams` converts recipe-only measures (clove, stalk). `pantry` is the default home location (Fridge, Cupboard, Spice rack, Bench; from the PO's home-locations draft with Fruit bowl folded into Bench); users can override it in the app. Frozen peas replaced by tinned peas (confirmed by the PO; 420 g tin size unverified) as there is no freezer location. "
    f"Verified against Coles (PO, 2026-10): {', '.join(verified)} (spice jars 25-50 g; parmesan blocks and grated/shaved; "
    "pepper 50 g grinder or ground; rice paper 250/375 g packs, recipes count sheets so one pack is bought; lemongrass "
    "punnet or paste tube, not per stalk). UNVERIFIED draft sizes, to be checked by the PO: "
    f"{', '.join(unverified)}. Estimates: celery bunch 800 g / trimmed head 500 g, celery stalk 40 g, spring onion stalk 10 g, "
    "garlic clove 6 g, salt shaker 125 g, dried oregano 10 g jar (below the verified 25-50 g spice-jar range)."
)
# Everyday extras (PO draft, 2026-10): non-recipe items for "Add an item". The draft gives a shop
# section; we store an aisle that maps to that section (Pantry items get a quiet sub-aisle).
EXTRAS = json.load(open('/workspace/ingre-data/everyday-extras-draft.json'))
SECTION_AISLE = {'Fruit & Veg': 'fruit & veg', 'Dairy, Eggs & Fridge': 'dairy & eggs',
                 'Meat & Seafood': 'meat', 'Deli': 'deli', 'Bakery': 'bakery'}
PANTRY_AISLE = {'rolled-oats': 'breakfast & spreads', 'breakfast-cereal': 'breakfast & spreads',
                'peanut-butter': 'breakfast & spreads', 'honey': 'breakfast & spreads', 'jam': 'breakfast & spreads',
                'coffee': 'tea & coffee', 'tea-bags': 'tea & coffee', 'plain-flour': 'baking',
                'canned-tuna': 'canned food'}
# Unverified estimates for draft options with no size / loose items with no weight.
EXTRA_SIZES = {('breakfast-cereal', 'pack'): size(500, 'g'), ('coffee', 'jar'): size(200, 'g'),
               ('coffee', 'pack'): size(200, 'g')}
EXTRA_GRAMS = {'watermelon': 3000}

def extra_option(item, o):
    t = o['type']
    if t == 'weighed':
        return opt('weighed', None)
    if t == 'each':
        return opt('each', size(1, 'count'))
    text = o.get('size')
    if text is None:
        return opt(t, EXTRA_SIZES[(item['id'], t)])
    m = re.fullmatch(r'(\d+) pack', text)
    if m:
        return opt(t, size(int(m[1]), 'count'), f'{m[1]}-pack')
    m = re.fullmatch(r'(\d+(?:\.\d+)?) ?(g|kg|ml|L)', text)
    amount = float(m[1]); unit = m[2]
    if unit == 'kg': amount, unit = amount * 1000, 'g'
    if unit == 'L': amount, unit = amount * 1000, 'ml'
    return opt(t, size(int(amount) if amount == int(amount) else amount, unit))

known = {i['id'] for i in out}
extras = []
for item in EXTRAS:
    if item['id'] in known:  # keep the live entry (apple)
        continue
    aisle = PANTRY_AISLE[item['id']] if item['section'] == 'Pantry' else SECTION_AISLE[item['section']]
    new = {'id': item['id'], 'name': item['name'], 'category': aisle,
           'sold': [extra_option(item, o) for o in item['sold']]}
    grams = item.get('approxGrams', EXTRA_GRAMS.get(item['id']))
    if any(o['type'] == 'each' for o in item['sold']):
        new['approxGrams'] = grams
    loc = item['home']
    if loc not in LOCATIONS:
        sys.exit(f"{item['id']}: unknown location {loc}")
    new['pantry'] = loc
    extras.append(new)
out += extras
note += (" EVERYDAY EXTRAS (PO draft, 2026-10, all sizes UNVERIFIED): " + ', '.join(i['id'] for i in extras)
         + ". Extras estimates: breakfast cereal 500 g pack, coffee 200 g jar/pack, whole watermelon 3 kg."
         " The draft's shop section is stored as an aisle (deli, bakery, breakfast & spreads, tea & coffee are new aisles).")

json.dump({'_note': note, 'ingredients': out}, open(OUT + 'ingredients.json', 'w'), ensure_ascii=False, indent=2)
recipes = json.load(open(RECIPES))
for r in recipes['recipes']:
    for g in r['ingredients']:
        if g['ingredientId'] == 'frozen-peas':
            g['ingredientId'] = 'tinned-peas'
recipes['_note'] = ("Generic, brand-free everyday dishes cookable in under an hour. All quantities are PER SERVE "
                    "(portions: 1); the app multiplies by the number of people. Ingredients reference ingredients.json by id; "
                    "tags are many-to-many (cuisines, diets, meals).")
json.dump(recipes, open(OUT + 'recipes.json', 'w'), ensure_ascii=False, indent=2)
print(len(out), 'ingredients;', len(recipes['recipes']), 'recipes')
