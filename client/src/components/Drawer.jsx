// React hooks
import { useLocation } from 'react-router-dom';

// Ant components
import { Alert, Button, Drawer, Space, Timeline } from 'antd';

// Global state
import { useStoreContext } from '../utils/state/GlobalState';
import { HIDE_DRAWER } from '../utils/state/actions';

// Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../utils/apollo/queries';
import { useEffect, useState } from 'react';

const App = () => {
  const [state, dispatch] = useStoreContext();
  const handleOk = () => dispatch({ type: HIDE_DRAWER });
  const { pathname } = useLocation();
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER);
  const [pro, setPro] = useState(false);

  useEffect(() => {
    if (!userLoading && !userError && userData?.getUser) {
      // console.log('userData', userData);
      setPro(userData.getUser.pro);
    }
  }, [userLoading, userError, userData]);

  var getDrawerText = (pathname) => {
    switch (pathname) {
      case '/':
        return (
          <Timeline>
            <Timeline.Item color="green">
              <Space direction="vertical" className="explore-buttons">
                Explore recipes from your phone. Click
                <Button>Random</Button>
                or one of the popular options, or
                <Button type="primary">
                  <Space>
                    <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" /> Search
                  </Space>
                </Button>
                to find your own.
              </Space>
            </Timeline.Item>
            <Timeline.Item>
              <Space direction="vertical">
                Like a recipe? Save it!
                <Button style={{ borderRadius: '50%', padding: '4px 8px' }}>
                  <FontAwesomeIcon icon="fa-solid fa-pen" />
                </Button>
              </Space>
            </Timeline.Item>
            <Timeline.Item>Don't like it? Customise it {<FontAwesomeIcon icon="fa-solid fa-pen" />} it!</Timeline.Item>
          </Timeline>
        );
      case '/search':
        return (
          <Timeline>
            <Timeline.Item color="green">Search from 2 million tested recipes. </Timeline.Item>
            <Timeline.Item color="blue">Enter a search term and click {<FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />} or type Enter. </Timeline.Item>
            <Timeline.Item color="red">To clear search, click {<FontAwesomeIcon icon="fa-solid fa-circle-xmark" />}.</Timeline.Item>
            <Timeline.Item>To narrow your search, select from our many filters available.</Timeline.Item>
            <Timeline.Item>Like a recipe? Click {<FontAwesomeIcon icon="fa-solid fa-save" />} to add it to your Saved list.</Timeline.Item>
            <Timeline.Item>You can also {<FontAwesomeIcon icon="fa-solid fa-pen" />} customise them!</Timeline.Item>
          </Timeline>
        );

      case '/customise':
        return (
          <Timeline>
            <Timeline.Item color="green">Make it your own.</Timeline.Item>
            <Timeline.Item>Customise a recipe, or Reset to start again! </Timeline.Item>
            <Timeline.Item color="blue">To edit recipe name, click on the box to type.</Timeline.Item>
            <Timeline.Item color="blue">For servings and quantities, enter a number or a decimal.</Timeline.Item>
            <Timeline.Item color="blue">To add a new ingredient, click on {<FontAwesomeIcon icon="fa-solid fa-add" />}.</Timeline.Item>
            <Timeline.Item color="red">To delete an existing ingredient, click on {<FontAwesomeIcon icon="fa-solid fa-trash" />}.</Timeline.Item>
          </Timeline>
        );

      case '/saved':
        return (
          <Timeline>
            <Timeline.Item color="green">Your saved recipes are stored here for 24 hours</Timeline.Item>
            <Timeline.Item>All your recipes in one place!</Timeline.Item>
            <Timeline.Item color="blue">Click {<FontAwesomeIcon icon="fa-solid fa-pen" />} to edit recipes.</Timeline.Item>
            <Timeline.Item color="blue">Click {<FontAwesomeIcon icon="fa-solid fa-trash" />} to remove recipes.</Timeline.Item>
            <Timeline.Item color="red">Your recipes will be deleted after 24 hours.</Timeline.Item>
            <Timeline.Item color="blue">Upgrade to {<FontAwesomeIcon icon="fa-solid fa-cubes-stacked" />} PRO for $5 to save recipes permanently.</Timeline.Item>
          </Timeline>
        );

      case '/ingredients':
        return (
          <Timeline>
            <Timeline.Item color="green">The final edit!</Timeline.Item>
            <Timeline.Item>Have you checked your fridge? Is it in season? Edit away!</Timeline.Item>
            <Timeline.Item color="blue">Click {<FontAwesomeIcon icon="fa-solid fa-add" />} to add a new ingredient.</Timeline.Item>
            <Timeline.Item color="red">Click {<FontAwesomeIcon icon="fa-solid fa-trash" />} to remove an ingredient.</Timeline.Item>
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

      case '/upgrade':
        return pro ? (
          <Timeline>
            <Timeline.Item color="green">
              <Alert type="success" message="You are already PRO!" />
            </Timeline.Item>
          </Timeline>
        ) : (
          <Timeline>
            <Timeline.Item color="green"> How to upgrade to ingré PRO</Timeline.Item>
            <Timeline.Item color="blue">
              <Space direction="vertical">
                Click
                <Button type="primary" shape="round">
                  Checkout with Stripe
                </Button>
              </Space>
            </Timeline.Item>
            <Timeline.Item color="blue">You will be redirected to Stripe's POS.</Timeline.Item>
            <Timeline.Item color="blue">Pay with Stripe.</Timeline.Item>
            <Timeline.Item color="green">You will be redirected back to ingré.</Timeline.Item>
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

  return (
    <Drawer
      visible={state.modalVisible}
      placement="right"
      onClose={handleOk}
      centered={false}
      closable={true}
      maskStyle={{
        background: 'rgba(0,0,0,0.2)'
      }}
    >
      {getDrawerText(pathname)}
    </Drawer>
  );
};

export default App;
