import { useEffect, useState } from 'react';

// GlobalState
import { useStoreContext } from '../utils/state/GlobalState';
import { UPDATE_TAP_OFF } from '../utils/state/actions';

// Ant components
import { Col, Card, Tag, Empty, Row, Space, Checkbox, Typography } from 'antd';

// Custom components
import ContentTitle from '../components/ContentTitle';
import ContentSubtitle from '../components/ContentSubtitle';

// utility to compress object for tapoff page
import compress from '../utils/compress.js';

import Masonry from 'react-masonry-css';
const { CheckableTag } = Tag;
const { Text } = Typography;
const TapOff = () => {
  const handleChange = (ri, ii, checked) => {
    const x = JSON.parse(JSON.stringify(compressedRecipes));
    console.log('x', x, 'ri', ri, 'ii', ii);
    console.log('x[ri].items[ii]', x[ri].items[ii]);
    x[ri].items[ii].checked = checked;
    setCompressedRecipes(x);
  };

  const [state, dispatch] = useStoreContext();
  const { savedIngredients } = state;
  const [compressedRecipes, setCompressedRecipes] = useState([{ items: ['Loading'], category: 'Loading' }]);

  useEffect(() => {
    document.title = 'ingré Tap Off';
  }, []);

  useEffect(() => {
    const compressed = compress(savedIngredients);
    console.table(compressed);
    setCompressedRecipes(compressed);
    dispatch({ type: UPDATE_TAP_OFF, data: compressed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const breakpointColumnsObj = {
    default: 3,

    1050: 2,
    750: 1
  };
  return (
    <Col span={24}>
      <Row style={{ marginBottom: '1rem' }}>
        <ContentTitle>Tap Off</ContentTitle>
      </Row>
      <Row>
        <Masonry breakpointCols={breakpointColumnsObj} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
          {compressedRecipes?.length ? (
            compressedRecipes.map((r, ri) => (
              <Card
                key={r.category}
                style={{
                  borderRadius: '0 1rem 0 0 ',
                  boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
                  paddingBottom: '4px'
                }}
                className={r.items.every((i) => i.checked) ? 'card-all-tapped' : ''}
              >
                <Row justify="center" style={{ width: '100%', textAlign: 'center' }}>
                  <ContentSubtitle>{r.category}</ContentSubtitle>
                </Row>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {r.items.map((i, ii) => (
                    <CheckableTag
                      key={i.description}
                      checked={i.checked}
                      onChange={(checked) => handleChange(ri, ii, checked)}
                      className="checkable-tag"
                      //
                    >
                      <Checkbox checked={i.checked} className="tap-off-check-box" />
                      <Text style={{ fontSize: '14px' }}>{i.description}</Text>
                    </CheckableTag>
                  ))}
                </Space>
              </Card>
            ))
          ) : (
            <Empty />
          )}
        </Masonry>
      </Row>
    </Col>
  );
};
export default TapOff;
