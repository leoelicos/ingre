import { Button, Modal, Divider, Space, Timeline } from 'antd';

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
      title={
        <>
          <Space style={{ color: 'black' }}>{<FontAwesomeIcon icon="fa-solid fa-circle-info" />} Info</Space>
          <Divider />
          {getModalTitle(pathname)}
        </>
      }
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
        <Timeline>
          <Timeline.Item color="green">Explore recipes from your phone. 2 million recipes specially curated by Edamam.</Timeline.Item>
          <Timeline.Item>Like a recipe? Click {faSave} to add it to your Saved list.</Timeline.Item>
          <Timeline.Item>You can also {faPen} customize them!</Timeline.Item>
        </Timeline>
      );
    case '/search':
      return (
        <Timeline>
          <Timeline.Item color="green">Search from 2 million tested recipes. </Timeline.Item>
          <Timeline.Item color="blue">Enter a search term and click {faMagnifyingGlass} or type Enter. </Timeline.Item>
          <Timeline.Item color="red">To clear search, click {faCircleXmark}.</Timeline.Item>
          <Timeline.Item>To narrow your search, select from our many filters available.</Timeline.Item>
          <Timeline.Item>Like a recipe? Click {faSave} to add it to your Saved list.</Timeline.Item>
          <Timeline.Item>You can also {faPen} customize them!</Timeline.Item>
        </Timeline>
      );

    case '/custom':
      return (
        <Timeline>
          <Timeline.Item color="green">Make it your own.</Timeline.Item>
          <Timeline.Item>Customize a recipe, or Reset to start again! </Timeline.Item>
          <Timeline.Item color="blue">To edit recipe name, click on the box to type.</Timeline.Item>
          <Timeline.Item color="blue">For servings and quantities, enter a number or a decimal.</Timeline.Item>
          <Timeline.Item color="blue">For dropdown menus, click on the box and select from the options that appear.</Timeline.Item>
          <Timeline.Item color="blue">To add a new ingredient, click on {faAdd}.</Timeline.Item>
          <Timeline.Item color="red">To delete an existing ingredient, click on {faTrash}.</Timeline.Item>
        </Timeline>
      );

    case '/saved':
      return (
        <Timeline>
          <Timeline.Item color="green">Your saved recipes are stored here for 24 hours</Timeline.Item>
          <Timeline.Item>All your recipes in one place!</Timeline.Item>
          <Timeline.Item color="blue">Click {faPen} to edit recipes.</Timeline.Item>
          <Timeline.Item color="blue">Click {faTrash} to remove recipes.</Timeline.Item>
          <Timeline.Item color="red">Your recipes will be deleted after 24 hours.</Timeline.Item>
          <Timeline.Item color="blue">Upgrade to {faCubesStacked} PRO for $5 to save recipes permanently.</Timeline.Item>
        </Timeline>
      );

    case '/shoppinglist':
      return (
        <Timeline>
          <Timeline.Item color="green">The final edit!</Timeline.Item>
          <Timeline.Item>Have you checked your fridge? Is it in season? Edit away!</Timeline.Item>
          <Timeline.Item color="blue">Click {faAdd} to add a new ingredient.</Timeline.Item>
          <Timeline.Item color="red">Click {faTrash} to remove an ingredient.</Timeline.Item>
          <Timeline.Item>There is a Misc section for additional groceries!</Timeline.Item>
        </Timeline>
      );

    case '/tapoff':
      return (
        <Timeline>
          <Timeline.Item color="green"> Tap off each ingredient as you shop in the supermarket.</Timeline.Item>
          <Timeline.Item color="blue">Good luck! When you're done, click "All done" to clear your Saved recipes and Shopping list.</Timeline.Item>
        </Timeline>
      );

    case '/login':
      return (
        <Timeline>
          <Timeline.Item color="green">Log in to start saving recipes!</Timeline.Item>
        </Timeline>
      );
    case '/signup':
      return (
        <Timeline>
          <Timeline.Item color="green">Sign up to start saving recipes!</Timeline.Item>
        </Timeline>
      );

    default:
      return (
        <Timeline>
          <Timeline.Item color="green">Please check that you are on a valid page.</Timeline.Item>
        </Timeline>
      );
  }
};
