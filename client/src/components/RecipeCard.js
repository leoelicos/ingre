import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Image } from 'antd';
const { Meta } = Card;
const App = (props) => {
  return (
    <Card
      style={{ width: 300, margin: '0.3rem 0.1rem' }}
      cover={<Image width={300} alt={props.name} src={props.picture_url} />}
      actions={[<FontAwesomeIcon key="edit" icon="fa-solid fa-pen" />, <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />]}

      //
    >
      <Meta title={props.name} />
    </Card>
  );
};

export default App;
