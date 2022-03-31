import React, {useState} from "react";
import {createStore} from "redux";
import ToDoList2 from "./ToDoList2";
import ToDoItem2 from "./ToDoItem2";

const HomePage = () => {
    const [inputValue, setInputValue] = useState('');
    const [list, setList] = useState([]);
    const addItemToList = () => {
        setInputValue('');
        setList([...list, inputValue])
    }

    return (
        //分三个部分, 1、当前feature输入框，2、数字显示， 3、概率显示
        <>
            <input
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
            />
            <button onClick={addItemToList}>Add a new feature</button>
            <ul>
                {

                    list.map((item, index) => {

                            return (
                                <>
                                    <ToDoItem2
                                        item={item}
                                        index={index}
                                    />

                                </>

                            )
                        }
                    )
                }
            </ul>
        </>
    )
}
export default HomePage;