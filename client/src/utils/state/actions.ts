export default {
  /* component: Drawer (help menu on the right) */
  SHOW_DRAWER: 'SHOW_DRAWER' /* show */,
  HIDE_DRAWER: 'HIDE_DRAWER' /* hide */,

  /* component: Sidebar (nav menu on the left) */
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR' /* toggle expanded/collapsed*/,
  EXPAND_SIDEBAR: 'EXPAND_SIDEBAR' /* expand */,
  COLLAPSE_SIDEBAR: 'COLLAPSE_SIDEBAR' /* collapse */,

  /* page: Home */
  UPDATE_HOME_RECIPES: 'UPDATE_HOME_RECIPES' /* update home page recipes */,
  FLAG_HOME_MOUNTED:
    'FLAG_HOME_MOUNTED' /* set to True: Home has mounted once */,

  /* page: Search */
  UPDATE_SEARCH_RECIPES:
    'UPDATE_SEARCH_RECIPES' /* update search page recipes */,

  /* page: Customise */
  ADD_EDIT_RECIPE: 'ADD_EDIT_RECIPE' /* set the recipe on this page */,
  CLEAR_EDIT_RECIPE: 'CLEAR_EDIT_RECIPE' /* reset */,

  /* page: Saved */
  UPDATE_SAVED_RECIPES: 'UPDATE_SAVED_RECIPES' /* update saved recipe list */,
  ADD_SAVED_RECIPE: 'ADD_SAVED_RECIPE' /* add to saved recipe list */,
  REMOVE_SAVED_RECIPE:
    'REMOVE_SAVED_RECIPE' /* remove from saved recipe list */,
  FLAG_SAVED_MOUNTED:
    'FLAG_SAVED_MOUNTED' /* set True: Saved has mounted once */,

  /* page: Ingredients */
  UPDATE_SAVED_INGREDIENTS:
    'UPDATE_SAVED_INGREDIENTS' /* update ingredient page ingredients */,
  FLAG_INGREDIENTS_GENERATED:
    'FLAG_INGREDIENTS_GENERATED' /* set True: Ingredients has mounted once */,

  /* page: Tap off */
  UPDATE_TAP_OFF: 'UPDATE_TAP_OFF' /* update tap page ingredients */
}
