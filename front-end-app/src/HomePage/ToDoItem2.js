import React from "react";

const ToDoItem2 = ({item, index, onBtnClick}) => {
    return (
        <li key={index}
            onClick={()=>onBtnClick(index)}
            >
            {item}
        </li>
    )
}
export default ToDoItem2;