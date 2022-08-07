const TapOff = (props) => {
  useEffect(() => {
    document.title = 'ingré Tap Off';
  }, []);

  return <div className="custom">{props.children}</div>;
};
export default TapOff;
