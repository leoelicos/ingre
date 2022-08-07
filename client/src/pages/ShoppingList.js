const ShoppingList = (props) => {
  useEffect(() => {
    document.title = 'ingré Shopping List';
  }, []);
  return <div className="custom">{props.children}</div>;
};
export default ShoppingList;
