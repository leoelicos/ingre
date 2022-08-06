import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Image, Button, Space } from 'antd';
const { Meta } = Card;

const App = (props) => {
  const handleEdit = () => {
    console.log('Edit button was clicked');
  };
  const handleSave = () => {
    console.log('Save button was clicked');
  };

  return (
    <Card
      style={{ width: 300, margin: '0.3rem 0.1rem' }}
      cover={<Image width={300} alt={props.name} src={props.picture_url} />}
      actions={[
        <Button onClick={handleEdit}>
          <Space>
            Edit
            <FontAwesomeIcon key="edit" icon="fa-solid fa-pen" />
          </Space>
        </Button>,
        <Button onClick={handleSave}>
          <Space>
            Save
            <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />
          </Space>
        </Button>

        //
      ]}

      //
    >
      <Meta title={props.name} />
    </Card>
  );
};

export default App;
