const Button = (props) => {
    return <button className={props.className} value={props.value} onClick={() => {props.onClickFunction(props.value)}}>
        {props.value}
    </button>
}

export default Button; 