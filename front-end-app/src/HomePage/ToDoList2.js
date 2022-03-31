import React, {Fragment, useState} from 'react';
import ToDoItem2 from "./ToDoItem2";

const ToDoList2 = () => {
    console.log('我是ToDoList2');
    const [inputValue, setInputValue] = useState('');
    const [list, setList] = useState([]);

    // 第一次尝试的时候忘记bind UI上面的index到这里来，导致每次删除是从index 0,1,2,3....这样删除
    const handleItemDelete = (index) => {
        console.log('我是ToDoList2，function里面的');
        // 方法1：javascript的删除方法： Array.splice(position,num);
        // const newList = this.state.list;
        // newList.splice(index, 1);

        //方法二：用filter，object = object.filter(function) 如果function outputs true,该element留下
        // 注意：newList.splice是作用于newList, 会改变object本身，但是filter不会改变object本身，所以要object = object.filter()
        let newList = list;
        newList = newList.filter(element => newList.indexOf(element) !== index);

        setList(newList);
    }

    const addItemToList = () => {
        setInputValue('');
        setList([...list, inputValue])
    }
    return (
        <Fragment>
            <input
                value = {inputValue}
                // inline需要添加()=>，否则没办法监听变化, 这里只有一个parameter，所以就省略了括号
                onChange={event => setInputValue(event.target.value)}
            />
            {/*这个需要添加()=>, 因为inline function 否则会fire action immediately，然后不停re-render报错
            要注意： https://stackoverflow.com/questions/50350202/when-to-use-inline-function-on-button-onclick-event-javascript-react-js*/}
            <button onClick={() => setList([...list, inputValue])}>Submit Inline function</button>
            <button onClick={addItemToList}>Submit with outside function</button>
            <ul>
                {
                    list.map((item, index) => {
                        return (
                            // 这里要注意！！！要把key里面的index传到handleItemDelete这个function里面，不然下面的index会错位，放在bind里面去
                            // <li
                            //     key={index}
                            //     //这个onClick不需要添加()=>
                            //     onClick={handleItemDelete(index)}
                            // >
                            //     {item}
                            // </li>
                            <ToDoItem2 item={item} index={index} onBtnClick={handleItemDelete}/>
                        )
                        }
                    )
                }
            </ul>
        </Fragment>
    );
}
export default ToDoList2;


















