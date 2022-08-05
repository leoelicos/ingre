// import { useState } from 'react';
import { useStoreContext } from '../../utils/state/GlobalState';
import { SHOW_MODAL } from '../../utils/state/actions';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row, Button, Steps, Typography } from 'antd';
import ModalGuide from './ModalGuide';
const { Step } = Steps;
const { Title } = Typography;

const App = () => {
  const [, dispatch] = useStoreContext();

  const showModal = () => {
    dispatch({ type: SHOW_MODAL });
  };

  return (
    <>
      <Row align="middle">
        <Col
          xs={{ offset: 0, span: 12 }}
          sm={{ offset: 0, span: 8 }}
          lg={{ offset: 0, span: 6 }}

          //
        >
          <Row align="middle">
            <Link to="/">
              <Title style={{ marginBottom: 0 }}>
                <FontAwesomeIcon className="ingre-logo" icon="fa-solid fa-egg" style={{ margin: '0 0.3rem', color: 'var(--ingre-eggshell)' }} />
                <span style={{ color: 'var(--ingre-dark-brown)', fontFamily: 'Poppins, sans-serif', fontSize: '36px', letterSpacing: -1, fontWeight: '800' }}>ingré</span>
              </Title>
            </Link>
          </Row>
        </Col>

        <Col xs={0} sm={8} lg={0}>
          <Row align="middle">
            <Steps size="small" current={2} responsive={false}>
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-egg" />} />
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-cart-shopping" />} />
              <Step icon={<FontAwesomeIcon icon="fa-solid fa-circle" />} />
            </Steps>
          </Row>
        </Col>

        <Col xs={0} lg={12}>
          <Row align="middle">
            <Steps size="small" current={2} responsive={false}>
              <Step title="Recipes" icon={<FontAwesomeIcon icon="fa-solid fa-egg" />} />
              <Step title="Shopping List" icon={<FontAwesomeIcon icon="fa-solid fa-cart-shopping" />} />
              <Step title="Tap Off" icon={<FontAwesomeIcon icon="fa-solid fa-circle" />} />
            </Steps>
          </Row>
        </Col>

        <Col
          xs={{ span: 12, pull: 0 }}
          sm={{ span: 8, pull: 0 }} /* >576 */
          lg={{ span: 6, pull: 0 }} /* >576 */
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
