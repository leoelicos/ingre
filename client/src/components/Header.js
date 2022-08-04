import React from 'react';
// Import React Router Link component for internal hyperlinks
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Button, Modal, Divider } from 'antd';
import { useState } from 'react';

const App = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <header>
      <ul className="navbar">
        <div className="navbar-left">
          <li className="navbar-item">
            <Link to="/">
              <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ marginRight: '0.3rem' }} />
              <span className="ingre-logo-text">ingré</span>
            </Link>
          </li>
        </div>
        <div className="navbar-right">
          <li className="navbar-item">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </li>
          <li className="navbar-item">
            <Button onClick={showModal}>Guide</Button>
            <Modal title={<FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-circle-info" />} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
              <h1>Recipes</h1>
              <p>Explore recipes from your phone. 2 million recipes specially curated by Edamam. You'll see a random list every time you load this page. Like a recipe? Click to add it to your Saved list. You can also customize them!</p>
              {<Divider />}
              <h1>Search</h1>
              <p>Search from 2 million tested recipes. Enter a search term and click or type Enter. To clear search, click . To narrow your search, select from our many filters available. Like a recipe? Click to add it to your Saved list. You can also customize them!</p>
              {<Divider />}
              <h1>Custom</h1>
              <p>Make it your own. Customize a recipe, or Reset to start from scratch! To edit recipe name, click on the box to type. For servings and quantities, enter a number or a decimal. For dropdown menus, click on the box and select from the options that appear. To add a new ingredient, click on . To delete an existing ingredient, click on.</p>
              {<Divider />}
              <h1>Saved</h1>
              <p>Keep your recipes safe All your recipes in one place! You can edit portion sizes on this page. Want to permanently save your recipes to Library? Upgrade to PRO for $5 today!</p>
              {<Divider />}
              <h1>Shopping list</h1>
              <p>The final edit! We've added everything up for you and divided them into categories. It's up to you to consider: Have I got it already in my fridge? Corn is not in season, can I use peas instead? Fish doesn't look fresh, can I use a different protein? No problem! Just click on the boxes to edit the ingredients. There's even a Misc section for additional groceries! To add a new ingredient, click on . To delete an existing ingredient, click on.</p>
              {<Divider />}
              <h1>Tap as you shop</h1>
              <p>Tap off each ingredient as you shop in the supermarket. Good luck! When you’re done, click All done to clear your Saved recipes and Shopping list. Upgrade to PRO for $5 and automatically save your recipes permanently in Library!</p>
            </Modal>
          </li>
        </div>
      </ul>
    </header>
  );
};

export default App;
