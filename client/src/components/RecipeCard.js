import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Image, Button, Space } from 'antd';
import { useStoreContext } from '../utils/state/GlobalState';
import { ADD_SAVED_RECIPE, ADD_EDIT_RECIPE } from '../utils/state/actions';
import { Link } from 'react-router-dom';
const { Meta } = Card;

const App = (props) => {
  const [state, dispatch] = useStoreContext();

  const handleEdit = (event) => {
    // traverse DOM to get recipe ID

    console.log('Edit button was clicked - the props.recipe is ', props.recipe);
    dispatch({ type: ADD_EDIT_RECIPE, data: props.recipe });
    // redirect to Custom
  };
  const handleSave = () => {
    dispatch({ type: ADD_SAVED_RECIPE, data: props.recipe });
  };

  return (
    <Card
      style={{ width: 300, margin: '0.3rem 0.1rem' }}
      cover={<Image width={300} alt={props.name} src={props.picture_url} />}
      actions={[
        <Link to="/custom">
          <Button onClick={handleEdit}>
            <Space>
              Edit
              <FontAwesomeIcon key="edit" icon="fa-solid fa-pen" />
            </Space>
          </Button>
        </Link>,
        <Button onClick={handleSave} disabled={state.savedRecipes.some((r) => r._id === props.recipe._id)}>
          {state.savedRecipes.some((r) => r._id === props.recipe._id) ? (
            <Space>
              Saved!
              <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />
            </Space>
          ) : (
            <Space>
              Save
              <FontAwesomeIcon key="save" icon="fa-solid fa-floppy-disk" />
            </Space>
          )}
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
