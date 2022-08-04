const Content = (props) => {
  const style = {
    backgroundColor: 'var(--ingre-light-red)',
    padding: '1rem',
    width: '100%'
  };

  return <div style={style}>{props.children}</div>;
};
export default Content;
