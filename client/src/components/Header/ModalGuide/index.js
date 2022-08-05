import { Button, Modal } from 'antd';
import { blue } from '@ant-design/colors';
import { useStoreContext } from '../../../utils/state/GlobalState';
import { HIDE_MODAL } from '../../../utils/state/actions';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const faCookie = <FontAwesomeIcon icon="fa-solid fa-cookie" />;
const faSave = <FontAwesomeIcon icon="fa-solid fa-save" />;
const faPen = <FontAwesomeIcon icon="fa-solid fa-pen" />;
const faMagnifyingGlass = <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />;
const faCircleXmark = <FontAwesomeIcon icon="fa-solid fa-circle-xmark" />;
const faAdd = <FontAwesomeIcon icon="fa-solid fa-add" />;
const faTrash = <FontAwesomeIcon icon="fa-solid fa-trash" />;
const faCubesStacked = <FontAwesomeIcon icon="fa-solid fa-cubes-stacked" />;
const faCartShopping = <FontAwesomeIcon icon="fa-solid fa-cart-shopping" />;
const faCircleSmall = <FontAwesomeIcon icon="fa-solid fa-circle-small" />;
const faRightToBracket = <FontAwesomeIcon icon="fa-solid fa-right-to-bracket" />;
const faRightFromBracket = <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />;
const faUserPlus = <FontAwesomeIcon icon="fa-solid fa-user-plus" />;

const App = () => {
  const [state, dispatch] = useStoreContext();
  const handleOk = () => dispatch({ type: HIDE_MODAL });
  const { pathname } = useLocation();

  return (
    <Modal
      title={getModalTitle(pathname)}
      visible={state.modalVisible}
      onCancel={handleOk}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk} block>
          OK
        </Button>
      ]}
      width={'90%'}
      centered={false}
      closable={false}
      focusTriggerAfterClose={true}
      //
    >
      {getModalText(pathname)}
    </Modal>
  );
};

export default App;
var getModalTitle = (pathname) => {
  switch (pathname) {
    case '/':
      return <p>{faCookie} Home Page</p>;
    case '/search':
      return <p>{faMagnifyingGlass} Search</p>;

    case '/custom':
      return <p>{faPen} Custom</p>;

    case '/saved':
      return <p>{faSave} Saved</p>;

    case '/shoppinglist':
      return <p>{faCartShopping} Shopping List</p>;

    case '/tapoff':
      return <p>{faCircleSmall} Tap Off</p>;

    case '/login':
      return <p>{faRightToBracket} Login</p>;

    case '/logout':
      return <p>{faRightFromBracket} Logout</p>;

    case '/signup':
      return <p>{faUserPlus} Sign up</p>;

    default:
      return <p>Unknown Page</p>;
  }
};
var getModalText = (pathname) => {
  switch (pathname) {
    case '/':
      return (
        <p>
          Explore recipes from your phone. 2 million recipes specially curated by Edamam. You'll see a random list every time you load this page. Like a recipe? Click {faSave} to add it to your Saved list. You can also {faPen} customize them!
        </p>
      );
    case '/search':
      return (
        <p>
          Search from 2 million tested recipes. Enter a search term and click {faMagnifyingGlass} or type Enter. To clear search, click {faCircleXmark}. To narrow your search, select from our many filters available. Like a recipe? Click {faSave} to add it to your Saved list. You can also {faPen} customize them!
        </p>
      );

    case '/custom':
      return (
        <p>
          Make it your own. Customize a recipe, or Reset to start from scratch! To edit recipe name, click on the box to type. For servings and quantities, enter a number or a decimal. For dropdown menus, click on the box and select from the options that appear. To add a new ingredient, click on {faAdd}. To delete an existing ingredient, click on {faTrash}.
        </p>
      );

    case '/saved':
      return <p>Keep your recipes safe All your recipes in one place! You can edit portion sizes on this page. Want to permanently save your recipes to Library? Upgrade to {faCubesStacked} PRO for $5 today!</p>;

    case '/shoppinglist':
      return (
        <p>
          The final edit! We've added everything up for you and divided them into categories. It's up to you to consider: Have I got it already in my fridge? Corn is not in season, can I use peas instead? Fish doesn't look fresh, can I use a different protein? No problem! Just click on the boxes to edit the ingredients. There's even a Misc section for additional groceries! Click {faAdd} to add a new ingredient. Click {faTrash} to remove an ingredient.
        </p>
      );

    case '/tapoff':
      return <p>Tap off each ingredient as you shop in the supermarket. Good luck! When you're done, click "All done" to clear your Saved recipes and Shopping list. Upgrade to {faCubesStacked} PRO for $5 and automatically save your recipes permanently in Library!</p>;

    case '/login':
      return <p>Log in to start saving recipes!</p>;
    case '/signup':
      return <p>Sign up to start saving recipes!</p>;

    default:
      return <p>Please check that you are on a valid page.</p>;
  }
};
