// import { useState } from 'react';
import { useStoreContext } from '../../utils/state/GlobalState';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row, Button, Steps, Typography } from 'antd';
import ModalGuide from './ModalGuide/index';
import React from 'react';
import { SHOW_MODAL, TOGGLE_SIDEBAR } from '../../utils/state/actions';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const { Step } = Steps;
const { Title } = Typography;

const App = () => {
  const [state, dispatch] = useStoreContext();

  const handleMenuToggle = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  const showModal = () => {
    dispatch({ type: SHOW_MODAL });
  };

  const { pathname } = useLocation();
  const getStep = pathname === '/tapoff' ? 2 : pathname === '/shoppinglist' ? 1 : 0;

  return (
    <>
      <Row align="middle" style={{ borderBottom: '1px solid var(--ingre-grey)', paddingBottom: '2px' }}>
        <Col xs={{ offset: 0, span: 12 }} sm={{ offset: 0, span: 8 }} lg={{ offset: 0, span: 6 }} style={{ width: '1.2rem' }}>
          <Row align="middle" style={{ marginTop: '-1px', paddingBottom: '2px' }}>
            {state.leftSidebarCollapsed ? (
              //
              <MenuUnfoldOutlined onClick={handleMenuToggle} style={{ color: 'var(--ingre-dark-brown', fontSize: '1.2rem', marginLeft: '1rem' }} />
            ) : (
              <MenuFoldOutlined onClick={handleMenuToggle} style={{ color: 'var(--ingre-dark-brown', fontSize: '1.2rem', marginLeft: '1rem' }} />
            )}

            <Link to="/">
              <Title style={{ marginBottom: 0 }}>
                <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ margin: '0 0.3rem 0 0.6rem', color: 'var(--ingre-eggshell)', fontSize: '1.8rem', paddingBottom: '2px' }} />
                <span style={{ color: 'var(--ingre-dark-brown)', fontFamily: 'Poppins, sans-serif', fontSize: '36px', letterSpacing: -1, fontWeight: '800' }}>ingré</span>
              </Title>
            </Link>
          </Row>
        </Col>
        <Col xs={0} sm={8} lg={0}>
          <Row align="middle">
            <Steps size="small" current={getStep} responsive={false}>
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-egg" />} />
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-cart-shopping" />} />
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-square-check" />} />
            </Steps>
          </Row>
        </Col>
        <Col xs={0} lg={12}>
          <Row align="middle">
            <Steps size="small" current={getStep} responsive={false}>
              <Step title="Recipes" icon={<FontAwesomeIcon icon="fa-solid fa-egg" />} />
              <Step title="Shopping List" icon={<FontAwesomeIcon icon="fa-solid fa-cart-shopping" />} />
              <Step title="Tap Off" icon={<FontAwesomeIcon icon="fa-solid fa-square-check" />} />
            </Steps>
          </Row>
        </Col>
        <Col
          xs={{ span: 12, pull: 0 }}
          sm={{ span: 8, pull: 0 }}
          lg={{ span: 6, pull: 0 }}
          style={{ height: '100%' }}
          //
        >
          <Row align="middle" justify="end">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
            <Button onClick={showModal} style={{ margin: '0 0.3rem' }}>
              <FontAwesomeIcon icon="fa-solid fa-circle-info" />
            </Button>
          </Row>
        </Col>
      </Row>
      <ModalGuide />
    </>
  );
};

export default App;
